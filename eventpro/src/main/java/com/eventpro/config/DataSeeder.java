package com.eventpro.config;

import com.eventpro.

        entity.AppUser;
import com.eventpro.entity.Event;
import com.eventpro.entity.EventStatus;
import com.eventpro.entity.Role;
import com.eventpro.repository.EventRepository;
import com.eventpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Seeds the in-memory H2 database on startup with data equivalent to
 * src/constants.ts (MOCK_EVENTS, MOCK_ADMIN_STATS) so the API is immediately
 * testable without a separate setup step. Remove or guard this with a
 * profile check before deploying to a real environment.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // already seeded
        }

        AppUser admin = userRepository.save(AppUser.builder()
                .name("Alex Sterling")
                .email("admin@eventpro.com")
                .password(passwordEncoder.encode("admin12345"))
                .role(Role.ADMIN)
                .avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=admin")
                .registeredCount(24)
                .upcomingCount(8)
                .completedCount(156)
                .build());

        eventRepository.save(Event.builder()
                .title("Global Tech Summit 2026")
                .category("Corporate")
                .location("San Francisco, CA")
                .venueAddress("Moscone Center, 747 Howard St")
                .date(LocalDate.of(2026, 10, 12))
                .time(LocalTime.of(9, 0))
                .registered(450)
                .capacity(500)
                .imageUrl("https://images.unsplash.com/photo-1540575861501-7ad05823c951")
                .status(EventStatus.UPCOMING)
                .featured(true)
                .description("Join the leaders in digital transformation for a day of networking.")
                .price(1500.0)
                .contactEmail("summit@techglobe.com")
                .contactPhone("+1 415-555-0123")
                .organizer(admin)
                .build());

        eventRepository.save(Event.builder()
                .title("Winter Gala Dinner")
                .category("Wedding")
                .location("London, UK")
                .venueAddress("The Ritz, 150 Piccadilly")
                .date(LocalDate.of(2026, 10, 24))
                .time(LocalTime.of(19, 30))
                .registered(120)
                .capacity(200)
                .status(EventStatus.PENDING)
                .price(0.0)
                .contactEmail("gala@winterevents.co.uk")
                .contactPhone("+44 20 7946 0958")
                .organizer(admin)
                .build());

        eventRepository.save(Event.builder()
                .title("Design Masters Workshop")
                .category("Workshops")
                .location("Remote / Online")
                .venueAddress("Virtual Event Hub")
                .date(LocalDate.of(2026, 11, 5))
                .time(LocalTime.of(10, 0))
                .registered(32)
                .capacity(50)
                .status(EventStatus.CONFIRMED)
                .price(500.0)
                .contactEmail("hello@designmasters.com")
                .contactPhone("+1 212-555-0892")
                .organizer(admin)
                .build());

        eventRepository.save(Event.builder()
                .title("Marketing Innovation Expo")
                .category("Conferences")
                .location("Tokyo International Forum")
                .venueAddress("3 Chome-5-1 Marunouchi, Chiyoda City")
                .date(LocalDate.of(2026, 12, 12))
                .time(LocalTime.of(9, 0))
                .registered(850)
                .capacity(1000)
                .status(EventStatus.LIVE)
                .price(2500.0)
                .contactEmail("expo@innovation-tokyo.jp")
                .contactPhone("+81 3-5555-1234")
                .organizer(admin)
                .build());
    }
}


