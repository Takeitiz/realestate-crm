# REST API Reference — Real Estate CRM

> **Base URL:** `http://localhost:8080/api`  
> **Auth:** `Authorization: Bearer <JWT_TOKEN>` (trừ các endpoint public)  
> **Content-Type:** `application/json`

---

## Authentication

### POST /auth/login
Đăng nhập và nhận JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "fullName": "Admin User",
  "role": "MANAGER"
}
```

---

### POST /auth/register *(Manager only)*
Tạo tài khoản mới.

```json
{
  "username": "agent3",
  "password": "agent123",
  "fullName": "Nguyễn Văn C",
  "role": "AGENT"
}
```

---

### GET /auth/me
Lấy thông tin user hiện tại từ token.

---

### GET /config/public *(no auth)*
Lấy cấu hình công ty cho trang login.

```json
{
  "companyName": "BĐS CRM",
  "companyTagline": "Hệ thống quản lý BĐS nội bộ",
  "aiProvider": "ollama"
}
```

---

## Properties

### GET /properties
Lấy danh sách BĐS với phân trang và lọc.

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `page` | int | Trang (0-indexed, default: 0) |
| `size` | int | Số items/trang (default: 12) |
| `district` | string | Lọc theo quận |
| `propertyType` | enum | APARTMENT, HOUSE, LAND, VILLA, SHOPHOUSE, OFFICE |
| `transactionType` | enum | SALE, RENT |
| `status` | enum | AVAILABLE, RESERVED, SOLD, RENTED |
| `minBedrooms` | int | Số PN tối thiểu |
| `maxPrice` | number | Giá tối đa (theo đơn vị tỷ) |
| `sort` | string | VD: `createdAt,desc` |

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Căn hộ 2PN Cầu Giấy",
      "propertyType": "APARTMENT",
      "transactionType": "SALE",
      "status": "AVAILABLE",
      "district": "Cầu Giấy",
      "price": 2.5,
      "priceUnit": "tỷ",
      "areaSqm": 68,
      "bedrooms": 2,
      "bathrooms": 2,
      "freshnessStatus": "GREEN",
      "imageUrls": ["/api/properties/images/1"],
      "createdAt": "2024-01-15T08:00:00",
      "updatedAt": "2024-01-20T10:30:00"
    }
  ],
  "totalElements": 45,
  "totalPages": 4,
  "size": 12,
  "number": 0
}
```

---

### GET /properties/:id
Lấy chi tiết một BĐS.

**Response:** PropertyResponse đầy đủ (có masking nếu caller là AGENT).

---

### POST /properties
Tạo BĐS mới.

```json
{
  "title": "Căn hộ 2PN Cầu Giấy",
  "propertyType": "APARTMENT",
  "transactionType": "SALE",
  "status": "AVAILABLE",
  "province": "Hà Nội",
  "district": "Cầu Giấy",
  "ward": "Dịch Vọng",
  "street": "Trần Thái Tông",
  "houseNumber": "15B",
  "areaSqm": 68,
  "bedrooms": 2,
  "bathrooms": 2,
  "floors": 10,
  "direction": "EAST",
  "price": 2.5,
  "priceUnit": "tỷ",
  "description": "View đẹp, full nội thất",
  "sellerName": "Nguyễn Văn A",
  "sellerPhone": "0912345678",
  "sellerNotes": "Chủ cần bán gấp",
  "commissionRate": 1.5,
  "commissionNote": "Đã thỏa thuận",
  "commissionStatus": "PENDING",
  "lat": 21.028511,
  "lng": 105.854167
}
```

Enum values:
- `propertyType`: `APARTMENT | HOUSE | LAND | VILLA | SHOPHOUSE | OFFICE`
- `transactionType`: `SALE | RENT`
- `status`: `AVAILABLE | RESERVED | SOLD | RENTED`
- `direction`: `NORTH | SOUTH | EAST | WEST | NORTHEAST | NORTHWEST | SOUTHEAST | SOUTHWEST`
- `commissionStatus`: `PENDING | RECEIVED | WAIVED`

---

### PUT /properties/:id
Cập nhật BĐS (cùng body như POST).

---

### PATCH /properties/:id/status
Đổi trạng thái BĐS.

```json
{ "status": "RESERVED" }
```

---

### POST /properties/check-duplicate
Kiểm tra BĐS trùng.

```json
{
  "district": "Cầu Giấy",
  "areaSqm": 68,
  "price": 2.5
}
```

**Response:** Danh sách BĐS tương tự (có thể rỗng).

---

### POST /properties/:id/images
Upload ảnh (multipart/form-data).

| Field | Mô tả |
|---|---|
| `file` | File ảnh |
| `order` | Thứ tự hiển thị (int) |

---

