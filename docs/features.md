# Features Documentation — Real Estate CRM

> Tài liệu mô tả chi tiết tất cả tính năng của hệ thống theo từng sprint.

---

## Sprint 0 — MVP Core

### 🔐 Xác thực & Phân quyền (Auth & RBAC)
- Đăng nhập bằng username/password → nhận JWT token
- Hai vai trò: **MANAGER** (quản lý) và **AGENT** (môi giới)
- Token lưu localStorage, tự đính kèm vào mỗi request
- Hết hạn sau 24h → tự động logout và redirect về `/login`
- Data masking: Agent không thấy số nhà, SĐT đầy đủ, ghi chú nội bộ, hoa hồng

---

### 🏠 Quản lý Bất động sản
**Tạo BĐS thủ công** (`/properties/new`)
- Nhập đầy đủ: Tiêu đề, loại BĐS, loại giao dịch, địa chỉ chi tiết (tỉnh/quận/phường/đường/số nhà)
- Thông số: Diện tích (m²), phòng ngủ, phòng tắm, số tầng, hướng
- Giá: số + đơn vị (tỷ / triệu / triệu/tháng / USD)
- Thông tin chủ nhà: tên, SĐT, ghi chú nội bộ
- Tọa độ bản đồ: lat/lng (để hiện trên Map View)
- Hoa hồng: tỷ lệ (%), ghi chú, trạng thái (PENDING/RECEIVED/WAIVED)

**Danh sách BĐS** (`/properties`)
- Grid card responsive với ảnh, giá, trạng thái, freshness badge
- Bộ lọc: Quận/Huyện, Loại BĐS, Loại GD, Trạng thái, Phòng ngủ tối thiểu, Giá tối đa
- Toggle View: 📋 Danh sách / 🗺️ Bản đồ
- Phân trang (12 BĐS/trang)

**Detail Page** (`/properties/:id`) — 6 tabs:
| Tab | Nội dung |
|---|---|
| Thông tin | Đầy đủ thông số, giá, địa chỉ, sidebar hoa hồng |
| Hoạt động | Timeline sự kiện (tạo, cập nhật giá, đổi trạng thái) + Lịch sử giá |
| Bình luận | Nội bộ team feed với thêm/xóa comment |
| Lịch hẹn | Danh sách & form đặt lịch xem nhà |
| Tài liệu | Upload/download/xóa file đính kèm (PDF, Word, ...) |
| Chia sẻ | Tạo link public có thời hạn (QR code) |

**Freshness Badge** tự động tính từ ngày cập nhật cuối:
- 🟢 Xanh: ≤ 7 ngày
- 🟡 Vàng: 8–30 ngày  
- 🔴 Đỏ: > 30 ngày

---

### 👥 Khách hàng (Buyer Requirements) (`/buyers`)
- Lưu nhu cầu tìm mua/thuê: tên, SĐT, quận, loại BĐS, loại GD, số PN, giá tối đa
- Phân biệt đơn vị giá (tỷ/triệu) — không bị lẫn lộn
- Hết hạn tự động sau N ngày (cấu hình `expire-days`)
- Khi tạo BĐS mới khớp nhu cầu → **tự động tạo notification** cho agent phụ trách

---

### 🤖 AI Parse Tin Đăng
- Paste raw text từ Zalo/Facebook/WhatsApp vào form
- AI (Qwen2) trích xuất: tiêu đề, loại BĐS, địa chỉ, diện tích, phòng ngủ, phòng tắm, tầng, giá, đơn vị giá, mô tả
- Kết quả điền sẵn vào form → user review và chỉnh sửa trước khi lưu
- Phân biệt rõ "tỷ" và "triệu" — không quy đổi sai

---

### 🔍 Tìm kiếm AI (`/search`)
- Nhập câu hỏi tự nhiên: *"Tìm căn hộ 2 PN Cầu Giấy dưới 3 tỷ"*
- AI hiểu ý định và mapping sang filter parameters
- Trả về danh sách BĐS phù hợp

---

### ✉️ Tạo Tin Zalo (`/pitch`)
- Chọn BĐS từ danh sách
- AI tạo message viết sẵn để paste vào Zalo/Messenger
- Có thể chỉnh sửa trước khi copy

