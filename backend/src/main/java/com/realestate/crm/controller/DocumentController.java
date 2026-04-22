package com.realestate.crm.controller;

import com.realestate.crm.entity.PropertyDocument;
import com.realestate.crm.entity.Property;
import com.realestate.crm.entity.User;
import com.realestate.crm.enums.UserRole;
import com.realestate.crm.repository.PropertyDocumentRepository;
import com.realestate.crm.repository.PropertyRepository;
import com.realestate.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties/{propertyId}/documents")
public class DocumentController {

    private final PropertyDocumentRepository documentRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public DocumentController(PropertyDocumentRepository documentRepository,
                               PropertyRepository propertyRepository,
                               UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(@PathVariable Long propertyId) {
        List<Map<String, Object>> docs = documentRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream().map(d -> Map.<String, Object>of(
                        "id", d.getId(),
                        "filename", d.getOriginalFilename(),
                        "fileType", d.getFileType() != null ? d.getFileType() : "",
                        "fileSizeBytes", d.getFileSizeBytes() != null ? d.getFileSizeBytes() : 0L,
                        "uploadedBy", d.getUploadedBy() != null ? d.getUploadedBy().getFullName() : "?",
                        "createdAt", d.getCreatedAt().toString()
                )).collect(Collectors.toList());
        return ResponseEntity.ok(docs);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> upload(
            @PathVariable Long propertyId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy BĐS"));

        Path dir = Paths.get(uploadDir, "documents", String.valueOf(propertyId));
        Files.createDirectories(dir);

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) ext = original.substring(original.lastIndexOf("."));
        String saved = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), dir.resolve(saved), StandardCopyOption.REPLACE_EXISTING);

        PropertyDocument doc = new PropertyDocument();
        doc.setProperty(property);
        doc.setOriginalFilename(original);
        doc.setFilePath(dir.resolve(saved).toString());
        doc.setFileType(file.getContentType());
        doc.setFileSizeBytes(file.getSize());
        doc.setUploadedBy(user);
        PropertyDocument savedDoc = documentRepository.save(doc);

        return ResponseEntity.ok(Map.of(
                "id", savedDoc.getId(),
                "filename", savedDoc.getOriginalFilename(),
                "fileType", savedDoc.getFileType() != null ? savedDoc.getFileType() : "",
                "fileSizeBytes", savedDoc.getFileSizeBytes(),
                "uploadedBy", user.getFullName(),
                "createdAt", savedDoc.getCreatedAt().toString()
        ));
    }

    @GetMapping("/{docId}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long propertyId,
                                            @PathVariable Long docId) throws IOException {
        PropertyDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài liệu"));
        byte[] bytes = Files.readAllBytes(Paths.get(doc.getFilePath()));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
                .contentType(MediaType.parseMediaType(doc.getFileType() != null ? doc.getFileType() : "application/octet-stream"))
                .body(bytes);
    }

    @DeleteMapping("/{docId}")
    public ResponseEntity<Void> delete(@PathVariable Long propertyId,
                                        @PathVariable Long docId,
                                        @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        PropertyDocument doc = documentRepository.findById(docId).orElseThrow();
        boolean canDelete = doc.getUploadedBy().getId().equals(caller.getId()) || caller.getRole() == UserRole.MANAGER;
        if (!canDelete) return ResponseEntity.status(403).build();
        Files.deleteIfExists(Paths.get(doc.getFilePath()));
        documentRepository.delete(doc);
        return ResponseEntity.noContent().build();
    }
}
