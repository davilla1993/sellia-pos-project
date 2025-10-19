Restons toujours dans le menu du caissier. On va le finir avant d'aller sur autre chose. Pour l'instant, je ne vois que l'écran qui permet au caissier de passer directement commande pour un client. Il manque l'écran pour afficher toutes les commandes avec les différents filtres: en attente, acceptée, en préparation, prete etc...(confère enum OrderStatus du backend). Comme il est précisé au début du projet, il peut y avoir plusieurs caissiers. Et donc, chaque caissier doit voir uniquement ces propres commandes qu'il a acceptées. Il faut aussi l'écran pour accepter les nouvelles commandes. Il faut te référer au fichier pos_saas_prompt.md dans /docs/backend pour t'imprégner du workflow de commande. Il faut l'écran d'encaissement et après encaissement, le reçu est généré automatiquement(reçu de type imprimante caisse)



 Tout passe par le POS, on n'a pas besoin de page web public. Le customer journey: 
 1) le client scanne le qr code et passe commande -> le caissier accepte la commande -> le cuisine reçoit la commande, accepte et gère les statuts jusqu'à LIVREE -> le client vient à la caisse pour payer -> le caissier encaisse -> le statut change en PAYEE -> FIN: la session de la table est terminée. 
 NB: Entre temps, le client peut passer plusieurs commandes à la meme table en scannant le qr code. A la fin, on lui donne un seul reçu qui regroupe toutes les commandes. C'est pour gérer cet aspect qu'on a prévu CustomerSession dans le code.
 
 2) le serveur ou la serveuse prend la commande du client -> le caissier enregistre la commande -> ça passe à la cuisine -> la cuisine accepte et gère les status          
   jusqu'à LIVREE -> le client paie -> le statut change en PAYEE -> le caissier encaisse  -> FIN
NB: Entre temps, le client peut passer plusieurs commandes. Le caissier a la main pour modifier la commande seulement en y ajoutant les nouveaux produits demandés par le client.

Dans les deux cas, tant que le client n'a pas encore payé, le caissier a la possibilité d'ajouter les nouvelles commandes à la première. Attention ! il ne peut plus modifier les commandes qui sont déjà en cours de préparation à la cuisine mais il peut toutefois rajouter d'autres produits commandés par le client.


Bonne question. C'est dans le POS Casher. Je pense qu'il va falloir revoir l'écran de Nouvelle commande
   pour supprimer la partie paiement car cet écran doit servir seulement à enrégister les commandes des
   clients. N'oublies pas, toutes les commandes sont liées à une table et c'est l'id de table qui nous permet
    d'identifier les clients puisque prendre les informations ( nom, numéro de téléphone) des clients est
   optionnel. Et donc, si un client qui a déjà passé commande demande de nouveaux produits, c'est grace au
   numéro de table que le gérant pourra identifier la commande et ajouter les nouveaux produits à la
   commande. Plus tard, on gérera le cas des commandes à emporter. Clair ? Des questions ?