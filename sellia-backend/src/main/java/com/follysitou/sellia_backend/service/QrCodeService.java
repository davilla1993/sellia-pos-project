package com.follysitou.sellia_backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.follysitou.sellia_backend.exception.BusinessException;
import com.follysitou.sellia_backend.model.RestaurantTable;
import com.follysitou.sellia_backend.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrCodeService {

    private final RestaurantTableRepository restaurantTableRepository;

    @Value("${app.qr-codes-dir:./uploads/qrcodes}")
    private String qrCodesDir;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    private static final int QR_CODE_WIDTH = 300;
    private static final int QR_CODE_HEIGHT = 300;

    public String generateTableQrCode(String tablePublicId) {
        RestaurantTable table = restaurantTableRepository.findByPublicId(tablePublicId)
                .orElseThrow(() -> new BusinessException("Table not found"));

        // Generate unique session token
        String sessionToken = generateSessionToken();

        // Build QR code content (URL to customer interface)
        String qrCodeContent = buildQrCodeContent(table.getPublicId(), sessionToken);

        // Generate QR code image
        String fileName = generateFileName();
        String filePath = saveQrCodeImage(qrCodeContent, fileName);

        // Save QR code URL to table
        table.setQrCodeUrl(filePath);
        restaurantTableRepository.save(table);

        log.info("QR code generated for table {}: {}", table.getNumber(), filePath);
        return filePath;
    }

    public String generateCustomerSessionQrCode(String customerSessionPublicId) {
        // Build QR code content for customer session
        String qrCodeContent = baseUrl + "/menu?session=" + customerSessionPublicId;

        String fileName = generateFileName();
        String filePath = saveQrCodeImage(qrCodeContent, fileName);

        log.info("QR code generated for customer session {}: {}", customerSessionPublicId, filePath);
        return filePath;
    }

    private String buildQrCodeContent(String tablePublicId, String sessionToken) {
        return baseUrl + "/menu?table=" + tablePublicId + "&session=" + sessionToken;
    }

    private String saveQrCodeImage(String content, String fileName) {
        try {
            Path uploadPath = Paths.get(qrCodesDir);
            Files.createDirectories(uploadPath);

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, QR_CODE_WIDTH, QR_CODE_HEIGHT, hints);

            Path filePath = uploadPath.resolve(fileName);
            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);

            log.info("QR code image saved: {}", filePath);
            return "/uploads/qrcodes/" + fileName;

        } catch (WriterException e) {
            log.error("Error generating QR code", e);
            throw new BusinessException("Failed to generate QR code");
        } catch (IOException e) {
            log.error("Error saving QR code image", e);
            throw new BusinessException("Failed to save QR code image");
        }
    }

    private String generateFileName() {
        return UUID.randomUUID() + ".png";
    }

    private String generateSessionToken() {
        return UUID.randomUUID().toString();
    }
}
