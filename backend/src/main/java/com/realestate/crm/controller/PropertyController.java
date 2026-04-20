package com.realestate.crm.controller;

import com.realestate.crm.dto.request.PropertyFilterRequest;
import com.realestate.crm.dto.request.PropertyRequest;
import com.realestate.crm.dto.response.PropertyResponse;
import com.realestate.crm.entity.User;
import com.realestate.crm.enums.PropertyStatus;
import com.realestate.crm.service.ImageService;
import com.realestate.crm.service.PropertyService;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;
    private final ImageService imageService;

    public PropertyController(PropertyService propertyService, ImageService imageService) {
        this.propertyService = propertyService;
        this.imageService = imageService;
    }

    @GetMapping
    public ResponseEntity<Page<PropertyResponse>> list(
            @ModelAttribute PropertyFilterRequest filter,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(propertyService.findAll(filter, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(propertyService.findById(id, user));
    }

    @PostMapping
    public ResponseEntity<PropertyResponse> create(@RequestBody PropertyRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(propertyService.create(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> update(@PathVariable Long id, @RequestBody PropertyRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(propertyService.update(id, request, user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PropertyResponse> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(propertyService.updateStatus(id, PropertyStatus.valueOf(body.get("status")), user));
    }

    @PostMapping("/check-duplicate")
    public ResponseEntity<List<PropertyResponse>> checkDuplicate(@RequestBody PropertyRequest request) {
        return ResponseEntity.ok(propertyService.checkDuplicates(request));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<?> uploadImage(@PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "0") int order) throws IOException {
        return ResponseEntity.ok(imageService.uploadImage(id, file, order));
    }

    @GetMapping("/images/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long imageId) throws IOException {
        byte[] bytes = imageService.getImageBytes(imageId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id, @PathVariable Long imageId) throws IOException {
        imageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
