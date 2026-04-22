package com.realestate.crm.controller;

import com.realestate.crm.entity.Comment;
import com.realestate.crm.entity.Property;
import com.realestate.crm.entity.User;
import com.realestate.crm.enums.UserRole;
import com.realestate.crm.repository.CommentRepository;
import com.realestate.crm.repository.PropertyRepository;
import com.realestate.crm.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties/{propertyId}/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public CommentController(CommentRepository commentRepository,
                              PropertyRepository propertyRepository,
                              UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable Long propertyId) {
        List<Map<String, Object>> comments = commentRepository
                .findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .map(c -> Map.<String, Object>of(
                        "id", c.getId(),
                        "content", c.getContent(),
                        "authorName", c.getAuthor().getFullName(),
                        "authorUsername", c.getAuthor().getUsername(),
                        "createdAt", c.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addComment(
            @PathVariable Long propertyId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nội dung không được trống"));
        }
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy BĐS"));

        Comment comment = new Comment();
        comment.setProperty(property);
        comment.setAuthor(user);
        comment.setContent(content.trim());
        Comment saved = commentRepository.save(comment);

        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "content", saved.getContent(),
                "authorName", user.getFullName(),
                "authorUsername", user.getUsername(),
                "createdAt", saved.getCreatedAt().toString()
        ));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long propertyId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy comment"));

        boolean isOwner = comment.getAuthor().getId().equals(user.getId());
        boolean isManager = user.getRole() == UserRole.MANAGER;
        if (!isOwner && !isManager) {
            return ResponseEntity.status(403).build();
        }
        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }
}
