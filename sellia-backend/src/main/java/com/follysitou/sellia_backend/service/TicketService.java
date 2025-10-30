package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.model.Ticket;
import com.follysitou.sellia_backend.util.SecurityUtil;
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
     * Génère les tickets SÉPARÉS pour une CustomerSession
     * UN ticket par WorkStation, regroupant tous les OrderItems de cette station
     * 
     * Exemple:
     * - Table 5 a commandé: Pizza + Coca + Bière + Tiramisu
     * - Génère 2 tickets:
     *   - TICKET BAR: Coca + Bière + Tiramisu
     *   - TICKET KITCHEN: Pizza
     */
    public List<Ticket> generateSeparatedTickets(String customerSessionPublicId) {
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
        } else if (stationPriority > 1 && station == WorkStation.CUISINE) {
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
     * Marque un ticket comme en préparation
     */
    public void markTicketAsPreparing(String ticketPublicId) {
        Ticket ticket = ticketRepository.findByPublicId(ticketPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(TicketStatus.PREPARING);

        ticketRepository.save(ticket);
        log.info("Ticket marqué comme en préparation: {}", ticketPublicId);
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
        ticket.setDeletedAt(java.time.LocalDateTime.now());
        ticket.setDeletedBy(SecurityUtil.getCurrentUsername());
        ticketRepository.save(ticket);
        log.info("Ticket supprimé: {}", ticketPublicId);
    }

    /**
     * Récupère le statut des tickets groupés par session
     * Vue synthétique pour le serveur/caissier
     */
    public com.follysitou.sellia_backend.dto.response.SessionTicketsResponse getSessionTicketsStatus(String customerSessionPublicId) {
        CustomerSession session = customerSessionRepository.findByPublicId(customerSessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        // Récupérer tous les tickets de cette session
        List<Ticket> tickets = ticketRepository.findByCustomerSessionId(customerSessionPublicId);

        if (tickets.isEmpty()) {
            log.warn("Aucun ticket trouvé pour la session: {}", customerSessionPublicId);
            return buildEmptySessionTicketsResponse(session);
        }

        // Construire la réponse
        com.follysitou.sellia_backend.dto.response.SessionTicketsResponse response = 
                new com.follysitou.sellia_backend.dto.response.SessionTicketsResponse();

        response.setSessionPublicId(session.getPublicId());
        response.setTableNumber(session.getTable() != null ? 
                session.getTable().getNumber() : "N/A");
        response.setCustomerName(session.getCustomerName());

        // Grouper les tickets par station
        Map<WorkStation, com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.StationTicketInfo> ticketsByStation = 
                new java.util.LinkedHashMap<>();

        int readyCount = 0;
        int preparingCount = 0;
        int pendingCount = 0;

        for (Ticket ticket : tickets) {
            com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.StationTicketInfo stationInfo = 
                    buildStationTicketInfo(ticket);
            ticketsByStation.put(ticket.getWorkStation(), stationInfo);

            // Compter les stations par status
            switch (ticket.getStatus()) {
                case READY -> readyCount++;
                case PREPARING, PRINTING, PRINTED -> preparingCount++;
                case PENDING -> pendingCount++;
            }
        }

        response.setTicketsByStation(ticketsByStation);
        response.setTotalStations(tickets.size());
        response.setReadyStations(readyCount);
        response.setPreparingStations(preparingCount);
        response.setPendingStations(pendingCount);

        // Calculer le pourcentage de progression
        int progressPercentage = (int) ((readyCount * 100) / Math.max(1, tickets.size()));
        response.setProgressPercentage(progressPercentage);

        // Déterminer le statut de session
        com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus sessionStatus = 
                determineSessionStatus(tickets);
        response.setSessionStatus(sessionStatus);

        // Message pour le serveur
        response.setServerMessage(buildServerMessage(sessionStatus, readyCount, tickets.size()));

        response.setCreatedAt(session.getSessionStart());

        return response;
    }

    /**
     * Construit les infos d'un ticket pour la réponse
     */
    private com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.StationTicketInfo buildStationTicketInfo(Ticket ticket) {
        com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.StationTicketInfo stationInfo = 
                new com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.StationTicketInfo();

        stationInfo.setTicketPublicId(ticket.getPublicId());
        stationInfo.setStation(ticket.getWorkStation());
        stationInfo.setStatus(ticket.getStatus());
        stationInfo.setItemCount(ticket.getItems() != null ? ticket.getItems().size() : 0);
        stationInfo.setMessage(ticket.getMessage());
        stationInfo.setPriority(ticket.getPriority());
        stationInfo.setPrintedAt(ticket.getPrintedAt());
        stationInfo.setReadyAt(ticket.getReadyAt());

        // Construire la liste des items
        if (ticket.getItems() != null) {
            List<com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.TicketItemInfo> items = 
                    new ArrayList<>();

            for (OrderItem orderItem : ticket.getItems()) {
                com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.TicketItemInfo itemInfo = 
                        new com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.TicketItemInfo();

                String itemName = orderItem.getMenuItem() != null ? 
                        orderItem.getMenuItem().getMenu().getName() : "Unknown";
                itemInfo.setPublicId(orderItem.getPublicId());
                itemInfo.setItemName(itemName);
                itemInfo.setQuantity(orderItem.getQuantity());
                itemInfo.setNotes(orderItem.getSpecialInstructions());

                items.add(itemInfo);
            }

            stationInfo.setItems(items);
        }

        return stationInfo;
    }

    /**
     * Détermine le statut global de la session basé sur les tickets
     */
    private com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus determineSessionStatus(
            List<Ticket> tickets) {

        if (tickets.isEmpty()) {
            return com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus.PENDING;
        }

        int totalTickets = tickets.size();
        long readyTickets = tickets.stream()
                .filter(t -> t.getStatus() == TicketStatus.READY || t.getStatus() == TicketStatus.SERVED)
                .count();
        long servedTickets = tickets.stream()
                .filter(t -> t.getStatus() == TicketStatus.SERVED)
                .count();

        // Tous les tickets servis
        if (servedTickets == totalTickets) {
            return com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus.SERVED;
        }

        // Tous les tickets prêts
        if (readyTickets == totalTickets) {
            return com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus.READY;
        }

        // Certains tickets prêts
        if (readyTickets > 0) {
            return com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus.PARTIALLY_READY;
        }

        // Au moins un ticket en préparation
        long preparingTickets = tickets.stream()
                .filter(t -> t.getStatus() == TicketStatus.PREPARING || 
                        t.getStatus() == TicketStatus.PRINTED)
                .count();
        if (preparingTickets > 0) {
            return com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus.PREPARING;
        }

        // Au moins un ticket en impression
        long printingTickets = tickets.stream()
                .filter(t -> t.getStatus() == TicketStatus.PRINTING)
                .count();
        if (printingTickets > 0) {
            return com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus.PRINTING;
        }

        // Par défaut: en attente
        return com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus.PENDING;
    }

    /**
     * Construit un message clair pour le serveur
     */
    private String buildServerMessage(
            com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus status,
            int readyCount,
            int totalTickets) {

        return switch (status) {
            case PENDING -> "En attente des tickets";
            case PRINTING -> "Tickets en impression...";
            case PREPARING -> "Les stations préparent...";
            case PARTIALLY_READY -> String.format("%d/%d stations prêtes - %d station(s) en cours", 
                    readyCount, totalTickets, totalTickets - readyCount);
            case READY -> "✓ PRÊT À SERVIR! Tous les items sont prêts";
            case SERVED -> "✓ Commande servie";
        };
    }

    /**
     * Construit une réponse vide quand aucun ticket
     */
    private com.follysitou.sellia_backend.dto.response.SessionTicketsResponse buildEmptySessionTicketsResponse(
            CustomerSession session) {

        com.follysitou.sellia_backend.dto.response.SessionTicketsResponse response = 
                new com.follysitou.sellia_backend.dto.response.SessionTicketsResponse();

        response.setSessionPublicId(session.getPublicId());
        response.setTableNumber(session.getTable() != null ? 
                session.getTable().getNumber() : "N/A");
        response.setCustomerName(session.getCustomerName());
        response.setTotalStations(0);
        response.setReadyStations(0);
        response.setPreparingStations(0);
        response.setPendingStations(0);
        response.setProgressPercentage(0);
        response.setSessionStatus(
                com.follysitou.sellia_backend.dto.response.SessionTicketsResponse.SessionStatus.PENDING);
        response.setServerMessage("Aucun ticket généré pour cette session");
        response.setCreatedAt(session.getSessionStart());

        return response;
    }
}
