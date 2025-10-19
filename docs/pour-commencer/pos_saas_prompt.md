🚀 Conception d’une application POS SaaS (Phase pilote mono-entreprise)

Rôle de l’IA :
Tu es un architecte logiciel senior spécialisé en conception d’applications POS (Point of Sale) et en architectures SaaS.

Ta mission est de concevoir la spécification technique complète d’un POS SaaS pour restaurants et bars, destiné à une seule entreprise pilote (pas encore multi-tenant).

🎯 Objectif général

Je veux une application POS complète, utilisable sur ordinateur et tablette, optimisée pour les connexions faibles et bilingue (français / anglais).
Les clients passent commande via QR Code, et le personnel gère les commandes, tables, produits, stocks, utilisateurs et rapports.

🧩 Modules fonctionnels à inclure

| Module                      | Description                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Caisse (POS)**            | Interface principale pour prendre les commandes, encaisser (espèces), imprimer les tickets et suivre les ventes. |
| **Cuisine**                 | Affichage des commandes reçues, mise à jour des statuts (*EN ATTENTE*, *EN COURS*, *PRÊT*, *LIVRÉE*).            |
| **Tables & QR Codes**       | Gestion des tables et génération de QR Codes permettant aux clients d’accéder au menu et de commander.           |
| **Menus & Produits**        | CRUD complet (plats, boissons, catégories, variantes, prix, images, disponibilité).                              |
| **Inventaire**              | Gestion du stock avec seuils d’alerte, ajustements automatiques et historique.                                   |
| **Utilisateurs & Rôles**    | Gestion des utilisateurs (ADMIN, CAISSIER, CUISINIER) avec permissions et audit.                                 |
| **Rapports & Statistiques** | Suivi des ventes journalières, produits les plus vendus, performances du personnel.                              |
| **Notifications**           | Alertes internes (commande prête, rupture de stock, etc.) via WebSocket.                                         |
| **Paramètres**              | Configuration du restaurant : nom, logo, TVA, fuseau horaire, taxes, langue.                                     |
| **Support**                 | Page d’aide/FAQ et contact administrateur.                                                                       |

👥 Rôles et permissions

| Rôle          | Description                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------- |
| **ADMIN**     | Maître absolu. Gère utilisateurs, rôles, menus, QR Codes, rapports et configuration générale. |
| **CAISSIER**  | Gère commandes, encaissements, rapports de vente.                                             |
| **CUISINIER** | Consulte et met à jour le statut des commandes.                                               |

🔄 Workflow de commande (obligatoire)

1. Le client scanne le QR Code de sa table et passe commande.
2. La commande apparaît sur l’écran du caissier.
3. Le caissier accepte la commande → envoi à la cuisine.
4. La cuisine accepte la commande → statut = ACCEPTEE.
5. La cuisine gère les statuts : EN PRÉPARATION, PRÊT, LIVRÉE.
6. Le client et le caissier voient ces changements en temps réel.
7. À la fin, le client règle une seule facture regroupant toutes ses commandes.

🏗️ Architecture et technologies à utiliser

| Couche                | Technologies                                                              |
| --------------------- | ------------------------------------------------------------------------- |
| **Backend**           | Spring Boot 3 (Java 21), RESTful API, architecture modulaire en couches.  |   
| **Frontend**          | Angular 19 (standalone components), responsive design, PWA.               |
| **Base de données**   | PostgreSQL.                                                               |
| **Authentification**  | JWT + Refresh Token, rôles et permissions.                                |
| **Stockage fichiers** | Local (`/uploads`) ou MinIO (images produits et reçus).                   |
| **QR Code**           | Génération côté backend (librairie `ZXing`).                              |
| **Notifications**     | WebSocket (Spring Boot) pour communication caisse ↔ cuisine.              |
| **Paiement**          | Espèces uniquement (Stripe, TMoney, Flooz à venir).                       |

⚙️ Contraintes techniques obligatoires

1. UUID publicId pour toutes les entités exposées publiquement.
2. AuditLog & BaseEntity intégrés dans le modèle.
3. Soft delete & soft update (aucune suppression physique).
4. Pagination sur toutes les listes.
5. Numérotation automatique des commandes : 00001, 00002, etc.
6. Politique de mot de passe robuste :

      - min. 6 caractères
      - ≥ 1 majuscule, ≥ 1 chiffre, ≥ 1 caractère spécial.

7. ADMIN :

      - seul à générer les QR Codes (notamment VIP) ;
      - seul à imprimer les rapports ;
      - crée / désactive les comptes utilisateurs ;
      - peut réinitialiser les mots de passe.

8. Première connexion → changement obligatoire du mot de passe.
9. Menus dynamiques : STANDARD, VIP, EXCEPTIONNEL, PROMOTIONNEL, PERSONNALISÉ.
10. Espaces VIP → QR Codes spéciaux affichant uniquement les menus VIP.
11. Plusieurs caissiers possibles (bar, restaurant, étage, VIP, etc.).
12. Stockage local des images dans /uploads/products, /uploads/receipts.
13. Stockage local des Qr codes dans /uploads/qrcodes
14. Possibilité pour le caissier de faire des réductions
15. Il faut des dto ( request et response) et mappers ( pas de mapstruct, construisons nos propres mappers)

🧩 Entités principales (à modéliser)

- User, Role, Permission, AuditLog, BaseEntity
- Product, Category, Menu, MenuItem
- Table, Order, OrderItem, Payment
- Stock, InventoryMovement
- Notification, Setting
Inclure un ERD clair avec les relations (OneToMany, ManyToMany, etc.) et les principaux champs.

🔗 Endpoints REST (à définir)

- /api/auth/** : connexion, refresh, mot de passe.
- /api/users/** : CRUD utilisateurs, changement mot de passe, activation.
- /api/products/** : CRUD produits et catégories.
- /api/menus/** : gestion des menus et types.
- /api/orders/** : création, suivi, mise à jour des commandes.
- /api/tables/** : gestion des tables et QR Codes.
- /api/reports/** : statistiques et rapports journaliers.
- /api/notifications/** : messages temps réel.
- /api/settings/** : configuration globale.
Chaque endpoint doit être sécurisé selon le rôle utilisateur.

🔄 Communication temps réel

- WebSocket entre les modules caisse et cuisine.
- Diffusion instantanée des changements de statut de commande.
- Le client voit le statut en temps réel via l’interface QR Code.

🚀 Plan MVP (par étapes)

1. Phase 1 : Authentification, rôles, utilisateurs.
2. Phase 2 : Menus, produits, tables, QR Codes.
3. Phase 3 : Commandes, caisse, cuisine (workflow complet + WebSocket).
4. Phase 4 : Inventaire et rapports.
5. Phase 5 : Interface client (QR Code, suivi commande).
6. Phase 6 : Notifications et finalisation.

☁️ Déploiement

- Local (développement) : Docker Compose (Spring Boot + PostgreSQL + Angular).
- Production :
 API : Render / Railway / AWS EC2
DB : PostgreSQL RDS
Stockage : S3 / MinIO
CI/CD : GitLab ou GitHub Actions

🎓 Attentes du livrable

Je veux que tu :

1. Fournisses une architecture complète (backend + frontend + sécurité).
2. Proposes le modèle de données (ERD) et les principales entités.
3. Fournisses les endpoints REST principaux et leur structure.
4. Décrives la communication en temps réel entre caisse et cuisine.
5. Élabores un plan MVP clair et progressif.
6. Proposes un plan de déploiement (local + cloud).


Soumets ta réponse sous forme de document structuré et professionnel, prêt à être utilisé comme spécification technique pour le développement du MVP.