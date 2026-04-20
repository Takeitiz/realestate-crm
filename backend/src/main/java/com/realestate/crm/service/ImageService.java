package com.realestate.crm.service;

import com.realestate.crm.entity.Property;
import com.realestate.crm.entity.PropertyImage;
import com.realestate.crm.repository.PropertyImageRepository;
import com.realestate.crm.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class ImageService {

    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository imageRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.company-name}")
    private String companyName;

    public ImageService(PropertyRepository propertyRepository, PropertyImageRepository imageRepository) {
        this.propertyRepository = propertyRepository;
        this.imageRepository = imageRepository;
    }

    public PropertyImage uploadImage(Long propertyId, MultipartFile file, int order) throws IOException {
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bất động sản"));

        Path uploadPath = Paths.get(uploadDir, String.valueOf(propertyId));
        Files.createDirectories(uploadPath);

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;
        Path targetPath = uploadPath.resolve(filename);

        try {
            BufferedImage original = ImageIO.read(file.getInputStream());
            if (original != null) {
                BufferedImage watermarked = applyWatermark(original);
                ImageIO.write(watermarked, ext.toLowerCase().equals("jpg") ? "jpeg" : ext.toLowerCase(), targetPath.toFile());
            } else {
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (Exception e) {
            log.warn("Watermark failed, saving original: {}", e.getMessage());
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        PropertyImage image = PropertyImage.builder()
            .property(property).filePath(targetPath.toString())
            .originalFilename(file.getOriginalFilename()).displayOrder(order)
            .build();
        return imageRepository.save(image);
    }

    public byte[] getImageBytes(Long imageId) throws IOException {
        PropertyImage image = imageRepository.findById(imageId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));
        return Files.readAllBytes(Paths.get(image.getFilePath()));
    }

    public void deleteImage(Long imageId) throws IOException {
        PropertyImage image = imageRepository.findById(imageId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));
        Files.deleteIfExists(Paths.get(image.getFilePath()));
        imageRepository.delete(image);
    }

    private BufferedImage applyWatermark(BufferedImage original) {
        int w = original.getWidth(), h = original.getHeight();
        BufferedImage result = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = result.createGraphics();
        g.drawImage(original, 0, 0, null);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.55f));
        int fontSize = Math.max(14, w / 28);
        g.setFont(new Font("Arial", Font.BOLD, fontSize));
        FontMetrics fm = g.getFontMetrics();
        int tw = fm.stringWidth(companyName);
        int x = w - tw - 14, y = h - 14;
        g.setColor(new Color(0, 0, 0, 100));
        g.drawString(companyName, x + 2, y + 2);
        g.setColor(new Color(255, 255, 255, 200));
        g.drawString(companyName, x, y);
        g.dispose();
        return result;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
