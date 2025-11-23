# Guide Utilisateur - Sellia POS

## Table des matières

1. [Introduction](#introduction)
2. [Premiers pas](#premiers-pas)
3. [Guide Administrateur](#guide-administrateur)
4. [Guide Caissier](#guide-caissier)
5. [Guide Cuisine/Bar](#guide-cuisinebar)
6. [Gestion quotidienne](#gestion-quotidienne)
7. [FAQ](#faq)

---

## Introduction

Bienvenue dans Sellia POS, votre solution complète de gestion de point de vente pour restaurant. Ce guide vous accompagnera dans l'utilisation quotidienne de l'application.

### Rôles utilisateurs

| Rôle | Description |
|------|-------------|
| **Administrateur** | Gestion complète du système, rapports, configuration |
| **Caissier** | Prise de commandes, encaissement, tickets |
| **Cuisinier** | Consultation des commandes en cuisine |

---

## Premiers pas

### Connexion

1. Ouvrez l'application dans votre navigateur
2. Entrez votre **email** et **mot de passe**
3. Cliquez sur **Se connecter**

Selon votre rôle, vous serez redirigé vers :
- **Admin** : Tableau de bord administrateur
- **Caissier** : Sélection de caisse
- **Cuisinier** : Vue cuisine

### Déconnexion

Cliquez sur votre nom en haut à droite, puis **Déconnexion**.

---

## Guide Administrateur

### Tableau de bord

Le tableau de bord affiche :
- Chiffre d'affaires du jour
- Nombre de commandes
- Panier moyen
- Sessions actives
- Alertes stock

### Ouverture de journée

**Avant toute activité**, vous devez ouvrir la session globale :

1. Allez dans **Session globale**
2. Cliquez sur **Ouvrir la session**
3. Entrez le **montant initial** en caisse
4. Confirmez

Une fois la session ouverte, les caissiers peuvent commencer à travailler.

### Fermeture de journée

En fin de journée :

1. Vérifiez que tous les caissiers ont fermé leurs sessions
2. Consultez les **rapports du jour**
3. Allez dans **Session globale**
4. Cliquez sur **Fermer la session**
5. Entrez le **montant final** en caisse
6. Ajoutez des notes si nécessaire
7. Confirmez

### Gestion des utilisateurs

#### Créer un utilisateur

1. Allez dans **Utilisateurs**
2. Cliquez sur **Nouveau**
3. Remplissez :
   - Email
   - Mot de passe
   - Prénom et Nom
   - Rôle (Admin/Caissier/Cuisinier)
4. Cliquez sur **Enregistrer**

#### Modifier un utilisateur

1. Cliquez sur l'utilisateur dans la liste
2. Modifiez les informations
3. Cliquez sur **Mettre à jour**

#### Désactiver un utilisateur

Cliquez sur le bouton **Désactiver** à côté de l'utilisateur.

### Gestion des caisses

#### Créer une caisse

1. Allez dans **Caisses**
2. Cliquez sur **Nouvelle caisse**
3. Remplissez :
   - Nom (ex: "Caisse 1")
   - Numéro (ex: "C01")
   - Code PIN à 4 chiffres
4. Cliquez sur **Créer**

#### Assigner un utilisateur à une caisse

1. Sélectionnez la caisse
2. Cliquez sur **Assigner utilisateur**
3. Choisissez l'utilisateur
4. Confirmez

Un utilisateur peut être assigné à plusieurs caisses.

#### Changer le PIN d'une caisse

1. Sélectionnez la caisse
2. Cliquez sur **Changer PIN**
3. Entrez le nouveau PIN (4 chiffres)
4. Confirmez

### Gestion du catalogue

#### Catégories

1. Allez dans **Catégories**
2. Créez des catégories pour organiser vos produits :
   - Entrées
   - Plats
   - Desserts
   - Boissons
   - etc.

#### Produits

1. Allez dans **Produits**
2. Cliquez sur **Nouveau produit**
3. Remplissez :
   - Nom
   - Description
   - Prix
   - Catégorie
   - Station de travail (Cuisine/Bar/Pâtisserie/Caisse)
   - Image (optionnel)
4. Activez le produit
5. Cliquez sur **Enregistrer**

**Stations de travail** :
- **Cuisine** : Plats chauds, entrées
- **Bar** : Boissons, cocktails
- **Pâtisserie** : Desserts
- **Caisse** : Articles vendus directement

#### Menus

Les menus permettent de grouper des produits :

1. Allez dans **Menus**
2. Cliquez sur **Nouveau menu**
3. Donnez un nom (ex: "Menu du jour")
4. Ajoutez des articles au menu
5. Définissez les prix (peut être différent du prix produit)
6. Activez le menu
7. Enregistrez

### Gestion des tables

1. Allez dans **Tables**
2. Créez vos tables avec :
   - Numéro (ex: T01, T02...)
   - Capacité
   - Zone (Intérieur/Terrasse/VIP)

Un QR code est automatiquement généré pour chaque table.

### Rapports

#### Types de rapports

- **Session globale** : Rapport complet de la journée
- **Par caissier** : Performance d'une caisse
- **Par utilisateur** : Performance individuelle

#### Générer un rapport

1. Allez dans **Rapports**
2. Sélectionnez le type
3. Choisissez la période (max 30 jours)
4. Cliquez sur **Générer**

Vous pouvez :
- Consulter en ligne (JSON)
- Télécharger en PDF

#### Contenu des rapports

- Résumé des ventes
- Détail des commandes
- Top produits vendus
- Performance par caissier
- Statistiques par heure

### Analytics

Le module Analytics affiche :
- Évolution du CA
- Heures de pointe
- Produits les plus vendus
- Comparaisons périodiques

### Gestion des stocks

#### Consulter le stock

Allez dans **Inventaire** pour voir :
- Niveaux actuels
- Alertes de stock bas
- Mouvements récents

#### Enregistrer un mouvement

1. Cliquez sur **Nouveau mouvement**
2. Sélectionnez le produit
3. Choisissez le type :
   - Entrée (réception)
   - Sortie (perte, casse)
   - Ajustement
4. Entrez la quantité
5. Ajoutez une référence (facture, raison)
6. Confirmez

### Opérations de caisse

Pour gérer les entrées/sorties d'espèces :

1. Allez dans **Opérations de caisse**
2. Cliquez sur **Nouvelle opération**
3. Sélectionnez la caisse
4. Choisissez le type :
   - Dépôt
   - Retrait
5. Entrez le montant
6. Ajoutez une note explicative
7. Confirmez

---

## Guide Caissier

### Ouverture de session

1. Connectez-vous avec vos identifiants
2. Sélectionnez votre caisse
3. Entrez le **code PIN** à 4 chiffres
4. Votre session est ouverte

**Note** : La session globale doit être ouverte par l'admin au préalable.

### Prise de commande

#### Nouvelle commande

1. Cliquez sur **Nouvelle commande**
2. Sélectionnez la table (ou À emporter)
3. Ajoutez les articles :
   - Parcourez les catégories
   - Cliquez sur les produits/menus
   - Modifiez les quantités si besoin
   - Ajoutez des notes (allergies, cuisson...)
4. Vérifiez le récapitulatif
5. Cliquez sur **Valider**

#### Modifier une commande

1. Allez dans **Mes commandes**
2. Sélectionnez la commande
3. Modifiez les articles
4. Enregistrez

**Note** : Une commande en préparation ne peut plus être modifiée.

### Gestion des tickets

#### Mode tickets séparés

Chaque station reçoit son propre ticket :
- Le bar prépare ses articles
- La cuisine prépare les siens
- Idéal pour les gros volumes

#### Mode ticket unifié

Un seul ticket avec tous les articles groupés par station :
- Plus simple pour le suivi
- Idéal pour les petites structures

#### Imprimer un ticket

1. Allez dans **Tickets caisse**
2. Sélectionnez le ticket
3. Cliquez sur **Imprimer**

### Encaissement

1. Allez dans **Mes commandes** ou **Commandes en attente**
2. Sélectionnez la commande à encaisser
3. Vérifiez le montant
4. Appliquez une remise si nécessaire
5. Choisissez le mode de paiement :
   - Espèces
   - Carte bancaire
   - Mobile Money
6. Confirmez le paiement

Une facture est automatiquement générée.

### Appliquer une remise

1. Ouvrez la commande
2. Cliquez sur **Remise**
3. Entrez le montant ou pourcentage
4. Indiquez la raison
5. Confirmez

### Rechercher une facture

1. Allez dans **Recherche facture**
2. Entrez le numéro de facture ou la date
3. Consultez ou imprimez

### Fermeture de session

En fin de service :

1. Vérifiez vos commandes en cours
2. Cliquez sur **Fermer ma session**
3. Ajoutez des notes si nécessaire
4. Confirmez

### Verrouillage/Déverrouillage

Si vous devez vous absenter :

1. Cliquez sur **Verrouiller**
2. Votre session est sécurisée

Pour reprendre :
1. Entrez votre code PIN
2. Cliquez sur **Déverrouiller**

**Attention** :
- Après 3 tentatives échouées, la caisse est bloquée 15 minutes
- Après 15 minutes d'inactivité, déconnexion automatique

---

## Guide Cuisine/Bar

### Vue Cuisine

1. Connectez-vous avec vos identifiants
2. Vous voyez automatiquement les tickets de votre station

### Interface Kanban

Les tickets sont organisés en colonnes :
- **En attente** : Nouveaux tickets
- **En cours** : Préparation commencée
- **Prêt** : Commande terminée

### Traiter un ticket

1. Consultez le ticket :
   - Numéro de table
   - Articles à préparer
   - Notes spéciales
2. Déplacez le ticket vers **En cours**
3. Préparez les articles
4. Déplacez vers **Prêt** quand c'est terminé

### Priorités

Les tickets sont affichés par ordre de priorité :
- Les plus anciens en premier
- Tickets Bar traités avant Cuisine (les boissons doivent être prêtes en premier)

### Vue Bar

Identique à la cuisine, mais ne montre que les articles Bar :
- Boissons
- Cocktails
- Desserts (si assignés au bar)

---

## Gestion quotidienne

### Workflow type d'une journée

#### Matin - Ouverture

1. **Admin** : Ouvrir la session globale
2. **Admin** : Vérifier les stocks
3. **Caissiers** : Ouvrir leurs sessions
4. **Équipe** : Vérifier la mise en place

#### Service

1. **Caissiers** : Prendre les commandes
2. **Système** : Générer les tickets automatiquement
3. **Cuisine/Bar** : Préparer les commandes
4. **Cuisine/Bar** : Marquer comme prêt
5. **Service** : Servir les clients
6. **Caissiers** : Encaisser

#### Soir - Fermeture

1. **Caissiers** : Fermer leurs sessions
2. **Admin** : Consulter les rapports
3. **Admin** : Vérifier les montants
4. **Admin** : Fermer la session globale
5. **Admin** : Générer les rapports PDF

### Bonnes pratiques

#### Pour les administrateurs

- Ouvrez la session globale dès l'arrivée
- Vérifiez les alertes stock chaque matin
- Consultez les rapports quotidiennement
- Faites des sauvegardes régulières

#### Pour les caissiers

- Toujours vérifier le montant avant validation
- Utiliser les notes pour les demandes spéciales
- Verrouiller la caisse en cas d'absence
- Signaler toute anomalie

#### Pour la cuisine/bar

- Traiter les tickets dans l'ordre
- Vérifier les notes sur chaque commande
- Marquer les tickets comme prêts immédiatement
- Communiquer avec la caisse en cas de problème

### Gestion des problèmes courants

#### PIN oublié

Contactez l'administrateur pour :
- Réinitialiser le PIN de la caisse
- Vous assigner à une autre caisse

#### Caisse bloquée

Après 3 tentatives de PIN incorrectes :
- Attendre 15 minutes pour le déblocage automatique
- Ou contacter l'administrateur

#### Commande incorrecte

1. Si non payée : Modifier ou annuler
2. Si payée : Créer une nouvelle commande d'ajustement
3. Documenter l'erreur

#### Problème de connexion

1. Vérifier la connexion internet
2. Rafraîchir la page
3. Se reconnecter
4. Contacter le support technique

---

## FAQ

### Questions générales

**Q : Puis-je travailler sans connexion internet ?**
R : Non, l'application nécessite une connexion pour fonctionner.

**Q : Combien de caisses puis-je avoir ?**
R : Illimité. Créez autant de caisses que nécessaire.

**Q : Puis-je modifier une commande après paiement ?**
R : Non, vous devez créer une nouvelle commande ou un avoir.

### Questions Admin

**Q : Comment récupérer un mot de passe oublié ?**
R : Utilisez la fonction "Mot de passe oublié" sur la page de connexion.

**Q : Comment supprimer un utilisateur ?**
R : Les utilisateurs ne sont pas supprimés mais désactivés pour garder l'historique.

**Q : Puis-je modifier les prix des produits ?**
R : Oui, mais les commandes déjà passées gardent les anciens prix.

### Questions Caissier

**Q : Comment annuler une commande ?**
R : Sélectionnez la commande, cliquez sur "Annuler", et confirmez.

**Q : Comment appliquer une remise ?**
R : Ouvrez la commande, cliquez sur "Remise", entrez le montant.

**Q : Puis-je changer de caisse en cours de journée ?**
R : Oui, fermez votre session actuelle et ouvrez-en une nouvelle sur l'autre caisse.

### Questions Cuisine

**Q : Pourquoi je ne vois pas certaines commandes ?**
R : Vous ne voyez que les articles assignés à votre station (Cuisine ou Bar).

**Q : Comment signaler un produit manquant ?**
R : Contactez l'administrateur pour mettre à jour le stock.

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl + N` | Nouvelle commande |
| `Ctrl + P` | Imprimer |
| `Ctrl + F` | Rechercher |
| `Esc` | Fermer le dialogue |

---

## Support

En cas de problème :

1. Consultez cette documentation
2. Vérifiez les messages d'erreur
3. Contactez votre administrateur
4. Notez les détails du problème pour le support technique

---

## Glossaire

| Terme | Définition |
|-------|------------|
| **Session globale** | Période d'activité journalière, ouverte/fermée par l'admin |
| **Session caissier** | Période de travail d'un caissier sur une caisse |
| **Ticket** | Document de préparation pour la cuisine/bar |
| **WorkStation** | Station de travail (Cuisine, Bar, Pâtisserie, Caisse) |
| **PIN** | Code personnel à 4 chiffres pour les caisses |
| **Menu** | Groupement d'articles vendus ensemble |
| **Article menu (MenuItem)** | Un élément vendable dans un menu |
| **Produit** | Article de base avec prix et station |

---

Bonne utilisation de Sellia POS !
