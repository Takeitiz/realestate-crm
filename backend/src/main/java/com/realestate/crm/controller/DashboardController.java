package com.realestate.crm.controller;

import com.realestate.crm.entity.User;
import com.realestate.crm.enums.AppointmentStatus;
import com.realestate.crm.enums.PropertyStatus;
import com.realestate.crm.enums.UserRole;
import com.realestate.crm.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final PropertyRepository propertyRepository;
    private final ActivityLogRepository activityLogRepository;
    private final AppointmentRepository appointmentRepository;
    private final DealRepository dealRepository;
    private final UserRepository userRepository;

    public DashboardController(PropertyRepository propertyRepository,
                                ActivityLogRepository activityLogRepository,
                                AppointmentRepository appointmentRepository,
                                DealRepository dealRepository,
                                UserRepository userRepository) {
        this.propertyRepository = propertyRepository;
        this.activityLogRepository = activityLogRepository;
        this.appointmentRepository = appointmentRepository;
        this.dealRepository = dealRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        // Property counts — single findAll() call
        List<com.realestate.crm.entity.Property> allProps = propertyRepository.findAll();
        long total = allProps.size();
        long available = allProps.stream().filter(p -> p.getStatus() == PropertyStatus.AVAILABLE).count();
        long reserved  = allProps.stream().filter(p -> p.getStatus() == PropertyStatus.RESERVED).count();
        long sold      = allProps.stream().filter(p -> p.getStatus() == PropertyStatus.SOLD || p.getStatus() == PropertyStatus.RENTED).count();
        long stale     = allProps.stream()
                .filter(p -> p.getUpdatedAt() != null &&
                        ChronoUnit.DAYS.between(p.getUpdatedAt(), LocalDateTime.now()) > 30)
                .count();

        // Deal pipeline counts
        Map<String, Long> dealsByStage = new LinkedHashMap<>();
        dealRepository.countByStage().forEach(row -> {
            dealsByStage.put(row[0].toString(), ((Number) row[1]).longValue());
        });

        // Agent leaderboard (manager only)
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        if (caller.getRole() == UserRole.MANAGER) {
            dealRepository.agentLeaderboard().forEach(row -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("agentName", row[0]);
                entry.put("totalDeals", row[1]);
                entry.put("closedDeals", row[2]);
                leaderboard.add(entry);
            });
        }

        // Recent activity (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
        Map<String, Long> dailyActivity = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            String day = LocalDateTime.now().minus(i, ChronoUnit.DAYS).toLocalDate().toString();
            dailyActivity.put(day, 0L);
        }
        activityLogRepository.findAll().stream()
                .filter(a -> a.getCreatedAt().isAfter(weekAgo))
                .forEach(a -> {
                    String day = a.getCreatedAt().toLocalDate().toString();
                    dailyActivity.merge(day, 1L, Long::sum);
                });

        // Upcoming appointments (next 7 days)
        LocalDateTime now2 = LocalDateTime.now();
        LocalDateTime nextWeek = now2.plus(7, ChronoUnit.DAYS);
        long upcomingAppts = appointmentRepository.findUpcoming(
                AppointmentStatus.SCHEDULED, now2, nextWeek).size();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        result.put("available", available);
        result.put("reserved", reserved);
        result.put("sold", sold);
        result.put("stale", stale);
        result.put("dealsByStage", dealsByStage);
        result.put("leaderboard", leaderboard);
        result.put("dailyActivity", dailyActivity);
        result.put("upcomingAppointments", upcomingAppts);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/map-data")
    public ResponseEntity<List<Map<String, Object>>> getMapData() {
        return ResponseEntity.ok(
                propertyRepository.findAll().stream()
                        .filter(p -> p.getLat() != null && p.getLng() != null)
                        .map(p -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", p.getId());
                            m.put("title", p.getTitle());
                            m.put("status", p.getStatus().name());
                            m.put("price", p.getPrice());
                            m.put("priceUnit", p.getPriceUnit());
                            m.put("district", p.getDistrict());
                            m.put("lat", p.getLat());
                            m.put("lng", p.getLng());
                            return m;
                        })
                        .collect(Collectors.toList())
        );
    }
}
