# System Design — Real Estate CRM

> **Phiên bản:** 1.0 · **Cập nhật:** 2026-04 · **Tác giả:** Engineering Team

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                            │
│                                                                 │
│   Browser  ──►  React 19 + Vite (SPA)                          │
│                  ├── React Router 7 (client routing)            │
│                  ├── Axios (HTTP, JWT interceptor)              │
│                  ├── Leaflet (map, CDN)                         │
│                  └── react-hot-toast (notifications)            │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP/REST  (JWT Bearer)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER TIER                             │
│                                                                 │
│   Spring Boot 3.4.5 (Java 21)                                  │
│    ├── SecurityConfig  ──  JWT Filter  ──  CORS                 │
│    ├── Controllers  (REST, @RequestMapping /api/**)             │
│    ├── Services  (business logic, transactions)                 │
│    ├── Repositories  (Spring Data JPA)                          │
│    └── AiService  ──►  Ollama HTTP Client (WebFlux)            │
└──────────────────────────┬──────────────────────────────────────┘
                           │  JPA / JDBC
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA TIER                               │
│                                                                 │
│   H2 Database (file-based: ./data/realestate_db)               │
│   ./uploads/   (binary documents)                               │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AI TIER (optional)                      │
│                                                                 │
│   Ollama (localhost:11434)  ──  model: qwen2                   │
│    ├── POST /api/generate  (listing parse)                      │
│    └── POST /api/generate  (semantic search, pitch gen)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Luồng xác thực (Authentication Flow)

```
Client                    Backend                     DB
  │                          │                         │
  │  POST /api/auth/login     │                         │
  │ ─────────────────────►   │                         │
  │                          │  findByUsername()        │
  │                          │ ───────────────────────► │
  │                          │ ◄─────────────────────── │
  │                          │  BCrypt.verify()         │
  │                          │  JwtUtil.generate()      │
  │  { token, user }         │                         │
  │ ◄─────────────────────   │                         │
  │                          │                         │
  │  GET /api/properties      │                         │
  │  Authorization: Bearer…  │                         │
  │ ─────────────────────►   │                         │
  │                          │  JwtAuthFilter           │
  │                          │  validates token         │
  │                          │  sets SecurityContext    │
  │  200 OK (filtered data)  │                         │
  │ ◄─────────────────────   │                         │
```

Token JWT được lưu trong `localStorage`, tự động đính kèm qua Axios interceptor. Token hết hạn sau **24 giờ** (cấu hình `app.jwt.expiration-ms`). Khi nhận 401, interceptor xóa token và redirect về `/login`.

---

## 3. Database Schema (ERD)

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│    users     │     │    properties      │     │ buyer_reqs   │
├──────────────┤     ├───────────────────┤     ├──────────────┤
│ id (PK)      │◄──┐ │ id (PK)           │     │ id (PK)      │
│ username     │   │ │ title             │     │ buyer_name   │
│ password     │   │ │ property_type     │     │ buyer_phone  │
│ full_name    │   │ │ transaction_type  │     │ district     │
│ role         │   │ │ status            │     │ property_type│
│ created_at   │   │ │ province          │     │ transaction_t│
└──────────────┘   │ │ district          │     │ min_bedrooms │
        ▲          │ │ ward / street     │     │ max_price    │
        │          │ │ area_sqm          │     │ price_unit   │
        │          │ │ bedrooms          │     │ notes        │
        │          │ │ bathrooms         │     │ agent_id(FK) │
        │          │ │ floors            │     │ is_active    │
        │          │ │ direction         │     │ expire_days  │
        │          │ │ price             │     │ created_at   │
        │          └─┤ price_unit        │     └──────────────┘
        │            │ description       │
        │            │ seller_name       │
        │            │ seller_phone      │
        │            │ seller_notes      │
        │            │ commission_rate   │
        │            │ commission_note   │
        │            │ commission_status │
        │            │ share_token       │
        │            │ share_expires_at  │
        │            │ lat / lng         │
        │            │ created_by_id(FK)─┼──► users
        │            │ created_at        │
        │            │ updated_at        │
        │            └───────────────────┘
        │                     │ 1
        │                     │ *
        │            ┌──────────────────┐
        │            │  property_images  │
        │            ├──────────────────┤
        │            │ id               │
        │            │ property_id(FK)  │
        │            │ image_data(BLOB) │
        │            │ display_order    │
        │            └──────────────────┘
        │
        │       ┌──────────────────────────────────────────────┐
        │       │              appointments                      │
        │       ├──────────────────────────────────────────────┤
        └───────┤ agent_id (FK)                                 │
                │ property_id (FK) ──► properties               │
                │ buyer_name / buyer_phone                       │
                │ scheduled_at                                   │
                │ status (SCHEDULED|COMPLETED|CANCELLED|NO_SHOW)│
                │ notes                                          │
                │ created_at                                     │
                └──────────────────────────────────────────────┘

        ┌──────────────────────────┐
        │         deals             │
        ├──────────────────────────┤
        │ id                        │
        │ buyer_id(FK) ──► buyer_reqs│
        │ property_id(FK) ──► props │
        │ agent_id(FK) ──► users    │
        │ stage (enum 6 values)     │
        │ expected_price            │
        │ price_unit                │
        │ notes                     │
        │ created_at / updated_at   │
        └──────────────────────────┘

        ┌──────────────────┐   ┌──────────────────┐
        │  price_history    │   │property_documents │
        ├──────────────────┤   ├──────────────────┤
        │ property_id (FK) │   │ property_id (FK) │
        │ old_price        │   │ file_name        │
        │ new_price        │   │ original_name    │
        │ price_unit       │   │ content_type     │
        │ changed_by (FK)  │   │ file_size        │
        │ changed_at       │   │ stored_path      │
        └──────────────────┘   │ uploaded_by (FK) │
                               │ uploaded_at      │
                               └──────────────────┘

        ┌──────────────────┐   ┌──────────────────┐
        │  activity_logs    │   │  notifications    │
        ├──────────────────┤   ├──────────────────┤
        │ property_id (FK) │   │ user_id (FK)     │
        │ user_id (FK)     │   │ property_id (FK) │
        │ action (enum)    │   │ requirement (FK) │
        │ detail           │   │ message          │
        │ created_at       │   │ is_read          │
        └──────────────────┘   │ created_at       │
                               └──────────────────┘

        ┌──────────────────┐   ┌──────────────────┐
        │    favorites      │   │    comments       │
        ├──────────────────┤   ├──────────────────┤
        │ user_id (FK)     │   │ property_id (FK) │
        │ property_id (FK) │   │ user_id (FK)     │
        │ created_at       │   │ content          │
        └──────────────────┘   │ created_at       │
                               └──────────────────┘
```

---

## 4. Phân quyền (RBAC)

| Hành động | AGENT | MANAGER |
|---|:---:|:---:|
| Xem danh sách BĐS | ✅ | ✅ |
| Tạo / chỉnh sửa BĐS | ✅ | ✅ |
| Xem thông tin nhạy cảm (số nhà, SĐT đầy đủ, ghi chú) | ❌ masked | ✅ |
| Xem / chỉnh hoa hồng | ❌ | ✅ |
| Xem deals của tất cả MG | ❌ | ✅ |
| Xem báo cáo hiệu suất | ❌ | ✅ |
| Xuất CSV báo cáo | ❌ | ✅ |
| Xóa deal của MG khác | ❌ | ✅ |
| Đăng ký tài khoản mới | ❌ | ✅ |

**Data masking cho AGENT:**
- `sellerPhone` → `090***678`
- `houseNumber` → `null`
- `sellerNotes` → `null`
- `commissionRate/Note/Status` → `null`

---

## 5. Luồng AI

```
User input (raw WhatsApp/Zalo text)
        │
        ▼
POST /api/ai/parse-listing
        │
        ▼
AiService.parseListing()
  ├── Build prompt với field list
  ├── POST http://localhost:11434/api/generate
  │    model: qwen2
  │    prompt: "Trích xuất thông tin BĐS từ đoạn text sau..."
  │
  ▼
Ollama response (raw text)
        │
        ▼
JSON extraction (regex, fallback to raw)
        │
        ▼
PropertyRequest (pre-filled form)
        │
        ▼
User review & submit
        │
        ▼
POST /api/properties (save to DB)
```

**Fallback:** Khi `app.ai.provider=mock`, `AiService` trả về dữ liệu mẫu tĩnh mà không cần Ollama.

---

## 6. Luồng Reverse Matching (Tự động ghép BĐS-Khách)

```
POST /api/properties (create new property)
        │
        ▼
PropertyService.create()
        │
        ├── Save property to DB
        │
        └── triggerReverseMatching(property)
               │
               ▼
        BuyerRequirementRepository
        .findMatchingRequirements(district, transactionType,
          propertyType, price, bedrooms, area)
               │
               ▼
        For each matching BuyerRequirement:
          └── Create Notification for requirement.agent
               message: "🏠 BĐS mới phù hợp với khách..."
               │
               ▼
        NotificationRepository.save()
               │
               ▼
        Agent thấy notification badge trong sidebar
```

---

## 7. Layered Architecture

```
┌─────────────────────────────────────┐
│           Controllers               │  HTTP ↔ DTOs
│  (AuthController, PropertyController│
│   DealController, DashboardController│
│   AppointmentController, etc.)      │
├─────────────────────────────────────┤
│            Services                 │  Business logic, @Transactional
│  (PropertyService, AuthService,     │
│   BuyerRequirementService,          │
│   NotificationService, AiService)   │
├─────────────────────────────────────┤
│          Repositories               │  Spring Data JPA
│  (PropertyRepository, UserRepo,     │
│   DealRepository, etc.)             │
├─────────────────────────────────────┤
│            Entities                 │  JPA @Entity
│  (Property, User, Deal,             │
│   Appointment, BuyerRequirement,    │
│   PriceHistory, Notification, etc.) │
└─────────────────────────────────────┘
```

---

## 8. Cấu trúc file Frontend

```
src/
├── api/              # Axios calls (grouped by sprint/module)
│   ├── axios.js      # Axios instance + JWT interceptor
│   ├── auth.js       # Login, register, me, config
│   ├── properties.js # CRUD, images, status
│   ├── crm.js        # Buyer requirements, notifications
│   ├── social.js     # Activity, favorites, comments, share
│   ├── ai.js         # Parse, search, pitch
│   ├── sprint2.js    # Appointments, price history, documents
│   ├── sprint3.js    # Deals, dashboard stats, map data
│   └── sprint4.js    # Bulk import, reports, CSV export
│
├── components/
│   ├── AppShell.jsx       # Layout: sidebar + topbar
│   ├── PropertyCard.jsx   # Grid card with freshness badge
│   └── PropertyMapView.jsx # Leaflet map component
│
├── context/
│   └── AuthContext.jsx   # user, login(), logout(), isManager()
│
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx       # Analytics & KPIs
│   ├── PropertyListPage.jsx    # List + map view toggle
│   ├── PropertyDetailPage.jsx  # 6-tab detail view
│   ├── PropertyFormPage.jsx    # Create / edit form
│   ├── BuyerRequirementsPage.jsx
│   ├── AppointmentsPage.jsx
│   ├── DealsPage.jsx           # Kanban pipeline
│   ├── ReportsPage.jsx         # Agent perf + property health
│   ├── BulkImportPage.jsx      # Excel import wizard
│   ├── ChatSearchPage.jsx      # AI semantic search
│   ├── PitchGeneratorPage.jsx  # Zalo message generator
│   └── PublicPropertyPage.jsx  # Public share link (no auth)
│
└── utils/
    └── format.js   # DISTRICTS_HANOI, PROPERTY_TYPES, formatPrice...
```

---

## 9. Môi trường & Biến cấu hình

| Property | Default | Mô tả |
|---|---|---|
| `app.company-name` | `BĐS CRM` | Tên hiển thị trên UI |
| `app.company-tagline` | *(vi)* | Tagline dưới tên |
| `app.jwt.secret` | *(long string)* | **Đổi trong production** |
| `app.jwt.expiration-ms` | `86400000` | 24h |
| `app.ai.provider` | `ollama` | `ollama` hoặc `mock` |
| `app.ai.ollama.base-url` | `http://localhost:11434` | URL Ollama |
| `app.ai.ollama.model` | `qwen2` | Tên model |
| `app.ai.ollama.timeout-seconds` | `60` | Timeout AI request |
| `app.cors.allowed-origins` | `http://localhost:5173` | CORS whitelist |
| `app.upload.dir` | `./uploads` | Thư mục lưu file |
| `app.share.expire-days` | `7` | Thời hạn share link |
| `spring.h2.console.enabled` | `true` | Tắt trong production |
