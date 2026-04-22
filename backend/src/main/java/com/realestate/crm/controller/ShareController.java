package com.realestate.crm.controller;

import com.realestate.crm.dto.response.PropertyResponse;
import com.realestate.crm.entity.Property;
import com.realestate.crm.entity.User;
import com.realestate.crm.repository.PropertyRepository;
import com.realestate.crm.repository.UserRepository;
import com.realestate.crm.service.PropertyService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
public class ShareController {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PropertyService propertyService;

    @Value("${app.share.expire-days:7}")
    private int expireDays;

    public ShareController(PropertyRepository propertyRepository,
                           UserRepository userRepository,
                           PropertyService propertyService) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.propertyService = propertyService;
    }

    /** Generate or refresh share token for a property (auth required) */
    @PostMapping("/api/properties/{id}/share")
    public ResponseEntity<Map<String, Object>> generateShareLink(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy BĐS"));

        String token = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(expireDays);
        property.setShareToken(token);
        property.setShareExpiresAt(expiresAt);
        propertyRepository.save(property);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "expiresAt", expiresAt.toString(),
                "expireDays", expireDays
        ));
    }

    /** Public endpoint — no authentication, masked seller info */
    @GetMapping("/api/public/properties/{token}")
    public ResponseEntity<?> getPublicProperty(@PathVariable String token) {
        Property property = propertyRepository.findByShareToken(token)
                .orElse(null);

        if (property == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Liên kết không hợp lệ"));
        }
        if (property.getShareExpiresAt() != null && property.getShareExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(410).body(Map.of("error", "Liên kết đã hết hạn"));
        }

        // Always mask seller info for public view
        PropertyResponse response = propertyService.findByIdPublic(property.getId());
        return ResponseEntity.ok(response);
    }
}