---

### 🔔 Notifications
- Badge số trên sidebar tự cập nhật
- Dropdown xem chi tiết, đánh dấu đã đọc
- Reverse matching: agent nhận notification khi có BĐS mới khớp nhu cầu khách

---

### ❤️ Favorites & Comments
- **Favorites**: Agent bookmark BĐS hay; xem danh sách riêng
- **Comments**: Team thảo luận nội bộ trực tiếp trên BĐS; xóa comment của mình

---

### 🔗 Public Share Link
- Manager/Agent tạo link share cho khách xem BĐS không cần đăng nhập
- Link tự hết hạn sau 7 ngày (cấu hình `app.share.expire-days`)
- Trang public ẩn thông tin nhạy cảm (SĐT, số nhà, ghi chú)
- Kèm QR code để chia sẻ nhanh

---

## Sprint 2 — Productivity

### 📅 Lịch hẹn xem nhà (Appointments) (`/appointments`)
- Đặt lịch từ trang Detail BĐS hoặc trang Appointments
- Trạng thái: `SCHEDULED → COMPLETED / CANCELLED / NO_SHOW`
- Filter theo trạng thái, click vào card để xem BĐS liên quan
- Manager xem tất cả lịch của team; Agent chỉ thấy lịch của mình

**Dashboard countdown**: Số lịch hẹn trong 7 ngày tới hiển thị trên Dashboard.

---

### 💰 Lịch sử giá (Price History)
- Tự động ghi lại khi giá BĐS thay đổi khi chỉnh sửa
- Lưu: giá cũ, giá mới, đơn vị, người thay đổi, thời điểm
- Hiển thị timeline trong tab **Hoạt động** của Detail Page
- Hiển thị trong báo cáo Property Health (Reports tab)

---

### 📎 Tài liệu đính kèm (Documents)
- Upload nhiều file vào mỗi BĐS (PDF, Word, Excel, hình ảnh...)
- Giới hạn: 10MB/file, 50MB/request
- Download file, xóa file không cần thiết
- File lưu tại `./uploads/` trên server (phân theo UUID)

---

### 💼 Hoa hồng (Commission)
- Trường thêm vào Property: tỷ lệ (%), ghi chú, trạng thái
- Trạng thái: `PENDING` / `RECEIVED` / `WAIVED`
- Chỉ MANAGER thấy thông tin hoa hồng (Agent bị ẩn)

---

## Sprint 3 — Intelligence

### 🔄 Deal Pipeline (Kanban) (`/deals`)
Deal liên kết một khách hàng + một BĐS + một agent, theo dõi giai đoạn thương lượng.

**6 giai đoạn:**
```
[NEW] → [VIEWED] → [NEGOTIATING] → [DEPOSIT] → [CLOSED]
                                              → [CANCELLED]
```

**Tính năng Kanban:**
- Drag & drop card giữa các cột (HTML5 native)
- Quick pill buttons để chuyển stage nhanh
- Tạo deal mới: chọn BĐS + khách hàng + giá dự kiến + ghi chú
- Xóa deal (agent chỉ xóa deal của mình, manager xóa tất cả)
- Manager thấy tên agent trên mỗi card

---

### 🗺️ Bản đồ (Map View)
- Toggle trong `/properties`: 📋 Danh sách ↔ 🗺️ Bản đồ
- Leaflet (OpenStreetMap) với pins màu theo trạng thái:
  - 🟢 Còn trống (AVAILABLE)
  - 🟡 Đang giữ (RESERVED)
  - 🔴 Đã bán (SOLD)
  - 🟣 Đã thuê (RENTED)
- Click pin → popup với giá, quận, nút "Xem chi tiết"
- Auto-fit zoom đến tất cả pins
- Nhập tọa độ lat/lng trong form chỉnh sửa BĐS

---

### 📊 Analytics Dashboard (`/`)
Trang chủ được nâng cấp với dữ liệu thực:

