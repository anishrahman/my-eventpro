import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8080/api";
const EVENT_STATUSES = ["UPCOMING", "LIVE", "CONFIRMED", "PAST", "PENDING"];
const CATEGORIES = ["Conference", "Workshop", "Networking", "Concert", "Seminar", "Sport", "Festival", "Other"];

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("ep_token"));
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem("ep_user")); } catch { return null; }
    });

    const login = (tok, usr) => {
        setToken(tok); setUser(usr);
        localStorage.setItem("ep_token", tok);
        localStorage.setItem("ep_user", JSON.stringify(usr));
    };
    const logout = () => {
        setToken(null); setUser(null);
        localStorage.removeItem("ep_token");
        localStorage.removeItem("ep_user");
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAdmin: user?.role === "ADMIN" }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── API helper ───────────────────────────────────────────────────────────────
function useApi() {
    const { token } = useAuth();
    const call = useCallback(async (path, opts = {}) => {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(err.message || "Request failed");
        }
        if (res.status === 204) return null;
        return res.json();
    }, [token]);
    return call;
}

// ─── Utility Components ───────────────────────────────────────────────────────
function Spinner() {
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div className="spinner" />
        </div>
    );
}

function Badge({ status }) {
    const colors = {
        LIVE: "#10b981", UPCOMING: "#6366f1", CONFIRMED: "#059669",
        PAST: "#6b7280", PENDING: "#f59e0b",
    };
    return (
        <span style={{
            background: colors[status] + "20", color: colors[status],
            border: `1px solid ${colors[status]}40`,
            padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, letterSpacing: ".04em"
        }}>{status}</span>
    );
}

function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    if (!msg) return null;
    return (
        <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            background: type === "error" ? "#ef4444" : "#10b981",
            color: "#fff", padding: "12px 20px", borderRadius: 10,
            boxShadow: "0 4px 20px rgba(0,0,0,.18)", fontSize: 14, maxWidth: 320,
            display: "flex", alignItems: "center", gap: 10
        }}>
            <span>{type === "error" ? "✕" : "✓"}</span>
            <span>{msg}</span>
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20
        }} onClick={onClose}>
            <div style={{
                background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 600,
                maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.3)"
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b", lineHeight: 1
                    }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function FormField({ label, error, children }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
            {children}
            {error && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{error}</p>}
        </div>
    );
}

const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0",
    borderRadius: 8, fontSize: 14, boxSizing: "border-box",
    outline: "none", transition: "border .15s", background: "#f8fafc"
};

// ─── Auth Forms ───────────────────────────────────────────────────────────────
function AuthPage({ onDone }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const api = useApi();

    const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const e = {};
        if (mode === "signup" && !form.name.trim()) e.name = "Name is required";
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
        if (form.password.length < 8) e.password = "At least 8 characters";
        return e;
    };

    const submit = async () => {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true); setErrors({});
        try {
            const payload = mode === "login"
                ? { email: form.email, password: form.password }
                : { name: form.name, email: form.email, password: form.password };
            const data = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(payload) });
            login(data.token, data.user);
            onDone();
        } catch (err) {
            setErrors({ api: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0ea5e9 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 24px 60px rgba(0,0,0,.25)" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🎫</div>
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a" }}>EventPro</h1>
                    <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
                        {mode === "login" ? "Welcome back" : "Create your account"}
                    </p>
                </div>

                {errors.api && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
                        {errors.api}
                    </div>
                )}

                {mode === "signup" && (
                    <FormField label="Full Name" error={errors.name}>
                        <input style={inputStyle} placeholder="Jane Doe" value={form.name} onChange={set("name")} />
                    </FormField>
                )}
                <FormField label="Email" error={errors.email}>
                    <input style={inputStyle} type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} />
                </FormField>
                <FormField label="Password" error={errors.password}>
                    <input style={inputStyle} type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
                </FormField>

                <button onClick={submit} disabled={loading} style={{
                    width: "100%", padding: "12px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1, marginTop: 4
                }}>
                    {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
                </button>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
                            style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: 700, cursor: "pointer" }}>
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}

