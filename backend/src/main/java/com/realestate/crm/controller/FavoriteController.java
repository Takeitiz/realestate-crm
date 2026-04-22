package com.realestate.crm.controller;

import com.realestate.crm.entity.Favorite;
import com.realestate.crm.entity.Property;
import com.realestate.crm.entity.User;
import com.realestate.crm.repository.FavoriteRepository;
import com.realestate.crm.repository.PropertyRepository;
import com.realestate.crm.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public FavoriteController(FavoriteRepository favoriteRepository,
                               PropertyRepository propertyRepository,
                               UserRepository userRepository) {
        this.favoriteRepository = favoriteRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    /** Returns list of favorited property IDs for the current user */
    @GetMapping
    public ResponseEntity<List<Long>> getMyFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<Long> ids = favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(f -> f.getProperty().getId()).collect(Collectors.toList());
        return ResponseEntity.ok(ids);
    }

    /** Toggle: if not favorited → add. If already favorited → remove. */
    @PostMapping("/{propertyId}/toggle")
    @Transactional
    public ResponseEntity<Map<String, Object>> toggle(@PathVariable Long propertyId,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        boolean exists = favoriteRepository.existsByUserIdAndPropertyId(user.getId(), propertyId);
        if (exists) {
            favoriteRepository.deleteByUserIdAndPropertyId(user.getId(), propertyId);
            return ResponseEntity.ok(Map.of("favorited", false));
        } else {
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy BĐS"));
            favoriteRepository.save(new Favorite(user, property));
            return ResponseEntity.ok(Map.of("favorited", true));
        }
    }
}
