package com.realestate.crm.controller;

import com.realestate.crm.dto.response.NotificationResponse;
import com.realestate.crm.entity.User;
import com.realestate.crm.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.findByUser(user.getId()));
    }

    @GetMapping("/count-unread")
    public ResponseEntity<Map<String, Long>> countUnread(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("count", service.countUnread(user.getId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        service.markRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User user) {
        service.markAllRead(user.getId());
        return ResponseEntity.ok().build();
    }
}
