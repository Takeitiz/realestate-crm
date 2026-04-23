# 🏠 Real Estate CRM

Hệ thống CRM nội bộ dành cho đội ngũ môi giới bất động sản — được xây dựng với Spring Boot 3 (backend) và React 19 (frontend), tích hợp AI (Ollama/Qwen2) để phân tích tin đăng, tìm kiếm thông minh và tạo nội dung Zalo.

> 📚 **Tài liệu đầy đủ**: xem thư mục [`docs/`](./docs/)

---

## ✨ Tính năng chính

| Sprint | Tính năng |
|---|---|
| **MVP** | Quản lý BĐS, Khách hàng, RBAC, AI parse tin, Tìm kiếm AI, Tạo tin Zalo |
| **Sprint 2** | Lịch hẹn, Lịch sử giá, Upload tài liệu, Hoa hồng |
| **Sprint 3** | Deal Pipeline (Kanban), Bản đồ Leaflet, Analytics Dashboard |
| **Sprint 4** | Nhập Excel hàng loạt, Báo cáo hiệu suất MG, Xuất CSV |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Backend | Java 21, Spring Boot 3.4.5, Spring Security, JPA/Hibernate |
| Database | H2 (file-based, dev) |
| Auth | JWT (jjwt 0.12) |
| AI | Ollama + Qwen2 (local LLM) |
| Frontend | React 19, Vite 8, React Router 7, Axios |
| Map | Leaflet (CDN) |
| Excel | Apache POI 5.3 |

---

## ⚡ Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu |
|---|---|
| Java JDK | **21** |
| Maven | **3.9+** |
| Node.js | **18+** |
| npm | **9+** |
| Ollama *(tùy chọn)* | Latest |

---

## 🚀 Cài đặt & Chạy

### 1. Clone project

```bash
git clone https://github.com/Takeitiz/realestate-crm.git
cd realestate-crm
```

### 2. Cấu hình Backend

Mở `backend/src/main/resources/application.properties` và chỉnh:

```properties
# Tên công ty hiển thị trên UI
app.company-name=BĐS CRM

# JWT secret — BẮT BUỘC đổi trong production
app.jwt.secret=your-super-secret-key-at-least-32-chars

# AI Provider: "ollama" (nếu có Ollama) hoặc "mock" (không cần AI)
app.ai.provider=ollama
app.ai.ollama.base-url=http://localhost:11434
app.ai.ollama.model=qwen2

# CORS — thêm domain frontend của bạn nếu deploy
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

### 3. Chạy Backend

```bash
cd backend
mvn spring-boot:run
```

Backend sẽ khởi động tại: **http://localhost:8080**

- H2 Console: http://localhost:8080/h2-console  
  _(JDBC URL: `jdbc:h2:file:./data/realestate_db`, User: `sa`, Pass: *(để trống)*)_
- Dữ liệu được lưu tại `backend/data/realestate_db.mv.db`
- File upload lưu tại `backend/uploads/`

### 4. Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ khởi động tại: **http://localhost:5173**

---

## 🤖 Cài đặt AI (Ollama) — Tùy chọn

Nếu bỏ qua bước này, đặt `app.ai.provider=mock` trong `application.properties` — tính năng AI sẽ trả về dữ liệu mẫu.

```bash
# 1. Cài Ollama (macOS)
brew install ollama

# 2. Kéo model Qwen2
ollama pull qwen2

# 3. Chạy Ollama server (tự động nếu dùng brew service)
ollama serve
```

Kiểm tra: `curl http://localhost:11434/api/tags`

---

## 👤 Tài khoản mặc định

Được seed tự động qua `backend/src/main/resources/data.sql`:

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | MANAGER |
| `agent1` | `agent123` | AGENT |
| `agent2` | `agent123` | AGENT |

> ⚠️ Đổi mật khẩu ngay sau khi deploy lên production!

---

## 📁 Cấu trúc thư mục

```
realestate-crm/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/realestate/crm/
│   │   ├── ai/                 # AI service (Ollama integration)
│   │   ├── config/             # Security, CORS config
│   │   ├── controller/         # REST API controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities
│   │   ├── enums/              # Enum types
│   │   ├── repository/         # Spring Data repositories
│   │   ├── security/           # JWT filter & utilities
│   │   └── service/            # Business logic
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── data.sql            # Seed data
│   └── pom.xml
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── api/                # Axios API modules
│   │   ├── components/         # Reusable components
│   │   ├── context/            # React Context (Auth)
│   │   ├── pages/              # Route pages
│   │   └── utils/              # Format helpers
│   ├── index.html
│   └── package.json
│
├── docs/                       # 📚 Project documentation
│   ├── system-design.md        # Architecture & database design
│   ├── features.md             # Feature documentation
│   ├── api-reference.md        # REST API reference
│   └── deployment.md           # Production deployment guide
│
└── README.md
```

---

## 🔌 API Base URL

Tất cả API đều có prefix `/api`:

```
Backend:  http://localhost:8080/api
Frontend: http://localhost:5173
```

Axios `baseURL` trong frontend được cấu hình tại `frontend/src/api/axios.js`:
```js
const api = axios.create({ baseURL: '/api' })
```

Vite proxy chuyển `/api/*` → `http://localhost:8080/api/*` trong dev mode.

---

## 🏗️ Production Build

```bash
# Build frontend
cd frontend && npm run build

# Build backend JAR
cd backend && mvn package -DskipTests

# Chạy JAR
java -jar backend/target/crm-0.0.1-SNAPSHOT.jar
```

> Trong production, serve static files của frontend qua Nginx hoặc copy vào `backend/src/main/resources/static/`.

---

## 📖 Tài liệu

| File | Nội dung |
|---|---|
| [`docs/system-design.md`](./docs/system-design.md) | Kiến trúc hệ thống, ERD, luồng dữ liệu |
| [`docs/features.md`](./docs/features.md) | Mô tả chi tiết từng tính năng |
| [`docs/api-reference.md`](./docs/api-reference.md) | Tài liệu REST API đầy đủ |
| [`docs/deployment.md`](./docs/deployment.md) | Hướng dẫn deploy production |

---

## 🤝 Contributing

1. Fork repo
2. Tạo feature branch: `git checkout -b feat/ten-tinh-nang`
3. Commit: `git commit -m "feat: mô tả thay đổi"`
4. Push: `git push origin feat/ten-tinh-nang`
5. Tạo Pull Request

---

## 📝 License

Internal use only — © 2024 Real Estate CRM Team.
