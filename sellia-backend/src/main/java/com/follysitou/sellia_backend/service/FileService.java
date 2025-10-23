package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.exception.BusinessException;
import com.follysitou.sellia_backend.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    @Value("${app.products-images-dir:./uploads/products}")
    private String productsImagesDir;

    @Value("${app.qr-codes-dir:./uploads/qrcodes}")
    private String qrCodesDir;

    @Value("${app.receipts-dir:./uploads/receipts}")
    private String receiptsDir;

    @Value("${app.server-url:http://localhost:8080}")
    private String serverUrl;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};

    public String uploadProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Image file is required");
        }

        validateImageFile(file);

        String fileName = generateFileName(file.getOriginalFilename());
        Path uploadPath = Paths.get(productsImagesDir);

        try {
            Files.createDirectories(uploadPath);
            Files.write(uploadPath.resolve(fileName), file.getBytes());
            log.info("Product image uploaded successfully: {}", fileName);
            return serverUrl + "/api/files/products/" + fileName;
        } catch (IOException e) {
            log.error("Failed to upload product image", e);
            throw new BusinessException("Failed to upload image. Please try again later.");
        }
    }

    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return;
        }

        try {
            String fileName = extractFileName(filePath);
            Path fileToDelete = Paths.get(productsImagesDir).resolve(fileName);
            Files.deleteIfExists(fileToDelete);
            log.info("File deleted successfully: {}", fileName);
        } catch (IOException e) {
            log.error("Failed to delete file", e);
            // Don't throw - deletion failure shouldn't block operations
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File size must not exceed 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isAllowedImageType(contentType)) {
            throw new BusinessException("Only JPEG, PNG, GIF, and WebP images are allowed");
        }
    }

    private boolean isAllowedImageType(String contentType) {
        for (String allowedType : ALLOWED_IMAGE_TYPES) {
            if (contentType.equalsIgnoreCase(allowedType)) {
                return true;
            }
        }
        return false;
    }

    private String generateFileName(String originalFileName) {
        String extension = getFileExtension(originalFileName);
        return UUID.randomUUID() + "." + extension;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "jpg";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    private String extractFileName(String filePath) {
        return filePath.substring(filePath.lastIndexOf("/") + 1);
    }
}
