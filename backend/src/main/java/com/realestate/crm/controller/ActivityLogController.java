package com.realestate.crm.controller;

import com.realestate.crm.entity.ActivityLog;
import com.realestate.crm.entity.User;
import com.realestate.crm.repository.ActivityLogRepository;
import com.realestate.crm.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties/{propertyId}/activity")
public class ActivityLogController {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public ActivityLogController(ActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getActivity(
            @PathVariable Long propertyId,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<Map<String, Object>> logs = activityLogRepository
                .findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .map(log -> Map.<String, Object>of(
                        "id", log.getId(),
                        "action", log.getAction().name(),
                        "detail", log.getDetail() != null ? log.getDetail() : "",
                        "userName", log.getUser() != null ? log.getUser().getFullName() : "Hệ thống",
                        "createdAt", log.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(logs);
    }
}