// ─── Event Form ───────────────────────────────────────────────────────────────
function EventForm({ initial = {}, onSave, onCancel, loading }) {
    const [form, setForm] = useState({
        title: "", category: "Conference", location: "", venueAddress: "",
        date: "", time: "", capacity: "", imageUrl: "", description: "",
        isFeatured: false, price: "", contactEmail: "", contactPhone: "",
        ...initial
    });
    const [errors, setErrors] = useState({});

    const set = k => e => {
        const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm(f => ({ ...f, [k]: v }));
    };

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.location.trim()) e.location = "Location is required";
        if (!form.date) e.date = "Date is required";
        if (!form.capacity || parseInt(form.capacity) < 1) e.capacity = "Capacity must be at least 1";
        return e;
    };

    const submit = () => {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
        const payload = {
            ...form,
            capacity: parseInt(form.capacity),
            price: form.price ? parseFloat(form.price) : 0,
            isFeatured: form.isFeatured || false,
        };
        onSave(payload);
    };

    const col2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

    return (
        <div>
            <div style={col2}>
                <FormField label="Title *" error={errors.title}>
                    <input style={inputStyle} value={form.title} onChange={set("title")} placeholder="Event title" />
                </FormField>
                <FormField label="Category *">
                    <select style={inputStyle} value={form.category} onChange={set("category")}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                </FormField>
            </div>
            <div style={col2}>
                <FormField label="Location *" error={errors.location}>
                    <input style={inputStyle} value={form.location} onChange={set("location")} placeholder="City, Country" />
                </FormField>
                <FormField label="Venue Address">
                    <input style={inputStyle} value={form.venueAddress} onChange={set("venueAddress")} placeholder="123 Main St" />
                </FormField>
            </div>
            <div style={col2}>
                <FormField label="Date *" error={errors.date}>
                    <input style={inputStyle} type="date" value={form.date} onChange={set("date")} />
                </FormField>
                <FormField label="Time">
                    <input style={inputStyle} type="time" value={form.time} onChange={set("time")} />
                </FormField>
            </div>
            <div style={col2}>
                <FormField label="Capacity *" error={errors.capacity}>
                    <input style={inputStyle} type="number" min="1" value={form.capacity} onChange={set("capacity")} placeholder="500" />
                </FormField>
                <FormField label="Price (₹)">
                    <input style={inputStyle} type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="0" />
                </FormField>
            </div>
            <FormField label="Image URL">
                <input style={inputStyle} value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." />
            </FormField>
            <FormField label="Description">
                <textarea style={{ ...inputStyle, height: 80, resize: "vertical" }} value={form.description} onChange={set("description")} placeholder="About this event…" />
            </FormField>
            <div style={col2}>
                <FormField label="Contact Email">
                    <input style={inputStyle} type="email" value={form.contactEmail} onChange={set("contactEmail")} />
                </FormField>
                <FormField label="Contact Phone">
                    <input style={inputStyle} value={form.contactPhone} onChange={set("contactPhone")} />
                </FormField>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 20 }}>
                <input type="checkbox" checked={form.isFeatured} onChange={set("isFeatured")} />
                <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Mark as Featured</span>
            </label>
            <div style={{ display: "flex", gap: 10 }}>
                <button onClick={onCancel} style={{
                    flex: 1, padding: "11px", background: "#f1f5f9", border: "none", borderRadius: 8,
                    fontWeight: 600, cursor: "pointer", color: "#475569"
                }}>Cancel</button>
                <button onClick={submit} disabled={loading} style={{
                    flex: 2, padding: "11px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    border: "none", borderRadius: 8, color: "#fff", fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1
                }}>
                    {loading ? "Saving…" : "Save Event"}
                </button>
            </div>
        </div>
    );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onView, onEdit, onDelete, onRegister, canManage }) {
    const pct = event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0;
    return (
        <div style={{
            background: "#fff", borderRadius: 16, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,.07)", border: "1px solid #f1f5f9",
            display: "flex", flexDirection: "column", transition: "box-shadow .2s, transform .2s",
        }}
             onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(79,70,229,.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
             onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.07)"; e.currentTarget.style.transform = ""; }}
        >
            <div style={{
                height: 160, background: event.imageUrl
                    ? `url(${event.imageUrl}) center/cover`
                    : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                position: "relative"
            }}>
                {event.isFeatured && (
                    <span style={{
                        position: "absolute", top: 12, left: 12, background: "#f59e0b",
                        color: "#fff", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700
                    }}>⭐ Featured</span>
                )}
                <div style={{ position: "absolute", top: 12, right: 12 }}>
                    <Badge status={event.status} />
                </div>
            </div>

            <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".06em" }}>
            {event.category}
          </span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
                    {event.title}
                </h3>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>📍 {event.location}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                    📅 {event.date} {event.time && `· ${event.time.slice(0, 5)}`}
                </div>

                <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                        <span>{event.registered}/{event.capacity} registered</span>
                        <span style={{ fontWeight: 600, color: pct >= 90 ? "#ef4444" : "#4f46e5" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                            height: "100%", width: `${pct}%`,
                            background: pct >= 90 ? "#ef4444" : "linear-gradient(90deg, #4f46e5, #7c3aed)",
                            borderRadius: 3, transition: "width .4s"
                        }} />
                    </div>
                </div>

                {event.price > 0 && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#059669", marginBottom: 10 }}>
                        ₹{event.price.toLocaleString()}
                    </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <button onClick={() => onView(event)} style={{
                        flex: 1, padding: "8px", background: "#f8fafc", border: "1.5px solid #e2e8f0",
                        borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151"
                    }}>View</button>
                    {canManage && (
                        <>
                            <button onClick={() => onEdit(event)} style={{
                                flex: 1, padding: "8px", background: "#eef2ff", border: "none",
                                borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#4f46e5"
                            }}>Edit</button>
                            <button onClick={() => onDelete(event.id)} style={{
                                padding: "8px 12px", background: "#fef2f2", border: "none",
                                borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#ef4444"
                            }}>🗑</button>
                        </>
                    )}
                    {!canManage && onRegister && (
                        <button onClick={() => onRegister(event.id)} disabled={event.registered >= event.capacity} style={{
                            flex: 1, padding: "8px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
                            cursor: event.registered >= event.capacity ? "not-allowed" : "pointer",
                            color: "#fff", opacity: event.registered >= event.capacity ? .5 : 1
                        }}>
                            {event.registered >= event.capacity ? "Full" : "Register"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────
function EventDetail({ event, onClose }) {
    const pct = event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0;
    return (
        <Modal title="Event Details" onClose={onClose}>
            <div style={{
                height: 200, background: event.imageUrl
                    ? `url(${event.imageUrl}) center/cover`
                    : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                borderRadius: 12, marginBottom: 20, position: "relative"
            }}>
                <div style={{ position: "absolute", top: 12, right: 12 }}><Badge status={event.status} /></div>
            </div>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{event.title}</h2>
            <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 600, marginBottom: 16 }}>{event.category}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                    ["📍 Location", event.location],
                    ["🏛 Venue", event.venueAddress || "–"],
                    ["📅 Date", event.date],
                    ["🕐 Time", event.time ? event.time.slice(0, 5) : "–"],
                    ["👥 Registered", `${event.registered} / ${event.capacity}`],
                    ["💰 Price", event.price > 0 ? `₹${event.price.toLocaleString()}` : "Free"],
                ].map(([label, val]) => (
                    <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>{val}</div>
                    </div>
                ))}
            </div>

            <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    <span>Capacity utilization</span>
                    <span style={{ fontWeight: 700, color: pct >= 90 ? "#ef4444" : "#4f46e5" }}>{pct}%</span>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                        height: "100%", width: `${pct}%`,
                        background: pct >= 90 ? "#ef4444" : "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: 4
                    }} />
                </div>
            </div>

            {event.description && (
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{event.description}</p>
                </div>
            )}

            {(event.contactEmail || event.contactPhone) && (
                <div style={{ fontSize: 13, color: "#64748b" }}>
                    {event.contactEmail && <div>✉ {event.contactEmail}</div>}
                    {event.contactPhone && <div>📞 {event.contactPhone}</div>}
                </div>
            )}
        </Modal>
    );
}

