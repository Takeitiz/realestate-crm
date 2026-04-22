package com.realestate.crm.controller;

import com.realestate.crm.entity.*;
import com.realestate.crm.enums.AppointmentStatus;
import com.realestate.crm.enums.DealStage;
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
@RequestMapping("/api/reports")
public class ReportController {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final ActivityLogRepository activityLogRepository;
    private final AppointmentRepository appointmentRepository;
    private final DealRepository dealRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public ReportController(UserRepository userRepository,
                             PropertyRepository propertyRepository,
                             ActivityLogRepository activityLogRepository,
                             AppointmentRepository appointmentRepository,
                             DealRepository dealRepository,
                             PriceHistoryRepository priceHistoryRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.activityLogRepository = activityLogRepository;
        this.appointmentRepository = appointmentRepository;
        this.dealRepository = dealRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    /** Agent performance report (manager only) */
    @GetMapping("/agents")
    public ResponseEntity<?> agentReport(
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        if (caller.getRole() != UserRole.MANAGER)
            return ResponseEntity.status(403).body("Chỉ manager mới được xem báo cáo này");

        LocalDateTime since = LocalDateTime.now().minus(days, ChronoUnit.DAYS);

        List<User> agents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.AGENT)
                .collect(Collectors.toList());

        List<Map<String, Object>> report = agents.stream().map(agent -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("agentId", agent.getId());
            row.put("agentName", agent.getFullName());
            row.put("username", agent.getUsername());

            // Properties added
            long propsTotal = propertyRepository.findAll().stream()
                    .filter(p -> p.getCreatedBy() != null && p.getCreatedBy().getId().equals(agent.getId())).count();
            long propsSince = propertyRepository.findAll().stream()
                    .filter(p -> p.getCreatedBy() != null && p.getCreatedBy().getId().equals(agent.getId())
                            && p.getCreatedAt() != null && p.getCreatedAt().isAfter(since)).count();

            row.put("totalProperties", propsTotal);
            row.put("propertiesInPeriod", propsSince);

            // Appointments
            List<Appointment> appts = appointmentRepository.findByAgentIdOrderByScheduledAtDesc(agent.getId());
            long apptTotal = appts.size();
            long apptCompleted = appts.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
            long apptSince = appts.stream().filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isAfter(since)).count();

            row.put("totalAppointments", apptTotal);
            row.put("completedAppointments", apptCompleted);
            row.put("appointmentsInPeriod", apptSince);

            // Deals
            List<Deal> deals = dealRepository.findByAgentIdOrderByUpdatedAtDesc(agent.getId());
            long dealsTotal = deals.size();
            long dealsClosed = deals.stream().filter(d -> d.getStage() == DealStage.CLOSED).count();
            long dealsSince = deals.stream().filter(d -> d.getCreatedAt() != null && d.getCreatedAt().isAfter(since)).count();

            row.put("totalDeals", dealsTotal);
            row.put("closedDeals", dealsClosed);
            row.put("dealsInPeriod", dealsSince);
            row.put("closeRate", dealsTotal > 0 ? String.format("%.0f%%", (dealsClosed * 100.0 / dealsTotal)) : "—");

            // Activity count
            long activityCount = activityLogRepository.findAll().stream()
                    .filter(a -> a.getUser() != null && a.getUser().getId().equals(agent.getId())
                            && a.getCreatedAt() != null && a.getCreatedAt().isAfter(since)).count();
            row.put("activityCount", activityCount);

            return row;
        }).sorted(Comparator.comparingLong(r -> -((Number) r.get("closedDeals")).longValue()))
          .collect(Collectors.toList());

        return ResponseEntity.ok(report);
    }

    /** Property health report - stale and price-changed listings */
    @GetMapping("/properties")
    public ResponseEntity<Map<String, Object>> propertyReport(
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        // Stale properties (no update > staleDays)
        int staleDays = 30;
        LocalDateTime cutoff = LocalDateTime.now().minus(staleDays, ChronoUnit.DAYS);
        List<Map<String, Object>> stale = propertyRepository.findAll().stream()
                .filter(p -> p.getUpdatedAt() != null && p.getUpdatedAt().isBefore(cutoff))
                .sorted(Comparator.comparing(Property::getUpdatedAt))
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", p.getId());
                    m.put("title", p.getTitle());
                    m.put("district", p.getDistrict());
                    m.put("status", p.getStatus().name());
                    m.put("agentName", p.getCreatedBy() != null ? p.getCreatedBy().getFullName() : "?");
                    long daysSince = ChronoUnit.DAYS.between(p.getUpdatedAt(), LocalDateTime.now());
                    m.put("daysSinceUpdate", daysSince);
                    m.put("updatedAt", p.getUpdatedAt().toString());
                    return m;
                }).collect(Collectors.toList());

        // Price change summary (last 30 days)
        LocalDateTime since = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        List<Map<String, Object>> priceChanges = priceHistoryRepository.findAll().stream()
                .filter(h -> h.getChangedAt() != null && h.getChangedAt().isAfter(since))
                .sorted(Comparator.comparing(PriceHistory::getChangedAt).reversed())
                .limit(20)
                .map(h -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("propertyId", h.getProperty().getId());
                    m.put("propertyTitle", h.getProperty().getTitle());
                    m.put("oldPrice", h.getOldPrice());
                    m.put("newPrice", h.getNewPrice());
                    m.put("priceUnit", h.getPriceUnit());
                    m.put("changedBy", h.getChangedBy() != null ? h.getChangedBy().getFullName() : "?");
                    m.put("changedAt", h.getChangedAt().toString());
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("staleProperties", stale);
        result.put("staleCount", stale.size());
        result.put("priceChanges", priceChanges);

        return ResponseEntity.ok(result);
    }

    /** Export agent report as CSV */
    @GetMapping("/agents/export")
    public ResponseEntity<byte[]> exportAgentsCsv(
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        if (caller.getRole() != UserRole.MANAGER)
            return ResponseEntity.status(403).build();

        StringBuilder csv = new StringBuilder();
        csv.append("Tên MG,Username,Tổng BĐS,BĐS trong kỳ,Tổng lịch hẹn,Lịch đã xem,Tổng deal,Deal chốt,Tỷ lệ chốt,Hoạt động\n");

        LocalDateTime since = LocalDateTime.now().minus(days, ChronoUnit.DAYS);
        List<User> agents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.AGENT).collect(Collectors.toList());

        for (User agent : agents) {
            long propsTotal = propertyRepository.findAll().stream()
                    .filter(p -> p.getCreatedBy() != null && p.getCreatedBy().getId().equals(agent.getId())).count();
            long propsSince = propertyRepository.findAll().stream()
                    .filter(p -> p.getCreatedBy() != null && p.getCreatedBy().getId().equals(agent.getId())
                            && p.getCreatedAt() != null && p.getCreatedAt().isAfter(since)).count();
            List<Appointment> appts = appointmentRepository.findByAgentIdOrderByScheduledAtDesc(agent.getId());
            long apptCompleted = appts.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
            List<Deal> deals = dealRepository.findByAgentIdOrderByUpdatedAtDesc(agent.getId());
            long dealsClosed = deals.stream().filter(d -> d.getStage() == DealStage.CLOSED).count();
            long dealsTotal = deals.size();
            String closeRate = dealsTotal > 0 ? String.format("%.0f%%", (dealsClosed * 100.0 / dealsTotal)) : "—";
            long activityCount = activityLogRepository.findAll().stream()
                    .filter(a -> a.getUser() != null && a.getUser().getId().equals(agent.getId())
                            && a.getCreatedAt().isAfter(since)).count();

            csv.append(String.format("%s,%s,%d,%d,%d,%d,%d,%d,%s,%d\n",
                    agent.getFullName(), agent.getUsername(), propsTotal, propsSince,
                    appts.size(), apptCompleted, dealsTotal, dealsClosed, closeRate, activityCount));
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"agent-report.csv\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(("\uFEFF" + csv).getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