### GET /properties/images/:imageId *(no auth)*
Lấy ảnh BĐS (binary).

---

### DELETE /properties/:id/images/:imageId
Xóa ảnh.

---

### GET /properties/:id/price-history
Lấy lịch sử thay đổi giá.

```json
[
  {
    "id": 1,
    "oldPrice": 3.0,
    "newPrice": 2.5,
    "priceUnit": "tỷ",
    "changedBy": "Nguyễn Văn Agent",
    "changedAt": "2024-01-20T10:30:00"
  }
]
```

---

### GET /properties/:id/documents
Lấy danh sách tài liệu.

---

### POST /properties/:id/documents
Upload tài liệu (multipart/form-data, field: `file`).

---

### GET /properties/:id/documents/:docId/download
Download tài liệu.

---

### DELETE /properties/:id/documents/:docId
Xóa tài liệu.

---

### POST /properties/:id/share
Tạo share link.

**Response:**
```json
{
  "shareToken": "abc123xyz",
  "shareUrl": "http://localhost:5173/public/p/abc123xyz",
  "expiresAt": "2024-01-27T10:00:00"
}
```

---

### GET /properties/:id/activity
Lấy activity log của BĐS.

---

### GET /properties/:id/comments
Lấy danh sách comment.

---

### POST /properties/:id/comments
Thêm comment.
```json
{ "content": "Chủ nhà đồng ý hạ giá" }
```

---

### DELETE /properties/:id/comments/:commentId
Xóa comment.

---

### POST /properties/import *(multipart/form-data)*
Upload Excel file để nhập hàng loạt.

| Field | Mô tả |
|---|---|
| `file` | File `.xlsx` |

**Response:**
```json
{
  "success": 10,
  "errors": [
    { "row": 5, "title": "Nhà Mỹ Đình", "error": "Invalid enum value: APARMENT" }
  ],
  "total": 11
}
```

---

### GET /properties/import/template *(no auth needed)*
Download Excel template file (`.xlsx`).

---

## Public (No Auth)

### GET /public/properties/:token
Xem BĐS qua share link (không cần đăng nhập).

---

## Buyer Requirements

### GET /buyer-requirements
Lấy danh sách nhu cầu khách.

### POST /buyer-requirements
Tạo nhu cầu mới.

```json
{
  "buyerName": "Trần Thị B",
  "buyerPhone": "0987654321",
  "district": "Cầu Giấy",
  "propertyType": "APARTMENT",
  "transactionType": "SALE",
  "minBedrooms": 2,
  "maxPrice": 3.0,
  "priceUnit": "tỷ",
  "notes": "Ưu tiên tầng cao, view thoáng",
  "expireDays": 30
}
```

### PUT /buyer-requirements/:id
Cập nhật nhu cầu.

### DELETE /buyer-requirements/:id
Xóa nhu cầu.

---

## Appointments

### GET /appointments
Danh sách lịch hẹn (agent: của mình; manager: tất cả).

### GET /appointments/property/:propertyId
Lịch hẹn theo BĐS.

### POST /appointments
Tạo lịch hẹn.

```json
{
  "propertyId": 1,
  "buyerName": "Khách VIP",
  "buyerPhone": "0912000000",
  "scheduledAt": "2024-02-01T10:00:00",
  "notes": "Xem buổi sáng"
}
```

### PATCH /appointments/:id/status
Cập nhật trạng thái.

```json
{ "status": "COMPLETED" }
```

Enum: `SCHEDULED | COMPLETED | CANCELLED | NO_SHOW`

### DELETE /appointments/:id
Xóa lịch hẹn.

---

## Deals

### GET /deals
Danh sách deals (agent: của mình; manager: tất cả). Sắp xếp theo `updatedAt desc`.

**Response:**
```json
[
  {
    "id": 1,
    "propertyId": 5,
    "propertyTitle": "Căn hộ 2PN Cầu Giấy",
    "propertyDistrict": "Cầu Giấy",
    "propertyPrice": 2.5,
    "propertyPriceUnit": "tỷ",
    "buyerId": 3,
    "buyerName": "Trần Thị B",
    "buyerPhone": "0987654321",
    "agentName": "Nguyễn Văn Agent",
    "stage": "NEGOTIATING",
    "expectedPrice": 2.3,
    "priceUnit": "tỷ",
    "notes": "Khách muốn check giấy tờ trước",
    "createdAt": "2024-01-20T08:00:00",
    "updatedAt": "2024-01-22T15:30:00"
  }
]
```

### POST /deals
Tạo deal mới.

```json
{
  "propertyId": 5,
  "buyerId": 3,
  "expectedPrice": 2.3,
  "priceUnit": "tỷ",
  "notes": "Khách quan tâm"
}
```

