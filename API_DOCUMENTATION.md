# Anocab Admin API Documentation

## Base URL

- **API Base URL**: `http://62.72.12.249:1200/api`
- **File Uploads**: `http://62.72.12.249:1200/writable/uploads/`

All API endpoints return JSON responses. Most endpoints support standard CRUD operations where applicable.

---

## Table of Contents

1. [Health Check](#health-check)
2. [Admins](#admins)
3. [Users](#users)
4. [Blogs](#blogs)
5. [Catalog](#catalog)
6. [QR Codes](#qr-codes)
7. [QR Scans](#qr-scans)
8. [Redeem Transactions](#redeem-transactions)
9. [Payment Transactions](#payment-transactions)
10. [Calculator Data](#calculator-data)
11. [Dashboard](#dashboard)
12. [Upload](#upload)

---

## Health Check

### GET `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "API is running"
}
```

---

## Admins

### GET `/api/admins`

Get all admins.

**Response:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "status": 1,
    "last_login": "2024-01-01T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/admins/:id`

Get admin by ID.

**Parameters:**
- `id` (path parameter): Admin ID

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin",
  "status": 1,
  "last_login": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Admin not found"
}
```

### POST `/api/admins`

Create a new admin.

**Request Body:**
```json
{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "admin",
  "status": 1
}
```

**Response (201):**
```json
{
  "id": 2,
  "message": "Admin created successfully"
}
```

### PUT `/api/admins/:id`

Update an admin.

**Parameters:**
- `id` (path parameter): Admin ID

**Request Body:**
```json
{
  "username": "updatedadmin",
  "email": "updated@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "admin",
  "status": 1
}
```

**Response:**
```json
{
  "message": "Admin updated successfully"
}
```

### DELETE `/api/admins/:id`

Delete an admin.

**Parameters:**
- `id` (path parameter): Admin ID

**Response:**
```json
{
  "message": "Admin deleted successfully"
}
```

### POST `/api/admins/login`

Admin login.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "status": 1
  },
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**Error Response (400):**
```json
{
  "error": "Username and password are required"
}
```

---

## Users

### GET `/api/users`

Get all users with optional filters.

**Query Parameters:**
- `user_type` (optional): Filter by user type
- `status` (optional): Filter by status (0 = active, 1 = inactive)
- `city` (optional): Filter by city
- `search` (optional): Search in first_name, last_name, m_number, or email

**Example:**
```
GET /api/users?user_type=dealer&status=0&city=Mumbai&search=john
```

**Response:**
```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "m_number": "1234567890",
    "email": "john@example.com",
    "user_type": "dealer",
    "city": "Mumbai",
    "status": 0,
    "points": 100,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/users/:id`

Get user by ID.

**Parameters:**
- `id` (path parameter): User ID

**Response:**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "m_number": "1234567890",
  "email": "john@example.com",
  "user_type": "dealer",
  "city": "Mumbai",
  "status": 0,
  "points": 100,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "User not found"
}
```

### GET `/api/users/:id/redeemable`

Get user's redeemable amount.

**Parameters:**
- `id` (path parameter): User ID

**Response:**
```json
{
  "id": 1,
  "redeemable_amount": 500
}
```

### POST `/api/users`

Create a new user.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "m_number": "1234567890",
  "email": "john@example.com",
  "user_type": "dealer",
  "city": "Mumbai",
  "status": 0,
  "points": 0
}
```

**Response (201):**
```json
{
  "id": 2,
  "message": "User created successfully"
}
```

### PUT `/api/users/:id`

Update a user.

**Parameters:**
- `id` (path parameter): User ID

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Updated",
  "status": 0,
  "points": 150
}
```

**Response:**
```json
{
  "message": "User updated successfully"
}
```

### DELETE `/api/users/:id`

Delete a user.

**Parameters:**
- `id` (path parameter): User ID

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### GET `/api/users/dealers/by-city`

Get dealers filtered by city.

**Query Parameters:**
- `city` (optional): Filter by city name

**Example:**
```
GET /api/users/dealers/by-city?city=Mumbai
```

**Response:**
```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "city": "Mumbai",
    "user_type": "dealer"
  }
]
```

### GET `/api/users/electricians/by-city`

Get electricians filtered by city.

**Query Parameters:**
- `city` (optional): Filter by city name

**Example:**
```
GET /api/users/electricians/by-city?city=Delhi
```

**Response:**
```json
[
  {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "city": "Delhi",
    "user_type": "electrician"
  }
]
```

---

## Blogs

### GET `/api/blogs`

Get all blogs with optional filters.

**Query Parameters:**
- `type` (optional): Filter by blog type
- `status` (optional): Filter by status (0 = draft, 1 = published)
- `search` (optional): Search in title or description

**Example:**
```
GET /api/blogs?status=1&search=technology
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Blog Title",
    "description": "Blog description",
    "img": "http://62.72.12.249:1200/writable/uploads/image.jpg",
    "type": 1,
    "status": 1,
    "created_by": 1,
    "created_by_name": "admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/blogs/:id`

Get blog by ID.

**Parameters:**
- `id` (path parameter): Blog ID

**Response:**
```json
{
  "id": 1,
  "title": "Blog Title",
  "description": "Blog description",
  "img": "http://localhost:5000/writable/uploads/image.jpg",
  "type": 1,
  "status": 1,
  "created_by": 1,
  "created_by_name": "admin",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Blog not found"
}
```

### POST `/api/blogs`

Create a new blog.

**Request Body:**
```json
{
  "title": "New Blog Title",
  "description": "Blog description",
  "img": "http://localhost:5000/writable/uploads/image.jpg",
  "type": 1,
  "status": 1,
  "created_by": 1
}
```

**Response (201):**
```json
{
  "id": 2,
  "message": "Blog created successfully"
}
```

### PUT `/api/blogs/:id`

Update a blog.

**Parameters:**
- `id` (path parameter): Blog ID

**Request Body:**
```json
{
  "title": "Updated Blog Title",
  "description": "Updated description",
  "img": "http://localhost:5000/writable/uploads/image.jpg",
  "type": 1,
  "status": 1
}
```

**Response:**
```json
{
  "message": "Blog updated successfully"
}
```

### DELETE `/api/blogs/:id`

Delete a blog.

**Parameters:**
- `id` (path parameter): Blog ID

**Response:**
```json
{
  "message": "Blog deleted successfully"
}
```

---

## Catalog

### GET `/api/catalog`

Get all catalog items with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (0 = inactive, 1 = active)
- `search` (optional): Search in title

**Example:**
```
GET /api/catalog?status=1&search=product
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Product Catalog",
    "link": "http://example.com/catalog.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "status": 1,
    "created_by": 1,
    "created_by_name": "admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/catalog/:id`

Get catalog item by ID.

**Parameters:**
- `id` (path parameter): Catalog ID

**Response:**
```json
{
  "id": 1,
  "title": "Product Catalog",
  "link": "http://example.com/catalog.pdf",
  "file_type": "pdf",
  "file_size": 1024000,
  "status": 1,
  "created_by": 1,
  "created_by_name": "admin",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Catalog not found"
}
```

### POST `/api/catalog`

Create a new catalog item.

**Request Body:**
```json
{
  "title": "New Catalog",
  "link": "http://example.com/catalog.pdf",
  "file_type": "pdf",
  "file_size": 1024000,
  "status": 1,
  "created_by": 1
}
```

**Response (201):**
```json
{
  "id": 2,
  "message": "Catalog created successfully"
}
```

### PUT `/api/catalog/:id`

Update a catalog item.

**Parameters:**
- `id` (path parameter): Catalog ID

**Request Body:**
```json
{
  "title": "Updated Catalog",
  "link": "http://example.com/updated-catalog.pdf",
  "file_type": "pdf",
  "file_size": 2048000,
  "status": 1
}
```

**Response:**
```json
{
  "message": "Catalog updated successfully"
}
```

### DELETE `/api/catalog/:id`

Delete a catalog item.

**Parameters:**
- `id` (path parameter): Catalog ID

**Response:**
```json
{
  "message": "Catalog deleted successfully"
}
```

---

## QR Codes

### GET `/api/qr-codes`

Get all QR codes with optional filters.

**Query Parameters:**
- `is_scanned` (optional): Filter by scan status (0 = not scanned, 1 = scanned)
- `search` (optional): Search in code, product, or details

**Example:**
```
GET /api/qr-codes?is_scanned=0&search=product
```

**Response:**
```json
[
  {
    "id": 1,
    "code": "QR-1234567890-ABC123",
    "product": "Product Name",
    "details": "Product details",
    "points": 100,
    "is_scanned": 0,
    "scanned_by": null,
    "scanned_by_number": null,
    "expires_at": "2024-12-31T23:59:59.000Z",
    "created_by": 1,
    "created_by_name": "admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/qr-codes/:id`

Get QR code by ID.

**Parameters:**
- `id` (path parameter): QR Code ID

**Response:**
```json
{
  "id": 1,
  "code": "QR-1234567890-ABC123",
  "product": "Product Name",
  "details": "Product details",
  "points": 100,
  "is_scanned": 0,
  "scanned_by": null,
  "scanned_by_number": null,
  "expires_at": "2024-12-31T23:59:59.000Z",
  "created_by": 1,
  "created_by_name": "admin",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "QR code not found"
}
```

### POST `/api/qr-codes`

Create QR code(s). Supports bulk creation.

**Request Body:**
```json
{
  "product": "Product Name",
  "details": "Product details",
  "points": 100,
  "expires_at": "2024-12-31T23:59:59.000Z",
  "created_by": 1,
  "quantity": 1
}
```

**Note:** `quantity` parameter (1-1000) allows bulk creation of QR codes.

**Response (201):**
```json
{
  "count": 1,
  "codes": [
    {
      "id": 1,
      "code": "QR-1234567890-ABC123"
    }
  ],
  "message": "1 QR code(s) created successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Quantity must be between 1 and 1000"
}
```

### PUT `/api/qr-codes/:id`

Update a QR code.

**Parameters:**
- `id` (path parameter): QR Code ID

**Request Body:**
```json
{
  "product": "Updated Product Name",
  "details": "Updated details",
  "points": 150,
  "expires_at": "2024-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "message": "QR code updated successfully"
}
```

### DELETE `/api/qr-codes/:id`

Delete a QR code.

**Parameters:**
- `id` (path parameter): QR Code ID

**Response:**
```json
{
  "message": "QR code deleted successfully"
}
```

---

## QR Scans

### GET `/api/qr-scans`

Get all QR scan history with optional filters.

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `qr_code_id` (optional): Filter by QR code ID

**Example:**
```
GET /api/qr-scans?user_id=1&qr_code_id=5
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "qr_code_id": 5,
    "scanned_at": "2024-01-01T00:00:00.000Z",
    "points_earned": 100
  }
]
```

### GET `/api/qr-scans/:id`

Get QR scan by ID.

**Parameters:**
- `id` (path parameter): QR Scan ID

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "qr_code_id": 5,
  "scanned_at": "2024-01-01T00:00:00.000Z",
  "points_earned": 100
}
```

**Error Response (404):**
```json
{
  "error": "QR scan not found"
}
```

---

## Redeem Transactions

### GET `/api/redeem-transactions`

Get all redeem transactions with optional filters.

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `status` (optional): Filter by status (e.g., "pending", "completed", "cancelled")
- `order_id` (optional): Filter by order ID

**Example:**
```
GET /api/redeem-transactions?status=pending&user_id=1
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "m_number": "1234567890",
    "first_name": "John",
    "last_name": "Doe",
    "order_id": "ORD123",
    "amount": 500,
    "status": "pending",
    "payment_status": "pending",
    "remarks": null,
    "processed_by": null,
    "processed_by_name": null,
    "processed_at": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/redeem-transactions/:id`

Get redeem transaction by ID.

**Parameters:**
- `id` (path parameter): Redeem Transaction ID

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "m_number": "1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "order_id": "ORD123",
  "amount": 500,
  "status": "pending",
  "payment_status": "pending",
  "remarks": null,
  "processed_by": null,
  "processed_by_name": null,
  "processed_at": null,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Redeem transaction not found"
}
```

### PUT `/api/redeem-transactions/:id`

Update redeem transaction status.

**Parameters:**
- `id` (path parameter): Redeem Transaction ID

**Request Body:**
```json
{
  "status": "completed",
  "payment_status": "paid",
  "remarks": "Payment processed successfully",
  "processed_by": 1
}
```

**Response:**
```json
{
  "message": "Redeem transaction updated successfully"
}
```

### DELETE `/api/redeem-transactions/:id`

Delete a redeem transaction.

**Parameters:**
- `id` (path parameter): Redeem Transaction ID

**Response:**
```json
{
  "message": "Redeem transaction deleted successfully"
}
```

---

## Payment Transactions

### GET `/api/payment-transactions`

Get all payment transactions with optional filters.

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `status` (optional): Filter by status
- `order_id` (optional): Filter by order ID

**Example:**
```
GET /api/payment-transactions?status=success&user_id=1
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "m_number": "1234567890",
    "first_name": "John",
    "last_name": "Doe",
    "order_id": "PAY123",
    "amount": 1000,
    "status": "success",
    "gateway_response": "Transaction successful",
    "error_message": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/payment-transactions/:id`

Get payment transaction by ID.

**Parameters:**
- `id` (path parameter): Payment Transaction ID

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "m_number": "1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "order_id": "PAY123",
  "amount": 1000,
  "status": "success",
  "gateway_response": "Transaction successful",
  "error_message": null,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Payment transaction not found"
}
```

### PUT `/api/payment-transactions/:id`

Update a payment transaction.

**Parameters:**
- `id` (path parameter): Payment Transaction ID

**Request Body:**
```json
{
  "status": "failed",
  "gateway_response": "Payment gateway error",
  "error_message": "Insufficient funds"
}
```

**Response:**
```json
{
  "message": "Payment transaction updated successfully"
}
```

---

## Calculator Data

### GET `/api/calculator-data`

Get all calculator data with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status (0 = inactive, 1 = active)
- `search` (optional): Search in name or description

**Example:**
```
GET /api/calculator-data?category=wires&status=1
```

**Response:**
```json
[
  {
    "id": 1,
    "category": "wires",
    "name": "Copper Wire",
    "value": 500,
    "unit": "kg",
    "description": "Copper wire description",
    "status": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/calculator-data/:id`

Get calculator data by ID.

**Parameters:**
- `id` (path parameter): Calculator Data ID

**Response:**
```json
{
  "id": 1,
  "category": "wires",
  "name": "Copper Wire",
  "value": 500,
  "unit": "kg",
  "description": "Copper wire description",
  "status": 1,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Calculator data not found"
}
```

### POST `/api/calculator-data`

Create new calculator data.

**Request Body:**
```json
{
  "category": "wires",
  "name": "Aluminum Wire",
  "value": 300,
  "unit": "kg",
  "description": "Aluminum wire description",
  "status": 1
}
```

**Response (201):**
```json
{
  "id": 2,
  "message": "Calculator data created successfully"
}
```

### PUT `/api/calculator-data/:id`

Update calculator data.

**Parameters:**
- `id` (path parameter): Calculator Data ID

**Request Body:**
```json
{
  "category": "wires",
  "name": "Updated Wire",
  "value": 600,
  "unit": "kg",
  "description": "Updated description",
  "status": 1
}
```

**Response:**
```json
{
  "message": "Calculator data updated successfully"
}
```

### DELETE `/api/calculator-data/:id`

Delete calculator data.

**Parameters:**
- `id` (path parameter): Calculator Data ID

**Response:**
```json
{
  "message": "Calculator data deleted successfully"
}
```

---

## Dashboard

### GET `/api/dashboard/stats`

Get dashboard statistics.

**Response:**
```json
{
  "totalUsers": 100,
  "activeUsers": 85,
  "totalAdmins": 5,
  "totalBlogs": 50,
  "publishedBlogs": 45,
  "totalQRCodes": 1000,
  "scannedQRCodes": 750,
  "totalRedeems": 200,
  "pendingRedeems": 25,
  "totalPayments": 150,
  "totalPoints": 50000,
  "totalRedeemed": 10000,
  "totalCatalogs": 20
}
```

### GET `/api/dashboard/recent`

Get recent activities (users, blogs, and redeem transactions).

**Response:**
```json
[
  {
    "type": "user",
    "id": 1,
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "type": "blog",
    "id": 5,
    "name": "New Blog Post",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "type": "redeem",
    "id": 10,
    "name": "ORD123",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## Upload

### POST `/api/upload/image`

Upload an image file.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with field name `image`
- File size limit: 10MB
- Allowed file types: jpeg, jpg, png, gif, webp

**Response:**
```json
{
  "url": "http://62.72.12.249:1200/writable/uploads/img-1234567890-123456789.jpg",
  "filename": "img-1234567890-123456789.jpg",
  "message": "File uploaded successfully"
}
```

**Error Response (400):**
```json
{
  "error": "No file uploaded"
}
```

**Error Response (400):**
```json
{
  "error": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```

**Note:** Uploaded files are accessible via:
```
http://62.72.12.249:1200/writable/uploads/{filename}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database error message or server error"
}
```

---

## Frontend API Service Methods

The frontend uses the following API service methods (from `src/services/api.js`):

### Admins API
- `adminsAPI.getAll()` - Get all admins
- `adminsAPI.getById(id)` - Get admin by ID
- `adminsAPI.create(data)` - Create admin
- `adminsAPI.update(id, data)` - Update admin
- `adminsAPI.delete(id)` - Delete admin
- `adminsAPI.login(credentials)` - Admin login

### Users API
- `usersAPI.getAll(params)` - Get all users with filters
- `usersAPI.getById(id)` - Get user by ID
- `usersAPI.getRedeemable(id)` - Get user redeemable amount
- `usersAPI.create(data)` - Create user
- `usersAPI.update(id, data)` - Update user
- `usersAPI.delete(id)` - Delete user
- `usersAPI.getDealersByCity(city)` - Get dealers by city
- `usersAPI.getElectriciansByCity(city)` - Get electricians by city

### Blogs API
- `blogsAPI.getAll(params)` - Get all blogs with filters
- `blogsAPI.getById(id)` - Get blog by ID
- `blogsAPI.create(data)` - Create blog
- `blogsAPI.update(id, data)` - Update blog
- `blogsAPI.delete(id)` - Delete blog

### Catalog API
- `catalogAPI.getAll(params)` - Get all catalog items with filters
- `catalogAPI.getById(id)` - Get catalog item by ID
- `catalogAPI.create(data)` - Create catalog item
- `catalogAPI.update(id, data)` - Update catalog item
- `catalogAPI.delete(id)` - Delete catalog item

### QR Codes API
- `qrCodesAPI.getAll(params)` - Get all QR codes with filters
- `qrCodesAPI.getById(id)` - Get QR code by ID
- `qrCodesAPI.create(data)` - Create QR code(s)
- `qrCodesAPI.update(id, data)` - Update QR code
- `qrCodesAPI.delete(id)` - Delete QR code

### QR Scans API
- `qrScansAPI.getAll(params)` - Get all QR scans with filters
- `qrScansAPI.getById(id)` - Get QR scan by ID

### Redeem Transactions API
- `redeemTransactionsAPI.getAll(params)` - Get all redeem transactions with filters
- `redeemTransactionsAPI.getById(id)` - Get redeem transaction by ID
- `redeemTransactionsAPI.update(id, data)` - Update redeem transaction
- `redeemTransactionsAPI.delete(id)` - Delete redeem transaction

### Payment Transactions API
- `paymentTransactionsAPI.getAll(params)` - Get all payment transactions with filters
- `paymentTransactionsAPI.getById(id)` - Get payment transaction by ID
- `paymentTransactionsAPI.update(id, data)` - Update payment transaction

### Calculator Data API
- `calculatorDataAPI.getAll(params)` - Get all calculator data with filters
- `calculatorDataAPI.getById(id)` - Get calculator data by ID
- `calculatorDataAPI.create(data)` - Create calculator data
- `calculatorDataAPI.update(id, data)` - Update calculator data
- `calculatorDataAPI.delete(id)` - Delete calculator data

### Dashboard API
- `dashboardAPI.getStats()` - Get dashboard statistics
- `dashboardAPI.getRecent()` - Get recent activities

### Upload API
- `uploadAPI.uploadImage(formData)` - Upload an image file

---

## Notes

- All timestamps are in ISO 8601 format
- All endpoints return JSON responses
- Request timeout is set to 10 seconds
- In production, the frontend and API are served from the same server (no CORS issues)
- In development, CORS is enabled for `http://localhost:3000` and `http://127.0.0.1:3000`
- All routes are prefixed with `/api`
- File uploads are stored in `writable/uploads/` directory
- Uploaded files are served from `/writable/uploads/` endpoint

