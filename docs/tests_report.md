- Séparer les commandes bars des commandes resto

- Dans le menu Combo gourmand, il y a quatre produits: Poulet braisé, Burger classique, Champagne rosé, Jus d’ananas frais. Mais quand on commande ce combo, l'affichage à la cuisine n'est pas bonne. Les détails de la commande montre seulement: 1x 🍔 Burger classique. Que ce soit un seul ou plusieurs menus qui sont commandés, le cuisiner doit voir tous les articles de la station CUISINE de la commande. Le problème ne doit pas se poser puisque tous les produits d'une commande se retrouve dans OrderItem.

- Problème de réduction à la caisse

- le champ last_login n'est jamais rempli

Logs de l'écran cuisine:

Kitchen - Orders received: 
[
    {
        "publicId": "936b629f-8314-4522-b8ed-44e335e31058",
        "orderNumber": "20251030-1740-3977",
        "table": {
            "publicId": "f631605e-356f-41d2-a566-541da6fcfa2d",
            "number": "V001",
            "name": "VIP1",
            "room": "VIP1",
            "capacity": 2,
            "isVip": true,
            "occupied": false
        },
        "orderType": "TABLE",
        "customerSession": {
            "publicId": "5230c062-e2ed-481f-911f-c9cedf5c9ac2",
            "qrCode": null,
            "startedAt": "2025-10-30T17:16:38.367709",
            "endedAt": null
        },
        "cashierSession": null,
        "invoice": null,
        "items": [
            {
                "publicId": "ded0853c-ccae-4cb8-bb96-26b676dec984",
                "menuItem": {
                    "publicId": "0348464b-764a-4670-b66a-6e0dd181cfa0",
                    "menuName": "Combo gourmand",
                    "priceOverride": null,
                    "bundlePrice": null,
                    "products": [
                        {
                            "publicId": "f2f1d125-fc10-4dce-826c-614f4cc6b054",
                            "name": "Poulet braisé",
                            "imageUrl": "/uploads/01649c1d-d5f4-4d39-8b47-66cb37d9bd04.jpeg",
                            "preparationTime": 30,
                            "workStation": "CUISINE"
                        }
                    ]
                },
                "product": {
                    "publicId": "f2f1d125-fc10-4dce-826c-614f4cc6b054",
                    "name": "Poulet braisé",
                    "imageUrl": "/uploads/01649c1d-d5f4-4d39-8b47-66cb37d9bd04.jpeg",
                    "preparationTime": 30,
                    "workStation": "CUISINE"
                },
                "quantity": 1,
                "unitPrice": 30000,
                "totalPrice": 30000,
                "notes": null,
                "workStation": "CUISINE"
            }
        ],
        "status": "ACCEPTEE",
        "totalAmount": 30000,
        "discountAmount": 0,
        "finalAmount": 30000,
        "notes": "",
        "isPaid": false,
        "paymentMethod": null,
        "paidAt": null,
        "acceptedAt": "2025-10-30T17:40:36.226603",
        "completedAt": null,
        "customerName": "",
        "customerPhone": "",
        "createdAt": "2025-10-30T17:40:28.896438",
        "updatedAt": "2025-10-30T17:40:36.237901"
    }
]

Item: {
    "product": "Poulet braisé",
    "workStation": "CUISINE",
    "menuItem": {
        "publicId": "0348464b-764a-4670-b66a-6e0dd181cfa0",
        "menuName": "Combo gourmand",
        "priceOverride": null,
        "bundlePrice": null,
        "products": [
            {
                "publicId": "f2f1d125-fc10-4dce-826c-614f4cc6b054",
                "name": "Poulet braisé",
                "imageUrl": "/uploads/01649c1d-d5f4-4d39-8b47-66cb37d9bd04.jpeg",
                "preparationTime": 30,
                "workStation": "CUISINE"
            }
        ]
    },
    "menuProducts": [
        {
            "publicId": "f2f1d125-fc10-4dce-826c-614f4cc6b054",
            "name": "Poulet braisé",
            "imageUrl": "/uploads/01649c1d-d5f4-4d39-8b47-66cb37d9bd04.jpeg",
            "preparationTime": 30,
            "workStation": "CUISINE"
        }
    ]
}

