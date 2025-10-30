package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.model.Ticket;
import com.follysitou.sellia_backend.service.TicketService;
import com.follysitou.sellia_backend.enums.WorkStation;
import com.follysitou.sellia_backend.dto.response.SessionTicketsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @PostMapping("/session/{customerSessionPublicId}/generate/separated")
    public ResponseEntity<List<Ticket>> generateSeparatedTickets(
            @PathVariable String customerSessionPublicId) {
        List<Ticket> tickets = ticketService.generateSeparatedTickets(customerSessionPublicId);
        return ResponseEntity.status(HttpStatus.CREATED).body(tickets);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CUISINE', 'BAR')")
    @GetMapping("/station/{station}/active")
    public ResponseEntity<List<Ticket>> getActiveTicketsByStation(
            @PathVariable WorkStation station) {
        List<Ticket> tickets = ticketService.getActiveTicketsByStation(station);
        return ResponseEntity.ok(tickets);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CUISINE', 'BAR')")
    @PutMapping("/{ticketPublicId}/print")
    public ResponseEntity<Void> printTicket(
            @PathVariable String ticketPublicId) {
        ticketService.markTicketAsPrinted(ticketPublicId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CUISINE', 'BAR')")
    @PutMapping("/{ticketPublicId}/preparing")
    public ResponseEntity<Void> markTicketAsPreparing(
            @PathVariable String ticketPublicId) {
        ticketService.markTicketAsPreparing(ticketPublicId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CUISINE', 'BAR')")
    @PutMapping("/{ticketPublicId}/ready")
    public ResponseEntity<Void> markTicketAsReady(
            @PathVariable String ticketPublicId) {
        ticketService.markTicketAsReady(ticketPublicId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @PutMapping("/{ticketPublicId}/served")
    public ResponseEntity<Void> markTicketAsServed(
            @PathVariable String ticketPublicId) {
        ticketService.markTicketAsServed(ticketPublicId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{ticketPublicId}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String ticketPublicId) {
        ticketService.deleteTicket(ticketPublicId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE', 'SERVEUR')")
    @GetMapping("/session/{customerSessionPublicId}/status")
    public ResponseEntity<SessionTicketsResponse> getSessionTicketsStatus(
            @PathVariable String customerSessionPublicId) {
        SessionTicketsResponse response = ticketService.getSessionTicketsStatus(customerSessionPublicId);
        return ResponseEntity.ok(response);
    }
}
