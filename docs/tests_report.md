1) création d'un utilisateur : 
    - mettre "Nom d'utilisateur" au lieu de username
    - transformer le(s) nom(s) en majiscule
    - transformer le(s) prénom(s) en capitalize ( c-à-d la première lettre de chaque prénom en majuscule) 
    - j'ai mis des lettres dans le champ téléphone et c'est passé: grave faille



 Deux problèmes: 
 
 1) Dans Menus & Articles, pour ajouter des articles à un menu, je dois encore saisir les
   articles comme si je les créais, ce qui n'est pas du tout normal puisque j'ai déjà créé des produits dans
   Produits -> Catalogue. 
   
2) Dans Caisse -> Nouvelle commande pour vendre, la liste n'affiche ni produits ni menu 




Raw API response: {
  "publicId": "b3c3ed60-854d-4127-8270-193d3dff244e",
  "name": "Poulet braisé",
  "description": "Poulet braisé au four, piment, oignon, poivron",
  "itemCount": 1,
  "items": [
    {
      "publicId": "9a6db595-2e6c-4a62-92d9-eaea8b29d6f0",
      "menuName": "Poulet braisé",
      "itemName": "Poulet braisé",
      "price": 5500,
      "description": "Poulet braisé au four, piment, oignon, poivron",
      "imageUrl": "/uploads/01649c1d-d5f4-4d39-8b47-66cb37d9bd04.jpeg",
      "preparationTime": 15,
      "allergens": null,
      "isSpecial": false,
      "specialDescription": ""
    }
  ]
}

First item:
{
  "publicId": "9a6db595-2e6c-4a62-92d9-eaea8b29d6f0",
  "menuName": "Poulet braisé",
  "itemName": "Poulet braisé",
  "price": 5500,
  "description": "Poulet braisé au four, piment, oignon, poivron",
  "imageUrl": "http://localhost:8080/api/files/products/afcf8993-ea94-4efd-884c-4a6950a5b81e.jpeg",
  "preparationTime": 15,
  "allergens": null,
  "isSpecial": false,
  "specialDescription": ""
}

Parfait! On va améliorer la présentation 