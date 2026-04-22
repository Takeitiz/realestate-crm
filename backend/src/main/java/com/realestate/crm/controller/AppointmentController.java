package com.realestate.crm.controller;

import com.realestate.crm.entity.Appointment;
import com.realestate.crm.entity.Property;
import com.realestate.crm.entity.User;
import com.realestate.crm.enums.AppointmentStatus;
import com.realestate.crm.enums.UserRole;
import com.realestate.crm.repository.AppointmentRepository;
import com.realestate.crm.repository.PropertyRepository;
import com.realestate.crm.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                  PropertyRepository propertyRepository,
                                  UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<Appointment> list = caller.getRole() == UserRole.MANAGER
                ? appointmentRepository.findAllByOrderByScheduledAtDesc()
                : appointmentRepository.findByAgentIdOrderByScheduledAtDesc(caller.getId());
        return ResponseEntity.ok(list.stream().map(this::toMap).collect(Collectors.toList()));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Map<String, Object>>> getByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(appointmentRepository
                .findByPropertyIdOrderByScheduledAtDesc(propertyId)
                .stream().map(this::toMap).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User agent = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Long propertyId = Long.valueOf(body.get("propertyId").toString());
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy BĐS"));

        Appointment a = new Appointment();
        a.setProperty(property);
        a.setAgent(agent);
        a.setBuyerName(body.get("buyerName").toString());
        a.setBuyerPhone(body.containsKey("buyerPhone") ? body.get("buyerPhone").toString() : null);
        a.setScheduledAt(LocalDateTime.parse(body.get("scheduledAt").toString()));
        a.setNotes(body.containsKey("notes") ? body.get("notes").toString() : null);

        return ResponseEntity.ok(toMap(appointmentRepository.save(a)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));
        a.setStatus(AppointmentStatus.valueOf(body.get("status")));
        return ResponseEntity.ok(toMap(appointmentRepository.save(a)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Appointment a = appointmentRepository.findById(id).orElseThrow();
        boolean canDelete = a.getAgent().getId().equals(caller.getId()) || caller.getRole() == UserRole.MANAGER;
        if (!canDelete) return ResponseEntity.status(403).build();
        appointmentRepository.delete(a);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(Appointment a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("propertyId", a.getProperty().getId());
        m.put("propertyTitle", a.getProperty().getTitle());
        m.put("propertyDistrict", a.getProperty().getDistrict());
        m.put("agentName", a.getAgent().getFullName());
        m.put("buyerName", a.getBuyerName());
        m.put("buyerPhone", a.getBuyerPhone());
        m.put("scheduledAt", a.getScheduledAt().toString());
        m.put("status", a.getStatus().name());
        m.put("notes", a.getNotes() != null ? a.getNotes() : "");
        m.put("createdAt", a.getCreatedAt().toString());
        return m;
    }
}