| Widget | Mô tả |
|---|---|
| **5 KPI Cards** | Tổng BĐS, Còn trống, Đang giữ, Đã bán/thuê, Chưa cập nhật 30 ngày |
| **Donut chart** | Tỷ lệ trạng thái BĐS (SVG tự vẽ) |
| **Sparkline** | Hoạt động 7 ngày gần nhất (SVG) |
| **Pipeline bar** | Số deal theo từng giai đoạn |
| **Leaderboard** | Bảng xếp hạng agent theo số deal chốt (Manager only) |
| **Recent props** | 6 BĐS mới nhất |
| **Upcoming** | Số lịch hẹn trong 7 ngày tới |

---

## Sprint 4 — Power

### 📥 Nhập BĐS hàng loạt (Bulk Import) (`/properties/import`)
Wizard 3 bước để nhập nhiều BĐS cùng lúc từ Excel:

**Bước 1 — Tải template:**
- Tải file `.xlsx` có sẵn header + ví dụ + sheet hướng dẫn
- Gồm 22 cột: title, propertyType, transactionType, status, tỉnh/quận/phường/đường/số nhà, diện tích, PN/WC/tầng, hướng, giá, đơn vị, mô tả, chủ nhà, lat/lng

**Bước 2 — Điền & upload:**
- Điền dữ liệu từ dòng 2 (không xóa header)
- Upload file lên hệ thống

**Bước 3 — Xem kết quả:**
- Progress bar: X/Y BĐS thành công
- Bảng lỗi chi tiết: số dòng, tiêu đề, lý do lỗi
- Nút "Xem danh sách BĐS" sau khi hoàn thành

**Validation:**
- `title` và `district` là bắt buộc
- Enum values (propertyType, status, direction...) phải chính xác
- Row trống tự động bỏ qua
- Lỗi 1 row không ảnh hưởng các row khác

---

### 📊 Báo cáo hiệu suất (Reports) (`/reports`)

**Tab 1 — Hiệu suất Môi giới** (Manager only):
- Period filter: 7 / 30 / 90 / 365 ngày
- **4 KPI tổng**: Tổng MG, BĐS trong kỳ, Lịch hẹn hoàn thành, Deal chốt
- **Bar chart**: Ranking agent theo số deal chốt (🥇🥈🥉)
- **Bảng sortable**: Click cột để sort (tên MG, BĐS, lịch hẹn, deals, tỷ lệ chốt, hoạt động)
- **Xuất CSV**: UTF-8 BOM (mở đúng tiếng Việt trong Excel)

**Metrics mỗi agent:**
| Metric | Định nghĩa |
|---|---|
| Tổng BĐS | Tổng BĐS từ khi đăng ký |
| BĐS trong kỳ | BĐS tạo trong khoảng thời gian chọn |
| Tổng lịch hẹn | Tổng số lịch hẹn đã tạo |
| Lịch đã xem | Số lịch status = COMPLETED |
| Tổng deal | Tổng deal đã tạo |
| Deal chốt | Số deal stage = CLOSED |
| Tỷ lệ chốt | closedDeals / totalDeals × 100% |
| Hoạt động | Số actions trong activity_log trong kỳ |

**Tab 2 — Sức khoẻ BĐS:**
- **Stale listings**: BĐS không cập nhật >30 ngày, màu urgency (cam = 30-60d, đỏ = >60d)
- **Price changes**: 20 thay đổi giá gần nhất với ↑↓ indicator, click vào xem BĐS

---

## Tính năng kỹ thuật chung

### 🔄 Freshness System
Tất cả BĐS đều có `freshnessStatus` (GREEN/YELLOW/RED) tự tính từ `updatedAt`. Hiển thị badge trên PropertyCard và cảnh báo trong Reports.

### 🔍 Duplicate Detection  
Khi tạo BĐS mới: tự động kiểm tra BĐS trùng theo (quận + diện tích ±2m² + giá ±0.5). Hiển thị cảnh báo để agent xem xét.

### 📱 Mobile Responsive
Sidebar thu gọn trên màn hình nhỏ. Grid layout adaptive. Form scroll tốt trên mobile.

### 🌙 Dark Mode
Hỗ trợ dark/light mode qua CSS variables. Toggle trong topbar.
