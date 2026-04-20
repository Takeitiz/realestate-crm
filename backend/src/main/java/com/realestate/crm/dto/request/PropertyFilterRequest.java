package com.realestate.crm.dto.request;

import com.realestate.crm.enums.PropertyStatus;
import com.realestate.crm.enums.PropertyType;
import com.realestate.crm.enums.TransactionType;
import java.math.BigDecimal;

public class PropertyFilterRequest {
    private String district;
    private String ward;
    private PropertyType propertyType;
    private TransactionType transactionType;
    private PropertyStatus status;
    private BigDecimal minArea;
    private BigDecimal maxArea;
    private Integer minBedrooms;
    private BigDecimal maxPrice;
    private int page = 0;
    private int size = 12;

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }
    public PropertyType getPropertyType() { return propertyType; }
    public void setPropertyType(PropertyType propertyType) { this.propertyType = propertyType; }
    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }
    public PropertyStatus getStatus() { return status; }
    public void setStatus(PropertyStatus status) { this.status = status; }
    public BigDecimal getMinArea() { return minArea; }
    public void setMinArea(BigDecimal minArea) { this.minArea = minArea; }
    public BigDecimal getMaxArea() { return maxArea; }
    public void setMaxArea(BigDecimal maxArea) { this.maxArea = maxArea; }
    public Integer getMinBedrooms() { return minBedrooms; }
    public void setMinBedrooms(Integer minBedrooms) { this.minBedrooms = minBedrooms; }
    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}