### PATCH /deals/:id/stage
Chuyển giai đoạn.

```json
{ "stage": "DEPOSIT" }
```

Enum: `NEW | VIEWED | NEGOTIATING | DEPOSIT | CLOSED | CANCELLED`

### PATCH /deals/:id
Cập nhật ghi chú/giá.

```json
{
  "notes": "Đã xác nhận giá",
  "expectedPrice": 2.2,
  "priceUnit": "tỷ"
}
```

### DELETE /deals/:id
Xóa deal. Agent chỉ xóa deal của mình.

---

## Dashboard

### GET /dashboard/stats
Lấy tổng hợp analytics.

**Response:**
```json
{
  "total": 45,
  "available": 30,
  "reserved": 8,
  "sold": 7,
  "stale": 3,
  "dealsByStage": {
    "NEW": 5,
    "VIEWED": 3,
    "NEGOTIATING": 2,
    "CLOSED": 8
  },
  "leaderboard": [
    { "agentName": "Agent A", "totalDeals": 10, "closedDeals": 5 }
  ],
  "dailyActivity": {
    "2024-01-14": 3,
    "2024-01-15": 7,
    "2024-01-16": 2
  },
  "upcomingAppointments": 4
}
```

### GET /dashboard/map-data
Danh sách BĐS có tọa độ.

```json
[
  {
    "id": 1,
    "title": "Căn hộ 2PN",
    "status": "AVAILABLE",
    "price": 2.5,
    "priceUnit": "tỷ",
    "district": "Cầu Giấy",
    "lat": 21.028511,
    "lng": 105.854167
  }
]
```

---

## Reports *(Manager only)*

### GET /reports/agents?days=30
Báo cáo hiệu suất agent.

```json
[
  {
    "agentId": 2,
    "agentName": "Nguyễn Văn Agent",
    "username": "agent1",
    "totalProperties": 20,
    "propertiesInPeriod": 5,
    "totalAppointments": 12,
    "completedAppointments": 8,
    "appointmentsInPeriod": 4,
    "totalDeals": 6,
    "closedDeals": 3,
    "dealsInPeriod": 2,
    "closeRate": "50%",
    "activityCount": 45
  }
]
```

### GET /reports/properties
Báo cáo sức khoẻ BĐS.

```json
{
  "staleProperties": [
    {
      "id": 3,
      "title": "Nhà Mỹ Đình",
      "district": "Nam Từ Liêm",
      "status": "AVAILABLE",
      "agentName": "Agent B",
      "daysSinceUpdate": 45,
      "updatedAt": "2023-12-08T09:00:00"
    }
  ],
  "staleCount": 1,
  "priceChanges": [...]
}
```

### GET /reports/agents/export?days=30
Download CSV báo cáo (UTF-8 BOM). *(Phải dùng authenticated fetch/axios, không dùng `<a href>` trực tiếp)*

---

## AI

### POST /ai/parse-listing
Phân tích text tin đăng thô.

```json
{ "text": "Bán căn hộ 2PN Cầu Giấy, 68m2, 2.5 tỷ, view đẹp LH 0912345678" }
```

**Response:** PropertyRequest đã được điền (các field có thể null nếu không trích xuất được).

---

### POST /ai/search
Tìm kiếm thông minh bằng ngôn ngữ tự nhiên.

```json
{ "query": "Tìm căn hộ 2 phòng ngủ Cầu Giấy dưới 3 tỷ" }
```

**Response:** Danh sách PropertyResponse.

---

### POST /ai/generate-pitch
Tạo tin nhắn Zalo giới thiệu BĐS.

```json
{
  "propertyId": 1,
  "tone": "professional"
}
```

**Response:**
```json
{ "pitch": "🏠 Chào anh/chị! Em có một căn hộ..." }
```

---

## Notifications

### GET /notifications
Danh sách notifications.

### GET /notifications/count-unread
Số notifications chưa đọc.

### PATCH /notifications/:id/read
Đánh dấu đã đọc.

### PATCH /notifications/read-all
Đánh dấu tất cả đã đọc.

---

## Favorites

### GET /favorites
Danh sách BĐS đã bookmark.

### POST /favorites/:propertyId/toggle
Toggle favorite (bookmark/unbookmark).

---

## Error Responses

| HTTP Code | Ý nghĩa |
|---|---|
| 400 | Bad Request — dữ liệu không hợp lệ |
| 401 | Unauthorized — thiếu hoặc sai token |
| 403 | Forbidden — không đủ quyền |
| 404 | Not Found — không tìm thấy resource |
| 500 | Internal Server Error |

```json
{
  "timestamp": "2024-01-20T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Chỉ manager mới được xem báo cáo này",
  "path": "/api/reports/agents"
}
```
