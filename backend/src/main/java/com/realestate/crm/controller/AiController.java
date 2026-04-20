package com.realestate.crm.controller;

import com.realestate.crm.ai.AiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    @Value("${app.ai.provider}")
    private String aiProvider;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/parse-listing")
    public ResponseEntity<Map<String, Object>> parseListing(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("result", aiService.parseListing(body.getOrDefault("text", "")), "provider", aiProvider));
    }

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> parseSearch(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("result", aiService.parseSearchQuery(body.getOrDefault("query", "")), "provider", aiProvider));
    }

    @PostMapping("/generate-pitch")
    public ResponseEntity<Map<String, Object>> generatePitch(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of(
            "result", aiService.generatePitch(body.getOrDefault("properties", "[]"), body.getOrDefault("buyerContext", "Khách hàng tiềm năng")),
            "provider", aiProvider
        ));
    }
}
