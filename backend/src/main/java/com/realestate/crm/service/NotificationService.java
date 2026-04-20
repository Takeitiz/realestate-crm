package com.realestate.crm.service;

import com.realestate.crm.dto.response.NotificationResponse;
import com.realestate.crm.entity.Notification;
import com.realestate.crm.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public List<NotificationResponse> findByUser(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long countUnread(Long userId) {
        return repository.countByUserIdAndIsReadFalse(userId);
    }

    public void markRead(Long id) {
        repository.findById(id).ifPresent(n -> { n.setIsRead(true); repository.save(n); });
    }

    public void markAllRead(Long userId) {
        repository.findByUserIdOrderByCreatedAtDesc(userId)
            .forEach(n -> { n.setIsRead(true); repository.save(n); });
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId()).message(n.getMessage()).isRead(n.getIsRead())
            .propertyId(n.getProperty() != null ? n.getProperty().getId() : null)
            .propertyTitle(n.getProperty() != null ? n.getProperty().getTitle() : null)
            .requirementId(n.getRequirement() != null ? n.getRequirement().getId() : null)
            .buyerName(n.getRequirement() != null ? n.getRequirement().getBuyerName() : null)
            .createdAt(n.getCreatedAt())
            .build();
    }
}