Kitchen - Orders received: Array(4)
[
    {
        "publicId": "7d06ef82-c681-4c74-a5a0-4fcc05ec7d53",
        "orderNumber": "20251030-1732-3347",
        "table": {
            "publicId": "d110053e-43dc-4885-9b5b-dcb2d76cc2f3",
            "number": "V002",
            "name": "VIP2",
            "room": "VIP2",
            "capacity": 3,
            "isVip": true,
            "occupied": false
        },
        "orderType": "TABLE",
        "customerSession": {
            "publicId": "0bf29a73-3a58-410e-a595-0af9845c766e",
            "qrCode": null,
            "startedAt": "2025-10-30T17:32:49.954926",
            "endedAt": null
        },
        "cashierSession": null,
        "invoice": null,
        "items": [
            {
                "publicId": "a1085591-ece0-4f25-a216-f64fe5772308",
                "menuItem": {
                    "publicId": "0348464b-764a-4670-b66a-6e0dd181cfa0",
                    "menuName": "Combo gourmand",
                    "priceOverride": null,
                    "bundlePrice": null,
                    "products": [
                        {
                            "publicId": "f2f1d125-fc10-4dce-826c-614f4cc6b054",
                            "name": "Poulet braisé",
                            "imageUrl": "/uploads/01649c1d-d5f4-4d39-8b47-66cb37d9bd04.jpeg",
                            "preparationTime": 30,
                            "workStation": "CUISINE"
                        }
                    ]
                },
                "product": {
                    "publicId": "f2f1d125-fc10-4dce-826c-614f4cc6b054",
                    "name": "Poulet braisé",
                    "imageUrl": "/uploads/01649c1d-d5f4-4d39-8b47-66cb37d9bd04.jpeg",
                    "preparationTime": 30,
                    "workStation": "CUISINE"
                },
                "quantity": 1,
                "unitPrice": 30000,
                "totalPrice": 30000,
                "notes": null,
                "workStation": "CUISINE"
            }
        ],
        "status": "LIVREE",
        "totalAmount": 30000,
        "discountAmount": 0,
        "finalAmount": 30000,
        "notes": "",
        "isPaid": false,
        "paymentMethod": null,
        "paidAt": null,
        "acceptedAt": "2025-10-30T17:33:01.486762",
        "completedAt": "2025-10-30T17:40:19.692684",
        "customerName": "",
        "customerPhone": "",
        "createdAt": "2025-10-30T17:32:54.676663",
        "updatedAt": "2025-10-30T17:40:19.706356"
    },
    {
        "publicId": "bd2356f7-e97a-4dc6-82ad-2940bed0cb57",
        "orderNumber": "20251030-1716-6547",
        "table": {
            "publicId": "f631605e-356f-41d2-a566-541da6fcfa2d",
            "number": "V001",
            "name": "VIP1",
            "room": "VIP1",
            "capacity": 2,
            "isVip": true,
            "occupied": false
        },
        "orderType": "TABLE",
        "customerSession": {
            "publicId": "5230c062-e2ed-481f-911f-c9cedf5c9ac2",
            "qrCode": null,
            "startedAt": "2025-10-30T17:16:38.367709",
            "endedAt": null
        },
        "cashierSession": null,
        "invoice": null,
        "items": [
            {
                "publicId": "d306eb93-790a-4804-8318-e74c6177eca7",
                "menuItem": {
                    "publicId": "0348464b-764a-4670-b66a-6e0dd181cfa0",
                    "menuName": "Combo gourmand",
                    "priceOverride": null,
                    "bundlePrice": null,
                    "products": [
                        {
                            "publicId": "f2f1d125-fc10-4dce-826c-614f4cc6b054",
                            "name": "Poulet braisé",
                            "imageUrl": "/uploads/01649c1d-d5f4-4d39-8b47-66cb37d9bd04.jpeg",
                            "preparationTime": 30,
                            "workStation": "CUISINE"
                        }
                    ]
                },
                "product": {
                    "publicId": "f2f1d125-fc10-4dce-826c-614f4cc6b054",
                    "name": "Poulet braisé",
                    "imageUrl": "/uploads/01649c1d-d5f4-4d39-8b47-66cb37d9bd04.jpeg",
                    "preparationTime": 30,
                    "workStation": "CUISINE"
                },
                "quantity": 1,
                "unitPrice": 30000,
                "totalPrice": 30000,
                "notes": null,
                "workStation": "CUISINE"
            }
        ],
        "status": "LIVREE",
        "totalAmount": 30000,
        "discountAmount": 0,
        "finalAmount": 30000,
        "notes": "",
        "isPaid": false,
        "paymentMethod": null,
        "paidAt": null,
        "acceptedAt": "2025-10-30T17:17:06.665186",
        "completedAt": "2025-10-30T17:34:30.824348",
        "customerName": "",
        "customerPhone": "",
        "createdAt": "2025-10-30T17:16:51.275384",
        "updatedAt": "2025-10-30T17:34:30.833424"
    },
    {
        "publicId": "c5014bb2-6327-4079-ac3c-f06a3853ab78",
        "orderNumber": "20251030-1705-6511",
        "table": {
            "publicId": "5cd1109e-037f-44a2-bb39-0e146759b6b5",
            "number": "T03",
            "name": "Jardin",
            "room": "Jardin",
            "capacity": 5,
            "isVip": false,
            "occupied": false
        },
        "orderType": "TABLE",
        "customerSession": {
            "publicId": "d18d3824-6ee4-4941-9e15-388b9bba3595",
            "qrCode": null,
            "startedAt": "2025-10-30T16:36:18.594497",
            "endedAt": null
        },
        "cashierSession": null,
        "invoice": null,
        "items": [
            {
                "publicId": "ad424941-43d3-4ad0-b1af-cb82403cc6c7",
                "menuItem": {
                    "publicId": "13abd681-09f6-4faf-bf6e-640caa43f682",
                    "menuName": "Combo buger + frites + coca cola",
                    "priceOverride": 1000,
                    "bundlePrice": null,
                    "products": [
                        {
                            "publicId": "2bcc6680-5762-4007-a313-1bf6f59991b1",
                            "name": "🍔 Burger classique",
                            "imageUrl": "/uploads/06ea30e3-6b2c-4be6-bfd1-cf3903daf56a.jpeg",
                            "preparationTime": 0,
                            "workStation": "CUISINE"
                        }
                    ]
                },
                "product": {
                    "publicId": "2bcc6680-5762-4007-a313-1bf6f59991b1",
                    "name": "🍔 Burger classique",
                    "imageUrl": "/uploads/06ea30e3-6b2c-4be6-bfd1-cf3903daf56a.jpeg",
                    "preparationTime": 0,
                    "workStation": "CUISINE"
                },
                "quantity": 1,
                "unitPrice": 5000,
                "totalPrice": 5000,
                "notes": null,
                "workStation": "CUISINE"
            }
        ],
        "status": "LIVREE",
        "totalAmount": 5000,
        "discountAmount": 0,
        "finalAmount": 5000,
        "notes": "",
        "isPaid": false,
        "paymentMethod": null,
        "paidAt": null,
        "acceptedAt": "2025-10-30T17:05:29.085504",
        "completedAt": "2025-10-30T17:34:32.250381",
        "customerName": "",
        "customerPhone": "",
        "createdAt": "2025-10-30T17:05:17.508921",
        "updatedAt": "2025-10-30T17:34:32.259448"
    },
    {
        "publicId": "2f8a9ede-a5f6-42e7-901a-0724613aee43",
        "orderNumber": "20251026-58598",
        "table": {
            "publicId": "837f008c-a9d3-477b-bcd7-076ecea1e5a6",
            "number": "T02",
            "name": "Balcon",
            "room": "Balcon",
            "capacity": 5,
            "isVip": false,
            "occupied": false
        },
        "orderType": "TABLE",
        "customerSession": {
            "publicId": "6e8ece87-b32b-4d2c-a499-5129bcfe94d9",
            "qrCode": null,
            "startedAt": "2025-10-26T22:42:38.407016",
            "endedAt": null
        },
        "cashierSession": null,
        "invoice": null,
        "items": [
            {
                "publicId": "46f2e6df-4769-4bd9-b78c-b0a930e4350a",
                "menuItem": {
                    "publicId": "64576562-e967-4a9b-8b16-54e60b1eab02",
                    "menuName": "Combo buger + frites + coca cola",
                    "priceOverride": 2500,
                    "bundlePrice": null,
                    "products": [
                        {
                            "publicId": "8b584107-a9bd-4e28-a37f-8e18c2b65cbc",
                            "name": "🌞 Jus tropical été",
                            "imageUrl": "/uploads/155c91d6-3fd4-4e99-b677-61e3d015bcf7.jpg",
                            "preparationTime": 0,
                            "workStation": "CUISINE"
                        }
                    ]
                },
                "product": {
                    "publicId": "8b584107-a9bd-4e28-a37f-8e18c2b65cbc",
                    "name": "🌞 Jus tropical été",
                    "imageUrl": "/uploads/155c91d6-3fd4-4e99-b677-61e3d015bcf7.jpg",
                    "preparationTime": 0,
                    "workStation": "CUISINE"
                },
                "quantity": 1,
                "unitPrice": 5000,
                "totalPrice": 5000,
                "notes": null,
                "workStation": "CUISINE"
            }
        ],
        "status": "LIVREE",
        "totalAmount": 5000,
        "discountAmount": null,
        "finalAmount": 5000,
        "notes": "Pas de piment et de mayonnaise.",
        "isPaid": false,
        "paymentMethod": null,
        "paidAt": null,
        "acceptedAt": "2025-10-26T22:42:47.227178",
        "completedAt": "2025-10-29T16:44:25.503296",
        "customerName": null,
        "customerPhone": null,
        "createdAt": "2025-10-26T22:42:38.688301",
        "updatedAt": "2025-10-29T16:44:25.534031"
    }
]

Item: Object
kitchen.component.ts:254 Item: Object
kitchen.component.ts:254 Item: Object
kitchen.component.ts:254 Item: Object


Rien sur l'écran de Bar

