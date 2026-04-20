package com.realestate.crm.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${app.company-name}")
    private String companyName;

    @Value("${app.company-tagline}")
    private String companyTagline;

    @Value("${app.ai.provider}")
    private String aiProvider;

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> publicConfig() {
        return ResponseEntity.ok(Map.of(
            "companyName", companyName,
            "companyTagline", companyTagline,
            "aiProvider", aiProvider
        ));
    }
}