// ─── Admin Stats Dashboard ────────────────────────────────────────────────────
function AdminStats() {
    const [stats, setStats] = useState(null);
    const api = useApi();

    useEffect(() => {
        api("/admin/stats").then(setStats).catch(console.error);
    }, [api]);

    if (!stats) return <Spinner />;

    const cards = [
        { label: "Total Events", value: stats.totalEvents, icon: "🎪", color: "#6366f1" },
        { label: "Total Registrations", value: stats.totalRegistrations, icon: "👥", color: "#10b981" },
        { label: "Total Revenue", value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: "💰", color: "#f59e0b" },
        { label: "Avg. Utilization", value: `${Math.round(stats.averageCapacityUtilization || 0)}%`, icon: "📊", color: "#ec4899" },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            {cards.map(c => (
                <div key={c.label} style={{
                    background: "#fff", borderRadius: 14, padding: "20px 22px",
                    boxShadow: "0 2px 10px rgba(0,0,0,.06)", border: "1px solid #f1f5f9"
                }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: c.color }}>{c.value}</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 2, fontWeight: 500 }}>{c.label}</div>
                </div>
            ))}
        </div>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ view, setView }) {
    const { user, logout, isAdmin } = useAuth();
    return (
        <nav style={{
            background: "#fff", borderBottom: "1px solid #f1f5f9",
            padding: "0 24px", display: "flex", alignItems: "center",
            height: 60, position: "sticky", top: 0, zIndex: 100,
            boxShadow: "0 1px 8px rgba(0,0,0,.05)"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 32 }}>
                <span style={{ fontSize: 22 }}>🎫</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", letterSpacing: "-.02em" }}>EventPro</span>
            </div>

            <div style={{ display: "flex", gap: 4, flex: 1 }}>
                {[["events", "Events"], ...(isAdmin ? [["admin", "Dashboard"]] : [])].map(([v, label]) => (
                    <button key={v} onClick={() => setView(v)} style={{
                        padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                        fontWeight: 600, fontSize: 14,
                        background: view === v ? "#eef2ff" : "transparent",
                        color: view === v ? "#4f46e5" : "#64748b"
                    }}>{label}</button>
                ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{user?.role}</div>
                </div>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 15
                }}>{user?.name?.[0]?.toUpperCase()}</div>
                <button onClick={logout} style={{
                    padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                    background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#64748b"
                }}>Sign out</button>
            </div>
        </nav>
    );
}

// ─── Events Page ──────────────────────────────────────────────────────────────
function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [showCreate, setShowCreate] = useState(false);
    const [editEvent, setEditEvent] = useState(null);
    const [viewEvent, setViewEvent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const { isAdmin, token } = useAuth();
    const api = useApi();

    const notify = (msg, type = "success") => setToast({ msg, type });
    const clearToast = () => setToast(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api("/events");
            setEvents(data);
        } catch (e) { notify(e.message, "error"); }
        finally { setLoading(false); }
    }, [api]);

    useEffect(() => { load(); }, [load]);

    const filtered = events.filter(e => {
        const q = search.toLowerCase();
        const matchSearch = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
        const matchStatus = filterStatus === "ALL" || e.status === filterStatus;
        const matchCat = filterCategory === "ALL" || e.category === filterCategory;
        return matchSearch && matchStatus && matchCat;
    });

    const handleCreate = async (payload) => {
        setSaving(true);
        try {
            await api("/events", { method: "POST", body: JSON.stringify(payload) });
            notify("Event created!"); setShowCreate(false); load();
        } catch (e) { notify(e.message, "error"); }
        finally { setSaving(false); }
    };

    const handleEdit = async (payload) => {
        setSaving(true);
        try {
            await api(`/events/${editEvent.id}`, { method: "PUT", body: JSON.stringify(payload) });
            notify("Event updated!"); setEditEvent(null); load();
        } catch (e) { notify(e.message, "error"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this event?")) return;
        try {
            await api(`/events/${id}`, { method: "DELETE" });
            notify("Event deleted."); load();
        } catch (e) { notify(e.message, "error"); }
    };

    const handleRegister = async (id) => {
        if (!token) { notify("Sign in to register", "error"); return; }
        try {
            await api(`/events/${id}/register`, { method: "POST" });
            notify("You're registered! 🎉"); load();
        } catch (e) { notify(e.message, "error"); }
    };

    return (
        <div style={{ padding: "32px 24px", maxWidth: 1280, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0f172a" }}>Events</h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>{events.length} events total</p>
                </div>
                {token && (
                    <button onClick={() => setShowCreate(true)} style={{
                        padding: "10px 20px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        border: "none", borderRadius: 10, color: "#fff", fontWeight: 700,
                        fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(79,70,229,.3)"
                    }}>+ Create Event</button>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <input
                    style={{ ...inputStyle, width: 240, background: "#fff" }}
                    placeholder="Search events…"
                    value={search} onChange={e => setSearch(e.target.value)}
                />
                <select style={{ ...inputStyle, width: 150, background: "#fff" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="ALL">All Status</option>
                    {EVENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <select style={{ ...inputStyle, width: 160, background: "#fff" }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {(search || filterStatus !== "ALL" || filterCategory !== "ALL") && (
                    <button onClick={() => { setSearch(""); setFilterStatus("ALL"); setFilterCategory("ALL"); }}
                            style={{ ...inputStyle, width: "auto", background: "#fef2f2", color: "#ef4444", fontWeight: 600, cursor: "pointer", border: "1.5px solid #fecaca" }}>
                        Clear filters
                    </button>
                )}
            </div>

            {loading ? <Spinner /> : (
                filtered.length === 0
                    ? <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🎪</div>
                        <p style={{ fontSize: 16, fontWeight: 600 }}>No events found</p>
                        <p style={{ fontSize: 13 }}>Try adjusting your search or filters</p>
                    </div>
                    : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                        {filtered.map(ev => (
                            <EventCard
                                key={ev.id} event={ev}
                                onView={setViewEvent} onEdit={setEditEvent}
                                onDelete={handleDelete} onRegister={handleRegister}
                                canManage={isAdmin}
                            />
                        ))}
                    </div>
            )}

            {showCreate && (
                <Modal title="Create Event" onClose={() => setShowCreate(false)}>
                    <EventForm onSave={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
                </Modal>
            )}
            {editEvent && (
                <Modal title="Edit Event" onClose={() => setEditEvent(null)}>
                    <EventForm initial={editEvent} onSave={handleEdit} onCancel={() => setEditEvent(null)} loading={saving} />
                </Modal>
            )}
            {viewEvent && <EventDetail event={viewEvent} onClose={() => setViewEvent(null)} />}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={clearToast} />}
        </div>
    );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
function AdminPage() {
    const [toast, setToast] = useState(null);
    return (
        <div style={{ padding: "32px 24px", maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0f172a" }}>Admin Dashboard</h1>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Platform overview and statistics</p>
            </div>
            <AdminStats />
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell() {
    const { token } = useAuth();
    const [view, setView] = useState("events");
    const [authed, setAuthed] = useState(!!token);

    if (!authed) return <AuthPage onDone={() => setAuthed(true)} />;

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
            <Navbar view={view} setView={setView} />
            {view === "events" && <EventsPage />}
            {view === "admin" && <AdminPage />}
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
    return (
        <AuthProvider>
            <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input:focus, select:focus, textarea:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
        .spinner {
          width: 36px; height: 36px; border: 3px solid #e2e8f0;
          border-top-color: #6366f1; border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
            <AppShell />
        </AuthProvider>
    );
}
