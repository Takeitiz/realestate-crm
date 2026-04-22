package com.realestate.crm.controller;

import com.realestate.crm.repository.PriceHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties/{propertyId}/price-history")
public class PriceHistoryController {

    private final PriceHistoryRepository priceHistoryRepository;

    public PriceHistoryController(PriceHistoryRepository priceHistoryRepository) {
        this.priceHistoryRepository = priceHistoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPriceHistory(@PathVariable Long propertyId) {
        List<Map<String, Object>> history = priceHistoryRepository
                .findByPropertyIdOrderByChangedAtDesc(propertyId)
                .stream()
                .map(h -> Map.<String, Object>of(
                        "id", h.getId(),
                        "oldPrice", h.getOldPrice() != null ? h.getOldPrice() : 0,
                        "newPrice", h.getNewPrice() != null ? h.getNewPrice() : 0,
                        "priceUnit", h.getPriceUnit() != null ? h.getPriceUnit() : "",
                        "changedBy", h.getChangedBy() != null ? h.getChangedBy().getFullName() : "?",
                        "changedAt", h.getChangedAt().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(history);
    }
}
