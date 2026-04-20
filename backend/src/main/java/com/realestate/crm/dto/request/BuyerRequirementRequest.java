package com.realestate.crm.dto.request;

import com.realestate.crm.enums.PropertyType;
import com.realestate.crm.enums.TransactionType;
import java.math.BigDecimal;

public class BuyerRequirementRequest {
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
    private Boolean active = true;

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
}
