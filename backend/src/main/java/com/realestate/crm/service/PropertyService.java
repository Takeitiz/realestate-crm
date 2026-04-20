package com.realestate.crm.service;

import com.realestate.crm.dto.request.PropertyFilterRequest;
import com.realestate.crm.dto.request.PropertyRequest;
import com.realestate.crm.dto.response.PropertyResponse;
import com.realestate.crm.entity.*;
import com.realestate.crm.enums.PropertyStatus;
import com.realestate.crm.enums.UserRole;
import com.realestate.crm.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    private static final Logger log = LoggerFactory.getLogger(PropertyService.class);

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository imageRepository;
    private final BuyerRequirementRepository requirementRepository;
    private final NotificationRepository notificationRepository;

    public PropertyService(PropertyRepository propertyRepository,
                           PropertyImageRepository imageRepository,
                           BuyerRequirementRepository requirementRepository,
                           NotificationRepository notificationRepository) {
        this.propertyRepository = propertyRepository;
        this.imageRepository = imageRepository;
        this.requirementRepository = requirementRepository;
        this.notificationRepository = notificationRepository;
    }

    public Page<PropertyResponse> findAll(PropertyFilterRequest filter, User caller) {
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), Sort.by("updatedAt").descending());
        boolean isAgent = caller.getRole() == UserRole.AGENT;
        Page<Property> page = propertyRepository.findWithFilters(
            filter.getDistrict(), filter.getWard(),
            filter.getPropertyType(), filter.getTransactionType(),
            filter.getStatus(),
            filter.getMinArea(), filter.getMaxArea(),
            filter.getMinBedrooms(), filter.getMaxPrice(),
            pageable
        );
        return page.map(p -> toResponse(p, isAgent));
    }

    public PropertyResponse findById(Long id, User caller) {
        Property p = propertyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bất động sản"));
        return toResponse(p, caller.getRole() == UserRole.AGENT);
    }

    @Transactional
    public PropertyResponse create(PropertyRequest req, User caller) {
        Property p = fromRequest(req);
        p.setCreatedBy(caller);
        Property saved = propertyRepository.save(p);
        triggerReverseMatching(saved);
        return toResponse(saved, false);
    }

    @Transactional
    public PropertyResponse update(Long id, PropertyRequest req, User caller) {
        Property p = propertyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bất động sản"));
        applyRequest(p, req);
        p.setUpdatedAt(LocalDateTime.now());
        return toResponse(propertyRepository.save(p), caller.getRole() == UserRole.AGENT);
    }

    @Transactional
    public PropertyResponse updateStatus(Long id, PropertyStatus status, User caller) {
        Property p = propertyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bất động sản"));
        p.setStatus(status);
        p.setUpdatedAt(LocalDateTime.now());
        return toResponse(propertyRepository.save(p), caller.getRole() == UserRole.AGENT);
    }

    public List<PropertyResponse> checkDuplicates(PropertyRequest req) {
        if (req.getDistrict() == null || req.getAreaSqm() == null || req.getPrice() == null) return List.of();
        BigDecimal areaTol = BigDecimal.valueOf(2);
        BigDecimal priceTol = BigDecimal.valueOf(0.5);
        return propertyRepository.findPotentialDuplicates(
            req.getDistrict(),
            req.getAreaSqm().subtract(areaTol), req.getAreaSqm().add(areaTol),
            req.getPrice().subtract(priceTol), req.getPrice().add(priceTol),
            -1L
        ).stream().map(p -> toResponse(p, false)).collect(Collectors.toList());
    }

    private PropertyResponse toResponse(Property p, boolean mask) {
        List<String> imageUrls = imageRepository.findByPropertyIdOrderByDisplayOrderAsc(p.getId())
            .stream().map(img -> "/api/properties/images/" + img.getId()).collect(Collectors.toList());
        return PropertyResponse.builder()
            .id(p.getId()).title(p.getTitle())
            .propertyType(p.getPropertyType()).transactionType(p.getTransactionType())
            .status(p.getStatus()).province(p.getProvince()).district(p.getDistrict())
            .ward(p.getWard()).street(p.getStreet())
            .houseNumber(mask ? null : p.getHouseNumber())
            .areaSqm(p.getAreaSqm()).bedrooms(p.getBedrooms()).bathrooms(p.getBathrooms())
            .floors(p.getFloors()).direction(p.getDirection())
            .price(p.getPrice()).priceUnit(p.getPriceUnit()).description(p.getDescription())
            .sellerName(p.getSellerName())
            .sellerPhone(mask ? maskPhone(p.getSellerPhone()) : p.getSellerPhone())
            .sellerNotes(mask ? null : p.getSellerNotes())
            .createdByName(p.getCreatedBy() != null ? p.getCreatedBy().getFullName() : null)
            .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
            .freshnessStatus(computeFreshness(p.getUpdatedAt()))
            .imageUrls(imageUrls)
            .build();
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return phone;
        return phone.substring(0, 3) + "*".repeat(phone.length() - 6) + phone.substring(phone.length() - 3);
    }

    private String computeFreshness(LocalDateTime updatedAt) {
        if (updatedAt == null) return "RED";
        long days = ChronoUnit.DAYS.between(updatedAt, LocalDateTime.now());
        if (days <= 7) return "GREEN";
        if (days <= 30) return "YELLOW";
        return "RED";
    }

    private Property fromRequest(PropertyRequest req) {
        Property p = new Property();
        applyRequest(p, req);
        return p;
    }

    private void applyRequest(Property p, PropertyRequest req) {
        if (req.getTitle() != null) p.setTitle(req.getTitle());
        if (req.getPropertyType() != null) p.setPropertyType(req.getPropertyType());
        if (req.getTransactionType() != null) p.setTransactionType(req.getTransactionType());
        if (req.getStatus() != null) p.setStatus(req.getStatus());
        if (req.getProvince() != null) p.setProvince(req.getProvince());
        if (req.getDistrict() != null) p.setDistrict(req.getDistrict());
        if (req.getWard() != null) p.setWard(req.getWard());
        if (req.getStreet() != null) p.setStreet(req.getStreet());
        if (req.getHouseNumber() != null) p.setHouseNumber(req.getHouseNumber());
        if (req.getAreaSqm() != null) p.setAreaSqm(req.getAreaSqm());
        if (req.getBedrooms() != null) p.setBedrooms(req.getBedrooms());
        if (req.getBathrooms() != null) p.setBathrooms(req.getBathrooms());
        if (req.getFloors() != null) p.setFloors(req.getFloors());
        if (req.getDirection() != null) p.setDirection(req.getDirection());
        if (req.getPrice() != null) p.setPrice(req.getPrice());
        if (req.getPriceUnit() != null) p.setPriceUnit(req.getPriceUnit());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getSellerName() != null) p.setSellerName(req.getSellerName());
        if (req.getSellerPhone() != null) p.setSellerPhone(req.getSellerPhone());
        if (req.getSellerNotes() != null) p.setSellerNotes(req.getSellerNotes());
    }

    private void triggerReverseMatching(Property property) {
        try {
            List<BuyerRequirement> matches = requirementRepository.findMatchingRequirements(
                property.getDistrict(), property.getTransactionType(), property.getPropertyType(),
                property.getPrice() != null ? property.getPrice() : BigDecimal.ZERO,
                property.getBedrooms() != null ? property.getBedrooms() : 0,
                property.getAreaSqm() != null ? property.getAreaSqm() : BigDecimal.ZERO
            );
            for (BuyerRequirement req : matches) {
                String msg = String.format(
                    "🏠 BĐS mới phù hợp với khách \"%s\": %s tại %s - %.1f m², giá %s %s",
                    req.getBuyerName(), property.getTitle(), property.getDistrict(),
                    property.getAreaSqm() != null ? property.getAreaSqm().doubleValue() : 0,
                    property.getPrice() != null ? property.getPrice().toPlainString() : "?",
                    property.getPriceUnit() != null ? property.getPriceUnit() : ""
                );
                Notification n = Notification.builder()
                    .user(req.getAgent()).property(property).requirement(req)
                    .message(msg).isRead(false).build();
                notificationRepository.save(n);
            }
        } catch (Exception e) {
            log.error("Lỗi reverse matching", e);
        }
    }
}
