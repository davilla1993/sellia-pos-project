# Product Image Upload Guide

## Overview
Products can now have images uploaded during creation and updated at any time. Images are stored locally in `/uploads/products/` directory and can be retrieved via a dedicated endpoint.

## Create Product with Image

### Endpoint
```
POST /api/products
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

### Request Parameters (form-data)
- **name** (required): Product name (max 100 chars)
- **description**: Product description (max 500 chars)
- **price** (required): Price in cents (positive integer)
- **discountPrice**: Discounted price in cents
- **stockQuantity** (required): Stock quantity
- **minStockThreshold**: Minimum stock threshold
- **categoryId** (required): Category ID
- **image**: Product image file (JPEG, PNG, GIF, or WebP, max 5MB)
- **available**: Boolean (default: true)
- **preparationTime**: Preparation time in minutes
- **isVip**: Boolean (default: false)

### Example (curl)
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=Croissant" \
  -F "description=Delicious French croissant" \
  -F "price=300" \
  -F "stockQuantity=50" \
  -F "categoryId=1" \
  -F "image=@/path/to/image.jpg" \
  -F "preparationTime=5" \
  -F "available=true"
```

### Success Response (201 Created)
```json
{
  "publicId": "uuid-string",
  "name": "Croissant",
  "description": "Delicious French croissant",
  "price": 300,
  "available": true,
  "imageUrl": "/uploads/products/uuid-filename.jpg",
  "preparationTime": 5,
  "isVip": false,
  "lowStock": null,
  "categories": [
    {
      "publicId": "category-uuid",
      "name": "Pastries"
    }
  ],
  "createdAt": "2025-10-16T18:30:00",
  "updatedAt": "2025-10-16T18:30:00"
}
```

## Update Product with New Image

### Endpoint
```
PUT /api/products/{publicId}
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

### Request Parameters
Same as creation endpoint. Only provided fields will be updated.
If a new image is provided, the old image will be automatically deleted.

### Example (curl)
```bash
curl -X PUT http://localhost:8080/api/products/product-uuid \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=Updated Croissant" \
  -F "image=@/path/to/new-image.png"
```

## Get Product with Image URL

### Endpoint
```
GET /api/products/{publicId}
Authorization: Bearer {token}
```

### Response
```json
{
  "publicId": "uuid-string",
  "name": "Croissant",
  "description": "Delicious French croissant",
  "price": 300,
  "available": true,
  "imageUrl": "/uploads/products/uuid-filename.jpg",
  "preparationTime": 5,
  "isVip": false,
  "lowStock": null,
  "categories": [
    {
      "publicId": "category-uuid",
      "name": "Pastries"
    }
  ],
  "createdAt": "2025-10-16T18:30:00",
  "updatedAt": "2025-10-16T18:30:00"
}
```

## Download/View Product Image

### Endpoint
```
GET /api/products/images/{filename}
```

### Example
If `imageUrl` is `/uploads/products/a1b2c3d4-e5f6.jpg`, download via:
```
GET http://localhost:8080/api/products/images/a1b2c3d4-e5f6.jpg
```

### Response
- **Status**: 200 OK
- **Content-Type**: image/jpeg
- **Body**: Image binary data

## Image Specifications

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Size Limits
- Maximum file size: 5MB
- Recommended: Keep images under 2MB for optimal performance

### Storage
- Images are stored in: `./uploads/products/`
- Filenames are auto-generated as UUID to prevent conflicts
- Original filename is not preserved

## Delete Product

When a product is deleted, its associated image is automatically removed from the server.

### Endpoint
```
DELETE /api/products/{publicId}
Authorization: Bearer {token}
```

### Notes
- Only ADMIN role can delete products
- Image deletion happens automatically before soft-deleting the product
- If image deletion fails, the product deletion still completes

## Error Handling

### Image Too Large
```json
{
  "timestamp": "2025-10-16T18:30:00",
  "status": 400,
  "error": "Erreur de validation",
  "message": "File size must not exceed 5MB",
  "path": "/api/products"
}
```

### Unsupported Image Format
```json
{
  "timestamp": "2025-10-16T18:30:00",
  "status": 400,
  "error": "Erreur de validation",
  "message": "Only JPEG, PNG, GIF, and WebP images are allowed",
  "path": "/api/products"
}
```

### Product Not Found
```json
{
  "timestamp": "2025-10-16T18:30:00",
  "status": 404,
  "error": "Ressource non trouvée",
  "message": "Product not found with publicId: invalid-uuid",
  "path": "/api/products/invalid-uuid"
}
```

### Image Not Found
```
Status: 404 Not Found
```

## Testing with Postman

1. **Create Product with Image**
   - Method: POST
   - URL: `http://localhost:8080/api/products`
   - Headers: Authorization Bearer {token}
   - Body: form-data with all fields + image file
   - Send and copy the `imageUrl` from response

2. **View Product**
   - Method: GET
   - URL: `http://localhost:8080/api/products/{publicId}`
   - See the imageUrl in response

3. **Download Image**
   - Method: GET
   - URL: `http://localhost:8080/api/products/images/{filename}`
   - Use filename from imageUrl

4. **Update Product with New Image**
   - Method: PUT
   - URL: `http://localhost:8080/api/products/{publicId}`
   - Body: form-data with new image
   - Old image auto-deleted, new one stored

## Best Practices

1. **Upload timing**: Images can be uploaded during creation or updated later
2. **Batch operations**: For multiple products, upload images serially to avoid disk I/O conflicts
3. **Caching**: Consider caching images on the client for better performance
4. **Error handling**: Always check for image upload errors in responses
5. **Cleanup**: Ensure products are properly deleted to clean up old images

## Configuration

To change upload directory or limits, modify `application.yml`:

```yaml
app:
  products-images-dir: ./uploads/products
  
spring:
  servlet:
    multipart:
      max-file-size: 10MB          # Max file size
      max-request-size: 10MB       # Max request size
```

Then restart the application for changes to take effect.
