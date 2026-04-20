package com.realestate.crm.dto.response;

import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private String message;
    private Boolean isRead;
    private Long propertyId;
    private String propertyTitle;
    private Long requirementId;
    private String buyerName;
    private LocalDateTime createdAt;

    public NotificationResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public String getPropertyTitle() { return propertyTitle; }
    public void setPropertyTitle(String propertyTitle) { this.propertyTitle = propertyTitle; }
    public Long getRequirementId() { return requirementId; }
    public void setRequirementId(Long requirementId) { this.requirementId = requirementId; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final NotificationResponse r = new NotificationResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder message(String v) { r.message = v; return this; }
        public Builder isRead(Boolean v) { r.isRead = v; return this; }
        public Builder propertyId(Long v) { r.propertyId = v; return this; }
        public Builder propertyTitle(String v) { r.propertyTitle = v; return this; }
        public Builder requirementId(Long v) { r.requirementId = v; return this; }
        public Builder buyerName(String v) { r.buyerName = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public NotificationResponse build() { return r; }
    }
}
