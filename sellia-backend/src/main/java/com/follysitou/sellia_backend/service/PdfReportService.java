package com.follysitou.sellia_backend.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.follysitou.sellia_backend.dto.response.CashierReportResponse;
import com.follysitou.sellia_backend.dto.response.GlobalSessionReportResponse;
import com.follysitou.sellia_backend.dto.response.UserReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generateGlobalSessionReportPdf(GlobalSessionReportResponse report) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // Title
        Paragraph title = new Paragraph("RAPPORT SESSION GLOBALE")
                .setFont(boldFont)
                .setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Session Info
        document.add(new Paragraph("").setMarginBottom(10));
        document.add(new Paragraph("Session ID: " + report.getPublicId()).setFont(regularFont));
        document.add(new Paragraph("Statut: " + report.getStatus()).setFont(regularFont));
        document.add(new Paragraph("Ouvert: " + report.getOpenedAt().format(DATE_FORMATTER)).setFont(regularFont));
        if (report.getClosedAt() != null) {
            document.add(new Paragraph("Fermé: " + report.getClosedAt().format(DATE_FORMATTER)).setFont(regularFont));
        }
        document.add(new Paragraph("Par: " + report.getOpenedBy().getFirstName() + " " + report.getOpenedBy().getLastName()).setFont(regularFont));

        // Summary
        document.add(new Paragraph("").setMarginBottom(10));
        Paragraph summary = new Paragraph("RÉSUMÉ").setFont(boldFont).setFontSize(14);
        document.add(summary);

        Table summaryTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
        summaryTable.addCell("Total Ventes");
        summaryTable.addCell(String.format("%.2f XAF", report.getTotalSales() / 100.0));
        summaryTable.addCell("Nombre de Commandes");
        summaryTable.addCell(String.valueOf(report.getTotalOrders()));
        summaryTable.addCell("Total Remises");
        summaryTable.addCell(String.format("%.2f XAF", report.getTotalDiscounts() / 100.0));
        summaryTable.addCell("Montant Initial");
        summaryTable.addCell(String.format("%.2f XAF", report.getInitialAmount() / 100.0));
        summaryTable.addCell("Montant Final");
        summaryTable.addCell(String.format("%.2f XAF", report.getFinalAmount() != null ? report.getFinalAmount() / 100.0 : 0));

        document.add(summaryTable);

        // Cashier Sessions
        document.add(new Paragraph("").setMarginBottom(10));
        Paragraph cashierTitle = new Paragraph("SESSIONS CAISSES").setFont(boldFont).setFontSize(14);
        document.add(cashierTitle);

        Table cashierTable = new Table(UnitValue.createPercentArray(5)).useAllAvailableWidth();
        cashierTable.addCell("Caisse").setFont(boldFont);
        cashierTable.addCell("Utilisateur").setFont(boldFont);
        cashierTable.addCell("Ventes").setFont(boldFont);
        cashierTable.addCell("Commandes").setFont(boldFont);
        cashierTable.addCell("Durée").setFont(boldFont);

        if (report.getCashierSessions() != null) {
            for (GlobalSessionReportResponse.CashierSessionSummary session : report.getCashierSessions()) {
                cashierTable.addCell(session.getCashierName());
                cashierTable.addCell(session.getUserName());
                cashierTable.addCell(String.format("%.2f XAF", session.getTotalSales() / 100.0));
                cashierTable.addCell(String.valueOf(session.getOrderCount()));

                String duration = "N/A";
                if (session.getClosedAt() != null) {
                    long minutes = java.time.temporal.ChronoUnit.MINUTES.between(session.getOpenedAt(), session.getClosedAt());
                    long hours = minutes / 60;
                    long mins = minutes % 60;
                    duration = String.format("%dh %dm", hours, mins);
                }
                cashierTable.addCell(duration);
            }
        }

        document.add(cashierTable);

        // Top Products
        document.add(new Paragraph("").setMarginBottom(10));
        Paragraph productsTitle = new Paragraph("TOP 10 PRODUITS").setFont(boldFont).setFontSize(14);
        document.add(productsTitle);

        Table productsTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
        productsTable.addCell("Produit").setFont(boldFont);
        productsTable.addCell("Quantité").setFont(boldFont);
        productsTable.addCell("Montant").setFont(boldFont);

        if (report.getTopProducts() != null) {
            for (GlobalSessionReportResponse.OrderSummary product : report.getTopProducts()) {
                productsTable.addCell(product.getProductName());
                productsTable.addCell(String.valueOf(product.getQuantity()));
                productsTable.addCell(String.format("%.2f XAF", product.getTotalAmount() / 100.0));
            }
        }

        document.add(productsTable);

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] generateCashierReportPdf(CashierReportResponse report) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // Title
        Paragraph title = new Paragraph("RAPPORT CAISSE")
                .setFont(boldFont)
                .setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Cashier Info
        document.add(new Paragraph("").setMarginBottom(10));
        document.add(new Paragraph("Caisse: " + report.getCashierName()).setFont(regularFont));
        document.add(new Paragraph("N° Caisse: " + report.getCashierNumber()).setFont(regularFont));
        document.add(new Paragraph("Période: " + report.getPeriodStart().format(DATE_FORMATTER) + 
                                   " à " + report.getPeriodEnd().format(DATE_FORMATTER)).setFont(regularFont));

        // Summary
        document.add(new Paragraph("").setMarginBottom(10));
        Paragraph summary = new Paragraph("RÉSUMÉ").setFont(boldFont).setFontSize(14);
        document.add(summary);

        Table summaryTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
        summaryTable.addCell("Total Ventes");
        summaryTable.addCell(String.format("%.2f XAF", report.getTotalSales() / 100.0));
        summaryTable.addCell("Nombre de Commandes");
        summaryTable.addCell(String.valueOf(report.getTotalOrders()));
        summaryTable.addCell("Valeur Moyenne Commande");
        summaryTable.addCell(String.format("%.2f XAF", report.getAverageOrderValue() / 100.0));
        summaryTable.addCell("Total Remises");
        summaryTable.addCell(String.format("%.2f XAF", report.getTotalDiscounts() / 100.0));

        document.add(summaryTable);

        // Users
        document.add(new Paragraph("").setMarginBottom(10));
        Paragraph usersTitle = new Paragraph("UTILISATEURS").setFont(boldFont).setFontSize(14);
        document.add(usersTitle);

        Table usersTable = new Table(UnitValue.createPercentArray(4)).useAllAvailableWidth();
        usersTable.addCell("Utilisateur").setFont(boldFont);
        usersTable.addCell("Commandes").setFont(boldFont);
        usersTable.addCell("Ventes").setFont(boldFont);
        usersTable.addCell("Moyenne").setFont(boldFont);

        if (report.getUsers() != null) {
            for (CashierReportResponse.UserSummary user : report.getUsers()) {
                usersTable.addCell(user.getFirstName() + " " + user.getLastName());
                usersTable.addCell(String.valueOf(user.getOrderCount()));
                usersTable.addCell(String.format("%.2f XAF", user.getTotalSales() / 100.0));
                usersTable.addCell(String.format("%.2f XAF", 
                    user.getOrderCount() > 0 ? user.getTotalSales() / (100.0 * user.getOrderCount()) : 0));
            }
        }

        document.add(usersTable);

        // Top Products
        document.add(new Paragraph("").setMarginBottom(10));
        Paragraph productsTitle = new Paragraph("TOP 10 PRODUITS").setFont(boldFont).setFontSize(14);
        document.add(productsTitle);

        Table productsTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
        productsTable.addCell("Produit").setFont(boldFont);
        productsTable.addCell("Quantité").setFont(boldFont);
        productsTable.addCell("Montant").setFont(boldFont);

        if (report.getTopProducts() != null) {
            for (CashierReportResponse.ProductSummary product : report.getTopProducts()) {
                productsTable.addCell(product.getProductName());
                productsTable.addCell(String.valueOf(product.getQuantity()));
                productsTable.addCell(String.format("%.2f XAF", product.getTotalAmount() / 100.0));
            }
        }

        document.add(productsTable);

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] generateUserReportPdf(UserReportResponse report) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // Title
        Paragraph title = new Paragraph("RAPPORT UTILISATEUR")
                .setFont(boldFont)
                .setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // User Info
        document.add(new Paragraph("").setMarginBottom(10));
        document.add(new Paragraph("Utilisateur: " + report.getFirstName() + " " + report.getLastName()).setFont(regularFont));
        document.add(new Paragraph("Username: " + report.getUsername()).setFont(regularFont));
        document.add(new Paragraph("Période: " + report.getPeriodStart().format(DATE_FORMATTER) + 
                                   " à " + report.getPeriodEnd().format(DATE_FORMATTER)).setFont(regularFont));

        // Summary
        document.add(new Paragraph("").setMarginBottom(10));
        Paragraph summary = new Paragraph("RÉSUMÉ").setFont(boldFont).setFontSize(14);
        document.add(summary);

        Table summaryTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
        summaryTable.addCell("Total Ventes");
        summaryTable.addCell(String.format("%.2f XAF", report.getTotalSales() / 100.0));
        summaryTable.addCell("Nombre de Commandes");
        summaryTable.addCell(String.valueOf(report.getTotalOrders()));
        summaryTable.addCell("Valeur Moyenne Commande");
        summaryTable.addCell(String.format("%.2f XAF", report.getAverageOrderValue() / 100.0));
        summaryTable.addCell("Total Remises");
        summaryTable.addCell(String.format("%.2f XAF", report.getTotalDiscounts() / 100.0));
        summaryTable.addCell("Remise Moyenne");
        summaryTable.addCell(String.format("%.2f XAF", report.getAverageDiscount() * 100));

        document.add(summaryTable);

        // Cashiers
        document.add(new Paragraph("").setMarginBottom(10));
        Paragraph cashiersTitle = new Paragraph("CAISSES UTILISÉES").setFont(boldFont).setFontSize(14);
        document.add(cashiersTitle);

        Table cashiersTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
        cashiersTable.addCell("Caisse").setFont(boldFont);
        cashiersTable.addCell("Commandes").setFont(boldFont);
        cashiersTable.addCell("Ventes").setFont(boldFont);

        if (report.getCashiers() != null) {
            for (UserReportResponse.CashierSummary cashier : report.getCashiers()) {
                cashiersTable.addCell(cashier.getCashierName());
                cashiersTable.addCell(String.valueOf(cashier.getOrderCount()));
                cashiersTable.addCell(String.format("%.2f XAF", cashier.getTotalSales() / 100.0));
            }
        }

        document.add(cashiersTable);

        // Top Products
        document.add(new Paragraph("").setMarginBottom(10));
        Paragraph productsTitle = new Paragraph("TOP 10 PRODUITS").setFont(boldFont).setFontSize(14);
        document.add(productsTitle);

        Table productsTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
        productsTable.addCell("Produit").setFont(boldFont);
        productsTable.addCell("Quantité").setFont(boldFont);
        productsTable.addCell("Montant").setFont(boldFont);

        if (report.getTopProducts() != null) {
            for (UserReportResponse.ProductSummary product : report.getTopProducts()) {
                productsTable.addCell(product.getProductName());
                productsTable.addCell(String.valueOf(product.getQuantity()));
                productsTable.addCell(String.format("%.2f XAF", product.getTotalAmount() / 100.0));
            }
        }

        document.add(productsTable);

        document.close();
        return outputStream.toByteArray();
    }
}
