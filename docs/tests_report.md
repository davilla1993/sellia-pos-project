
- Le total des ventes n'est pas actualisé ici: http://localhost:4200/admin/global-session. C'est 0 qui est affiché. 
On doit voir le total de toutes les ventes(Qr caisse code, caisses, admin, takeway) de la session active

- Ajouter les actions suivantes à l'écran des caissiers: 
    . vérouiller session : permet à un caissier de vérouiller temporairement son écran. Cela fait apparaître un cadenas sur son écran.
    . déverouiller session: permet à un caissier de dévérouiller sa session en cliquant sur le cadenas et en renseignant son code PIN
    . ouvrir session : chaque matin ou au début de sa vacation, le caissier ouvre sa session : après s'être connecté à son compte ( username et password),
      il renseigne son code PIN. Un autre modal lui apparaît dans lequel il renseigne le solde actuel de la caisse.
    . fermer session: à la fin de sa vacation, le caissier ferme sa session. Un modal est affiché avec trois champs: le solde à l'ouverture de session, 
        le solde à la fermeture de session à renseigner.

- Les opérations de caisse : entrées et sorties

- Rapport des ventes par table, caissier, takeaway
- Recherche de commande par numéro de facture
- Rapport des produits avec quantité vendu et prix total


