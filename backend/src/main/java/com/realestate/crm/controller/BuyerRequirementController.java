package com.realestate.crm.controller;

import com.realestate.crm.dto.request.BuyerRequirementRequest;
import com.realestate.crm.dto.response.BuyerRequirementResponse;
import com.realestate.crm.entity.User;
import com.realestate.crm.service.BuyerRequirementService;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buyer-requirements")
public class BuyerRequirementController {

    private final BuyerRequirementService service;

    public BuyerRequirementController(BuyerRequirementService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<BuyerRequirementResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.findByAgent(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuyerRequirementResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<BuyerRequirementResponse> create(@RequestBody BuyerRequirementRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BuyerRequirementResponse> update(@PathVariable Long id, @RequestBody BuyerRequirementRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
