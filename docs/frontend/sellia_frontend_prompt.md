Conception de l’application Frontend du POS SaaS « Sellia »
🎯 Contexte et objectif

Tu es un architecte logiciel senior chargé de concevoir et générer l’interface utilisateur complète d’une application POS SaaS (Point of Sale) destinée aux restaurants et bars.
Cette première version est mono-entreprise (pilote), mais elle doit être conçue pour évoluer vers une architecture multi-tenant.
L’application doit être bilingue (français / anglais), responsive, fluide sur tablette et ordinateur, et optimisée pour les connexions faibles.

L’objectif est de produire l’interface complète du système, incluant la navigation, la logique de gestion d’état, les vues, et les interactions avec l’API.

🧩 Modules fonctionnels à intégrer
Module	Description
Caisse (POS)	Interface principale pour saisir et suivre les commandes, encaisser les paiements (espèces) et imprimer les tickets.
Cuisine	Affichage en temps réel des commandes reçues et gestion des statuts (EN ATTENTE, EN COURS, PRÊT, LIVRÉE).
Tables & QR Codes	Gestion visuelle des tables et affichage des QR Codes liés à chaque table.
Menus & Produits	CRUD complet des plats, boissons, catégories, variantes, prix, images et disponibilité.
Inventaire	Gestion du stock avec seuils d’alerte, ajustements automatiques et historique des mouvements.
Utilisateurs & Rôles	Gestion des comptes, rôles et permissions avec contrôle d’accès par profil.
Rapports & Statistiques	Tableaux et graphiques sur les ventes, les produits les plus vendus et la performance du personnel.
Notifications	Système d’alertes internes (commande prête, rupture de stock, etc.) avec mise à jour en temps réel.
Paramètres	Page de configuration du restaurant : logo, TVA, taxes, fuseau horaire, langues, devise, etc.
Support	Pages d’aide et formulaire de contact administrateur.
👥 Rôles et accès
Rôle	Accès principal
ADMIN	Gère utilisateurs, rôles, menus, QR Codes, rapports et configuration générale.
CAISSIER	Gère commandes, encaissements et rapports de vente.
CUISINIER	Consulte et met à jour le statut des commandes.

L’interface doit s’adapter dynamiquement selon le rôle connecté.

🔄 Workflow de commande (interface à implémenter)

Le client scanne le QR Code et accède au menu.

Il sélectionne les produits et envoie sa commande.

Le caissier visualise la commande et l’envoie à la cuisine.

Le cuisinier met à jour le statut de la commande.

Les statuts changent en temps réel sur les écrans du caissier et du client.

Le client règle sa facture à la fin.

⚙️ Contraintes UI et UX

Interface fluide, intuitive et adaptée aux écrans tactiles.

Mode clair/sombre automatique.

Gestion hors ligne (synchronisation différée).

Navigation simplifiée par rôles.

Système de notifications en temps réel.

Gestion multilingue (français/anglais).

Conception modulaire et extensible (facile à connecter à d’autres API).

🧱 Composants à concevoir

Page d’accueil (connexion, logo, langue)

Tableau de bord général

Gestion des utilisateurs et rôles

Interface de caisse (prise de commande)

Interface cuisine (affichage des commandes en cours)

Gestion des produits, catégories, menus

Gestion du stock et inventaire

Rapports (graphiques, filtres, export)

Page des paramètres et configuration

Interface client via QR Code

Système de notifications temps réel

🚀 Plan MVP (par étapes)

Phase 1 : Authentification et gestion des rôles.

Phase 2 : Interface de menus, produits et tables.

Phase 3 : Module caisse et cuisine avec mise à jour en temps réel.

Phase 4 : Gestion du stock et rapports.

Phase 5 : Interface client via QR Code.

Phase 6 : Notifications, design final et optimisation.

🎓 Attentes du livrable

L’IA doit produire un document structuré ou un projet fonctionnel incluant :

Une architecture frontend claire et modulaire.

Les composants, pages et services nécessaires à chaque module.

Un système de gestion d’état cohérent et extensible.

Une stratégie multilingue et responsive.

Une base pour la communication temps réel avec l’API.

Une navigation sécurisée selon les rôles et permissions.

Soumets le livrable final sous forme de spécification technique complète ou code généré prêt à être utilisé comme socle frontend du MVP Sellia.