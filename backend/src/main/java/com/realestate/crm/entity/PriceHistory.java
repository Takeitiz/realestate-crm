package com.realestate.crm.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_history")
public class PriceHistory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private String priceUnit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_id")
    private User changedBy;

    @Column(updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() { changedAt = LocalDateTime.now(); }

    public PriceHistory() {}

    public PriceHistory(Property property, BigDecimal oldPrice, BigDecimal newPrice, String priceUnit, User changedBy) {
        this.property = property;
        this.oldPrice = oldPrice;
        this.newPrice = newPrice;
        this.priceUnit = priceUnit;
        this.changedBy = changedBy;
    }

    public Long getId() { return id; }
    public Property getProperty() { return property; }
    public BigDecimal getOldPrice() { return oldPrice; }
    public BigDecimal getNewPrice() { return newPrice; }
    public String getPriceUnit() { return priceUnit; }
    public User getChangedBy() { return changedBy; }
    public LocalDateTime getChangedAt() { return changedAt; }
}
