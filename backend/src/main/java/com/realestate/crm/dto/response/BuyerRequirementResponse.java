package com.realestate.crm.dto.response;

import com.realestate.crm.enums.PropertyType;
import com.realestate.crm.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BuyerRequirementResponse {
    private Long id;
    private String buyerName;
    private String buyerPhone;
    private TransactionType transactionType;
    private PropertyType propertyType;
    private String targetDistrict;
    private String targetWard;
    private BigDecimal minArea;
    private BigDecimal maxArea;
    private Integer minBedrooms;
    private BigDecimal maxPrice;
    private String priceUnit;
    private String notes;
    private Boolean active;
    private String agentName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BuyerRequirementResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }
    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }
    public PropertyType getPropertyType() { return propertyType; }
    public void setPropertyType(PropertyType propertyType) { this.propertyType = propertyType; }
    public String getTargetDistrict() { return targetDistrict; }
    public void setTargetDistrict(String targetDistrict) { this.targetDistrict = targetDistrict; }
    public String getTargetWard() { return targetWard; }
    public void setTargetWard(String targetWard) { this.targetWard = targetWard; }
    public BigDecimal getMinArea() { return minArea; }
    public void setMinArea(BigDecimal minArea) { this.minArea = minArea; }
    public BigDecimal getMaxArea() { return maxArea; }
    public void setMaxArea(BigDecimal maxArea) { this.maxArea = maxArea; }
    public Integer getMinBedrooms() { return minBedrooms; }
    public void setMinBedrooms(Integer minBedrooms) { this.minBedrooms = minBedrooms; }
    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
    public String getPriceUnit() { return priceUnit; }
    public void setPriceUnit(String priceUnit) { this.priceUnit = priceUnit; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final BuyerRequirementResponse r = new BuyerRequirementResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder buyerName(String v) { r.buyerName = v; return this; }
        public Builder buyerPhone(String v) { r.buyerPhone = v; return this; }
        public Builder transactionType(TransactionType v) { r.transactionType = v; return this; }
        public Builder propertyType(PropertyType v) { r.propertyType = v; return this; }
        public Builder targetDistrict(String v) { r.targetDistrict = v; return this; }
        public Builder targetWard(String v) { r.targetWard = v; return this; }
        public Builder minArea(BigDecimal v) { r.minArea = v; return this; }
        public Builder maxArea(BigDecimal v) { r.maxArea = v; return this; }
        public Builder minBedrooms(Integer v) { r.minBedrooms = v; return this; }
        public Builder maxPrice(BigDecimal v) { r.maxPrice = v; return this; }
        public Builder priceUnit(String v) { r.priceUnit = v; return this; }
        public Builder notes(String v) { r.notes = v; return this; }
        public Builder active(Boolean v) { r.active = v; return this; }
        public Builder agentName(String v) { r.agentName = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { r.updatedAt = v; return this; }
        public BuyerRequirementResponse build() { return r; }
    }
}
