**Phase 2 - SUPPORT (Moyennes Priorités)**

   Voici les 3 écrans de la Phase 2 à ajouter:

   **1️⃣ Settings Complète** (`/admin/settings`)

   Actuellement: Juste des cartes vides
   À faire:
   •  🏢 Restaurant
     •  Nom, adresse, téléphone, email
     •  Logo, devise (XAF), fuseau horaire
     •  Heures d'ouverture

   •  💳 Modes de Paiement
     •  Espèces (actif/inactif)
     •  Carte bancaire (active/inactive)
     •  Chèque
     •  Mobile Money
     •  Crédit client

   •  🔔 Notifications
     •  Alertes stock faible (email/SMS)
     •  Alerte commandes impayées
     •  Notifications de réception

   •  🔐 Sécurité
     •  Historique d'accès (logs)
     •  IP whitelist
     •  2FA (activer/désactiver)
     •  Sessions actives (forcer la déconnexion)

   ──────────────────────────────────────────

   **2️⃣ Stock Alerts** (`/admin/stock-alerts`)

   Nouveau composant:
   •  Tableau des produits en alerte avec:
     •  Nom produit
     •  Stock actuel
     •  Stock minimum défini
     •  Quantité à commander = min - actuel
     •  Bouton "Ajuster stock rapide"

   •  Gestion des seuils:
     •  Ajouter/modifier le seuil minimum pour chaque produit
     •  Ajouter/modifier le seuil maximum
     •  Ajouter notes sur les produits

   •  Filtrages:
     •  Critiques (sous le minimum)
     •  Faible (75% du minimum)
     •  À surveiller

   ──────────────────────────────────────────

   **3️⃣ Analytics Dashboard** (`/admin/analytics`)

   Nouveau composant avec graphiques:
   •  Graphiques:
     •  📈 CA par jour (ligne chart)
     •  📊 Top 10 produits (bar chart)
     •  🕐 Heures de pointe (heat map)
     •  👥 Activité par caissier (pie chart)

   •  KPIs avancés:
     •  Panier moyen
     •  Nombre de transactions
     •  Taux de remise moyen
     •  Temps moyen de transaction

   •  Filtres:
     •  Plage de dates
     •  Par caissier
     •  Par produit/catégorie

   ──────────────────────────────────────────

   **Phase 3 - POLISH (Basses Priorités)**

   Si tu veux après la Phase 2:

   1. Améliorer Tables
     •  Formulaire création/édition de tables
     •  Import/export CSV de tables
     •  Bulk QR generation

   2. Export Rapports
     •  Format Excel (XLSX)
     •  Format CSV
     •  Google Sheets sync

   3. Autres améliorations
     •  Thème clair/sombre
     •  Notifications temps réel avec WebSocket
     •  Graphs interactifs

   ──────────────────────────────────────────