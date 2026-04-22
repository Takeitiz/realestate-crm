package com.realestate.crm.dto.response;

import com.realestate.crm.enums.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PropertyResponse {
    private Long id;
    private String title;
    private PropertyType propertyType;
    private TransactionType transactionType;
    private PropertyStatus status;
    private String province;
    private String district;
    private String ward;
    private String street;
    private String houseNumber;
    private BigDecimal areaSqm;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer floors;
    private Direction direction;
    private BigDecimal price;
    private String priceUnit;
    private String description;
    private String sellerName;
    private String sellerPhone;
    private String sellerNotes;
    private BigDecimal commissionRate;
    private String commissionNote;
    private CommissionStatus commissionStatus;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String freshnessStatus;
    private List<String> imageUrls;

    public PropertyResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public PropertyType getPropertyType() { return propertyType; }
    public void setPropertyType(PropertyType pt) { this.propertyType = pt; }
    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType tt) { this.transactionType = tt; }
    public PropertyStatus getStatus() { return status; }
    public void setStatus(PropertyStatus status) { this.status = status; }
    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }
    public BigDecimal getAreaSqm() { return areaSqm; }
    public void setAreaSqm(BigDecimal areaSqm) { this.areaSqm = areaSqm; }
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    public Integer getFloors() { return floors; }
    public void setFloors(Integer floors) { this.floors = floors; }
    public Direction getDirection() { return direction; }
    public void setDirection(Direction direction) { this.direction = direction; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getPriceUnit() { return priceUnit; }
    public void setPriceUnit(String priceUnit) { this.priceUnit = priceUnit; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public String getSellerPhone() { return sellerPhone; }
    public void setSellerPhone(String sellerPhone) { this.sellerPhone = sellerPhone; }
    public String getSellerNotes() { return sellerNotes; }
    public void setSellerNotes(String sellerNotes) { this.sellerNotes = sellerNotes; }
    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }
    public String getCommissionNote() { return commissionNote; }
    public void setCommissionNote(String commissionNote) { this.commissionNote = commissionNote; }
    public CommissionStatus getCommissionStatus() { return commissionStatus; }
    public void setCommissionStatus(CommissionStatus commissionStatus) { this.commissionStatus = commissionStatus; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getFreshnessStatus() { return freshnessStatus; }
    public void setFreshnessStatus(String freshnessStatus) { this.freshnessStatus = freshnessStatus; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final PropertyResponse r = new PropertyResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder title(String v) { r.title = v; return this; }
        public Builder propertyType(PropertyType v) { r.propertyType = v; return this; }
        public Builder transactionType(TransactionType v) { r.transactionType = v; return this; }
        public Builder status(PropertyStatus v) { r.status = v; return this; }
        public Builder province(String v) { r.province = v; return this; }
        public Builder district(String v) { r.district = v; return this; }
        public Builder ward(String v) { r.ward = v; return this; }
        public Builder street(String v) { r.street = v; return this; }
        public Builder houseNumber(String v) { r.houseNumber = v; return this; }
        public Builder areaSqm(BigDecimal v) { r.areaSqm = v; return this; }
        public Builder bedrooms(Integer v) { r.bedrooms = v; return this; }
        public Builder bathrooms(Integer v) { r.bathrooms = v; return this; }
        public Builder floors(Integer v) { r.floors = v; return this; }
        public Builder direction(Direction v) { r.direction = v; return this; }
        public Builder price(BigDecimal v) { r.price = v; return this; }
        public Builder priceUnit(String v) { r.priceUnit = v; return this; }
        public Builder description(String v) { r.description = v; return this; }
        public Builder sellerName(String v) { r.sellerName = v; return this; }
        public Builder sellerPhone(String v) { r.sellerPhone = v; return this; }
        public Builder sellerNotes(String v) { r.sellerNotes = v; return this; }
        public Builder commissionRate(BigDecimal v) { r.commissionRate = v; return this; }
        public Builder commissionNote(String v) { r.commissionNote = v; return this; }
        public Builder commissionStatus(CommissionStatus v) { r.commissionStatus = v; return this; }
        public Builder createdByName(String v) { r.createdByName = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { r.updatedAt = v; return this; }
        public Builder freshnessStatus(String v) { r.freshnessStatus = v; return this; }
        public Builder imageUrls(List<String> v) { r.imageUrls = v; return this; }
        public PropertyResponse build() { return r; }
    }
}
