package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.model.Ticket;
import com.follysitou.sellia_backend.model.CustomerSession;
import com.follysitou.sellia_backend.model.OrderItem;
import com.follysitou.sellia_backend.enums.WorkStation;
import com.follysitou.sellia_backend.enums.TicketStatus;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.repository.TicketRepository;
import com.follysitou.sellia_backend.repository.CustomerSessionRepository;
import com.follysitou.sellia_backend.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CustomerSessionRepository customerSessionRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Génère les tickets pour une CustomerSession
     * UN SEUL ticket par WorkStation, regroupant tous les OrderItems
     * 
     * Exemple:
     * - Table 5 a commandé: Pizza + Coca + Bière + Tiramisu
     * - Génère 2 tickets:
     *   - TICKET BAR: Coca + Bière + Tiramisu
     *   - TICKET KITCHEN: Pizza
     */
    public List<Ticket> generateTicketsForSession(String customerSessionPublicId) {
        CustomerSession session = customerSessionRepository.findByPublicId(customerSessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        // Récupérer tous les OrderItems non servies de cette session
        List<OrderItem> orderItems = orderItemRepository.findAll().stream()
                .filter(oi -> oi.getOrder().getCustomerSession() != null &&
                        oi.getOrder().getCustomerSession().getPublicId().equals(customerSessionPublicId) &&
                        oi.getTicket() == null)  // Pas encore affecté à un ticket
                .collect(Collectors.toList());

        if (orderItems.isEmpty()) {
            log.info("Aucun OrderItem à traiter pour la session: {}", customerSessionPublicId);
            return new ArrayList<>();
        }

        // Grouper par WorkStation
        Map<WorkStation, List<OrderItem>> itemsByStation = orderItems.stream()
                .collect(Collectors.groupingBy(OrderItem::getWorkStation));

        // Créer les tickets
        List<Ticket> tickets = new ArrayList<>();
        List<WorkStation> stationOrder = getStationPriorityOrder(itemsByStation.keySet().toArray(new WorkStation[0]));

        for (int i = 0; i < stationOrder.size(); i++) {
            WorkStation station = stationOrder.get(i);
            List<OrderItem> stationItems = itemsByStation.get(station);

            Ticket ticket = createTicketForStation(session, station, stationItems, i + 1);
            tickets.add(ticket);
            
            log.info("Ticket créé - Session: {}, Station: {}, Items: {}", 
                    customerSessionPublicId, station, stationItems.size());
        }

        return tickets;
    }

    /**
     * Détermine l'ordre de priorité des stations
     * BAR = Priorité 1 (boissons en premier)
     * KITCHEN = Priorité 2 (après les boissons)
     */
    private List<WorkStation> getStationPriorityOrder(WorkStation[] stations) {
        List<WorkStation> orderedStations = new ArrayList<>();
        
        // BAR toujours en premier
        if (stations.length > 0) {
            for (WorkStation s : stations) {
                if (s == WorkStation.BAR) {
                    orderedStations.add(s);
                }
            }
            // Puis les autres
            for (WorkStation s : stations) {
                if (s != WorkStation.BAR) {
                    orderedStations.add(s);
                }
            }
        }
        
        return orderedStations;
    }

    /**
     * Crée UN ticket pour une station avec tous ses items
     */
    private Ticket createTicketForStation(CustomerSession session, WorkStation station, 
                                          List<OrderItem> items, int stationPriority) {
        Ticket ticket = Ticket.builder()
                .customerSession(session)
                .workStation(station)
                .status(TicketStatus.PENDING)
                .priority(stationPriority)
                .items(items)
                .ticketNumber(generateTicketNumber(station))
                .createdAt(LocalDateTime.now())
                .build();

        // Message spécial si Bar + Kitchen
        if (stationPriority == 1 && items.size() > 0) {
            // Il y a d'autres stations après Bar
            ticket.setMessage("⚠️ SERVIR EN PREMIER - Les plats arrivent après");
        } else if (stationPriority > 1 && station == WorkStation.KITCHEN) {
            ticket.setMessage("ℹ️ Attendre que le Bar soit prêt (boissons en priorité)");
        }

        // Assigner le ticket aux items
        for (OrderItem item : items) {
            item.setTicket(ticket);
        }

        // Sauvegarder
        Ticket savedTicket = ticketRepository.save(ticket);
        
        return savedTicket;
    }

    /**
     * Génère un numéro de ticket unique
     * Format: "BAR-001", "KITCHEN-002", etc.
     */
    private String generateTicketNumber(WorkStation station) {
        long count = ticketRepository.findAll().stream()
                .filter(t -> t.getWorkStation() == station && !t.getDeleted())
                .count();
        
        return String.format("%s-%03d", station.toString(), count + 1);
    }

    /**
     * Marque un ticket comme imprimé
     */
    public void markTicketAsPrinted(String ticketPublicId) {
        Ticket ticket = ticketRepository.findByPublicId(ticketPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(TicketStatus.PRINTED);
        ticket.setPrintedAt(LocalDateTime.now());
        
        // Marquer tous les items comme "envoyés à la station"
        if (ticket.getItems() != null) {
            for (OrderItem item : ticket.getItems()) {
                item.setStatus(com.follysitou.sellia_backend.enums.OrderItemStatus.SENT_TO_STATION);
                item.setSentToStationAt(LocalDateTime.now());
            }
        }

        ticketRepository.save(ticket);
        log.info("Ticket marqué comme imprimé: {}", ticketPublicId);
    }

    /**
     * Récupère tous les tickets actifs par station
     */
    public List<Ticket> getActiveTicketsByStation(WorkStation station) {
        return ticketRepository.findActiveByWorkStation(station);
    }

    /**
     * Marque un ticket comme prêt (tous les items préparés)
     */
    public void markTicketAsReady(String ticketPublicId) {
        Ticket ticket = ticketRepository.findByPublicId(ticketPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(TicketStatus.READY);
        ticket.setReadyAt(LocalDateTime.now());
        
        ticketRepository.save(ticket);
        log.info("Ticket marqué comme prêt: {}", ticketPublicId);
    }

    /**
     * Marque un ticket comme servi
     */
    public void markTicketAsServed(String ticketPublicId) {
        Ticket ticket = ticketRepository.findByPublicId(ticketPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(TicketStatus.SERVED);
        ticket.setServedAt(LocalDateTime.now());
        
        ticketRepository.save(ticket);
        log.info("Ticket marqué comme servi: {}", ticketPublicId);
    }

    /**
     * Soft delete un ticket
     */
    public void deleteTicket(String ticketPublicId) {
        Ticket ticket = ticketRepository.findByPublicId(ticketPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setDeleted(true);
        ticketRepository.save(ticket);
        log.info("Ticket supprimé: {}", ticketPublicId);
    }
}
