package com.realestate.crm.service;

import com.realestate.crm.dto.request.BuyerRequirementRequest;
import com.realestate.crm.dto.response.BuyerRequirementResponse;
import com.realestate.crm.entity.BuyerRequirement;
import com.realestate.crm.entity.User;
import com.realestate.crm.repository.BuyerRequirementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BuyerRequirementService {

    private final BuyerRequirementRepository repository;

    public BuyerRequirementService(BuyerRequirementRepository repository) {
        this.repository = repository;
    }

    public List<BuyerRequirementResponse> findByAgent(Long agentId) {
        return repository.findByAgentIdOrderByCreatedAtDesc(agentId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BuyerRequirementResponse findById(Long id) {
        return toResponse(repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu")));
    }

    public BuyerRequirementResponse create(BuyerRequirementRequest req, User agent) {
        BuyerRequirement entity = fromRequest(req);
        entity.setAgent(agent);
        return toResponse(repository.save(entity));
    }

    public BuyerRequirementResponse update(Long id, BuyerRequirementRequest req, User agent) {
        BuyerRequirement entity = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu"));
        applyRequest(entity, req);
        return toResponse(repository.save(entity));
    }

    public void delete(Long id) { repository.deleteById(id); }

    private BuyerRequirementResponse toResponse(BuyerRequirement e) {
        return BuyerRequirementResponse.builder()
            .id(e.getId()).buyerName(e.getBuyerName()).buyerPhone(e.getBuyerPhone())
            .transactionType(e.getTransactionType()).propertyType(e.getPropertyType())
            .targetDistrict(e.getTargetDistrict()).targetWard(e.getTargetWard())
            .minArea(e.getMinArea()).maxArea(e.getMaxArea()).minBedrooms(e.getMinBedrooms())
            .maxPrice(e.getMaxPrice()).priceUnit(e.getPriceUnit()).notes(e.getNotes())
            .active(e.getActive()).agentName(e.getAgent() != null ? e.getAgent().getFullName() : null)
            .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
            .build();
    }

    private BuyerRequirement fromRequest(BuyerRequirementRequest req) {
        BuyerRequirement e = new BuyerRequirement();
        applyRequest(e, req);
        return e;
    }

    private void applyRequest(BuyerRequirement e, BuyerRequirementRequest req) {
        if (req.getBuyerName() != null) e.setBuyerName(req.getBuyerName());
        if (req.getBuyerPhone() != null) e.setBuyerPhone(req.getBuyerPhone());
        if (req.getTransactionType() != null) e.setTransactionType(req.getTransactionType());
        if (req.getPropertyType() != null) e.setPropertyType(req.getPropertyType());
        if (req.getTargetDistrict() != null) e.setTargetDistrict(req.getTargetDistrict());
        if (req.getTargetWard() != null) e.setTargetWard(req.getTargetWard());
        if (req.getMinArea() != null) e.setMinArea(req.getMinArea());
        if (req.getMaxArea() != null) e.setMaxArea(req.getMaxArea());
        if (req.getMinBedrooms() != null) e.setMinBedrooms(req.getMinBedrooms());
        if (req.getMaxPrice() != null) e.setMaxPrice(req.getMaxPrice());
        if (req.getPriceUnit() != null) e.setPriceUnit(req.getPriceUnit());
        if (req.getNotes() != null) e.setNotes(req.getNotes());
        if (req.getActive() != null) e.setActive(req.getActive());
    }
}
