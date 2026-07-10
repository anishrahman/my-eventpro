# EventPro — Event Management REST API

A secure, full-featured event management backend built with **Spring Boot 3** and **Java 17**. EventPro lets users sign up, browse events, register (with capacity limits), and gives admins visibility into platform-wide stats — all behind JWT authentication and role-based access control.

---

##  Features

- **JWT Authentication** — Stateless signup/login flow using JSON Web Tokens (`jjwt`), with BCrypt password hashing.
- **Role-Based Access Control** — Three roles (`ADMIN`, `ORGANIZER`, `ATTENDEE`) enforced via Spring Security method security (`@PreAuthorize`).
- **Event Management** — Full CRUD for events (create, view, update, delete) plus a dedicated registration endpoint that enforces event capacity.
- **Layered Architecture** — Clean separation across Controller → Service → Repository, with dedicated request/response DTOs so API contracts never leak persistence models.
- **DTO Mapping via MapStruct** — Compile-time-generated mappers (no reflection) between entities and DTOs, paired with Lombok to eliminate boilerplate.
- **Centralized Exception Handling** — A `@ControllerAdvice`-based global handler returns consistent, structured error responses for cases like duplicate email signup, full-capacity events, and missing resources.
- **Bean Validation** — Request DTOs are validated at the API boundary using `@Valid`, `@NotBlank`, `@Email`, etc.
- **Admin Dashboard Endpoint** — Aggregated platform stats (user counts, event counts) restricted to `ADMIN` role.
- **Auto-Seeded Data** — A `CommandLineRunner`-based seeder populates the database with demo users and events on startup, so the API is testable immediately with no manual setup.

---

##  Tech Stack

| Layer            | Technology                                      |
|-------------------|--------------------------------------------------|
| Language           | Java 17                                          |
| Framework          | Spring Boot 3.2.5                                |
| Security           | Spring Security, JWT (`io.jsonwebtoken`)         |
| Persistence        | Spring Data JPA / Hibernate                      |
| Database           | H2 (in-memory, dev) — swappable for MySQL/PostgreSQL |
| Mapping            | MapStruct                                        |
| Boilerplate        | Lombok                                           |
| Validation         | Jakarta Bean Validation                          |
| Build Tool         | Maven                                            |

---

##  Project Structure

```
src/main/java/com/eventpro/
├── config/          # Security config, CORS, data seeder
├── controller/       # REST controllers (Auth, Event, User, Admin)
├── dto/
│   ├── request/       # Incoming request payloads (validated)
│   └── response/       # Outgoing response payloads
├── entity/           # JPA entities (AppUser, Event, Role, EventStatus)
├── exception/         # Custom exceptions + global exception handler
├── mapper/            # MapStruct entity ↔ DTO mappers
├── repository/        # Spring Data JPA repositories
├── security/          # JWT filter / token utilities
└── service/           # Business logic interfaces + implementations
```

---

## 🔌 API Endpoints

### Auth — `/api/auth` (public)
| Method | Endpoint         | Description              |
|--------|-------------------|----------------------------|
| POST   | `/api/auth/signup` | Register a new user       |
| POST   | `/api/auth/login`  | Authenticate and receive a JWT |

### Events — `/api/events`
| Method | Endpoint                     | Access             | Description                   |
|--------|--------------------------------|----------------------|---------------------------------|
| GET    | `/api/events`                  | Public              | List all events                |
| GET    | `/api/events/{id}`              | Public              | Get event details              |
| POST   | `/api/events`                   | Authenticated       | Create a new event             |
| PUT    | `/api/events/{id}`              | Authenticated       | Update an event                |
| DELETE | `/api/events/{id}`              | Authenticated       | Delete an event                |
| POST   | `/api/events/{id}/register`      | Authenticated       | Register the current user for an event (capacity-checked) |

### Users — `/api/users`
| Method | Endpoint       | Access        | Description                |
|--------|------------------|-----------------|-------------------------------|
| GET    | `/api/users/me`  | Authenticated  | Get the current user's profile |

### Admin — `/api/admin`
| Method | Endpoint         | Access        | Description                |
|--------|--------------------|-----------------|-------------------------------|
| GET    | `/api/admin/stats`  | `ADMIN` only    | Platform-wide statistics (user/event counts) |

All authenticated endpoints require a `Bearer <token>` header obtained from `/api/auth/login`.

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.6+

### Run locally
```bash
git clone <repo-url>
cd eventpro-backend
mvn spring-boot:run
```

The API starts on **`http://localhost:8080`**. An in-memory H2 database is seeded automatically on startup with demo users and events — no manual setup required.

- H2 console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:eventprodb`)
- Default seeded admin login: `admin@eventpro.com` / `admin12345`

### Configuration

Key settings live in `src/main/resources/application.yml`:

```yaml
eventpro:
  jwt:
    secret: ${JWT_SECRET:replace-this-with-a-long-random-secret-key-min-256-bits}
    expiration-ms: 86400000   # 24 hours
```

>  In production, set `JWT_SECRET` as an environment variable — never hardcode secrets.

To use MySQL/PostgreSQL instead of H2, update the `spring.datasource` block and swap the H2 dependency in `pom.xml` for the appropriate driver.

---

##  Testing

```bash
mvn test
```

Includes Spring Boot Test and Spring Security Test dependencies for controller/service-level test coverage.

---

##  Notes

- CORS is currently configured for a Vite dev server origin (`http://localhost:5173`) — update `SecurityConfig` for other frontend origins.
- The data seeder skips seeding if the database is already populated, making it safe to restart the app without duplicating data.
