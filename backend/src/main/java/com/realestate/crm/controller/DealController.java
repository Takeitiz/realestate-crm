package com.realestate.crm.controller;

import com.realestate.crm.entity.*;
import com.realestate.crm.enums.DealStage;
import com.realestate.crm.enums.UserRole;
import com.realestate.crm.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/deals")
public class DealController {

    private final DealRepository dealRepository;
    private final PropertyRepository propertyRepository;
    private final BuyerRequirementRepository buyerRepository;
    private final UserRepository userRepository;

    public DealController(DealRepository dealRepository, PropertyRepository propertyRepository,
                          BuyerRequirementRepository buyerRepository, UserRepository userRepository) {
        this.dealRepository = dealRepository;
        this.propertyRepository = propertyRepository;
        this.buyerRepository = buyerRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<Deal> deals = caller.getRole() == UserRole.MANAGER
                ? dealRepository.findAllByOrderByUpdatedAtDesc()
                : dealRepository.findByAgentIdOrderByUpdatedAtDesc(caller.getId());
        return ResponseEntity.ok(deals.stream().map(this::toMap).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User agent = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Long propertyId = Long.valueOf(body.get("propertyId").toString());
        Long buyerId = Long.valueOf(body.get("buyerId").toString());

        Property property = propertyRepository.findById(propertyId).orElseThrow();
        BuyerRequirement buyer = buyerRepository.findById(buyerId).orElseThrow();

        Deal d = new Deal();
        d.setProperty(property);
        d.setBuyer(buyer);
        d.setAgent(agent);
        if (body.containsKey("expectedPrice") && body.get("expectedPrice") != null) {
            d.setExpectedPrice(new BigDecimal(body.get("expectedPrice").toString()));
        }
        if (body.containsKey("priceUnit")) d.setPriceUnit(body.get("priceUnit").toString());
        if (body.containsKey("notes")) d.setNotes(body.get("notes").toString());

        return ResponseEntity.ok(toMap(dealRepository.save(d)));
    }

    @PatchMapping("/{id}/stage")
    public ResponseEntity<Map<String, Object>> moveStage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Deal d = dealRepository.findById(id).orElseThrow();
        d.setStage(DealStage.valueOf(body.get("stage")));
        return ResponseEntity.ok(toMap(dealRepository.save(d)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Deal d = dealRepository.findById(id).orElseThrow();
        if (body.containsKey("notes")) d.setNotes(body.get("notes").toString());
        if (body.containsKey("expectedPrice") && body.get("expectedPrice") != null) {
            d.setExpectedPrice(new BigDecimal(body.get("expectedPrice").toString()));
        }
        if (body.containsKey("priceUnit")) d.setPriceUnit(body.get("priceUnit").toString());
        return ResponseEntity.ok(toMap(dealRepository.save(d)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Deal d = dealRepository.findById(id).orElseThrow();
        if (!d.getAgent().getId().equals(caller.getId()) && caller.getRole() != UserRole.MANAGER) {
            return ResponseEntity.status(403).build();
        }
        dealRepository.delete(d);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(Deal d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("propertyId", d.getProperty().getId());
        m.put("propertyTitle", d.getProperty().getTitle());
        m.put("propertyDistrict", d.getProperty().getDistrict());
        m.put("propertyPrice", d.getProperty().getPrice());
        m.put("propertyPriceUnit", d.getProperty().getPriceUnit());
        m.put("buyerId", d.getBuyer().getId());
        m.put("buyerName", d.getBuyer().getBuyerName());
        m.put("buyerPhone", d.getBuyer().getBuyerPhone());
        m.put("agentName", d.getAgent().getFullName());
        m.put("stage", d.getStage().name());
        m.put("expectedPrice", d.getExpectedPrice());
        m.put("priceUnit", d.getPriceUnit() != null ? d.getPriceUnit() : d.getProperty().getPriceUnit());
        m.put("notes", d.getNotes() != null ? d.getNotes() : "");
        m.put("createdAt", d.getCreatedAt().toString());
        m.put("updatedAt", d.getUpdatedAt().toString());
        return m;
    }
}
