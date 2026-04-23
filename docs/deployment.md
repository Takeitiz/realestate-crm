# Deployment Guide — Real Estate CRM

> Hướng dẫn deploy hệ thống lên môi trường production.

---

## 1. Yêu cầu server

| Phần mềm | Phiên bản | Ghi chú |
|---|---|---|
| OS | Ubuntu 22.04 LTS | Hoặc CentOS 8+ |
| Java JDK | 21 | `apt install openjdk-21-jdk` |
| Nginx | 1.24+ | Reverse proxy + static files |
| Ollama | Latest | Nếu dùng AI |
| RAM | ≥ 2GB | Ollama cần thêm 4GB cho Qwen2 |
| Disk | ≥ 20GB | Uploads + DB |

---

## 2. Checklist trước khi deploy

- [ ] Đổi `app.jwt.secret` thành chuỗi ngẫu nhiên ≥ 32 ký tự
- [ ] Tắt H2 Console: `spring.h2.console.enabled=false`
- [ ] Cập nhật `app.cors.allowed-origins` với domain thật
- [ ] Cập nhật `app.company-name` và `app.company-tagline`
- [ ] Đặt đường dẫn tuyệt đối cho `app.upload.dir`
- [ ] Đặt đường dẫn H2 tuyệt đối: `spring.datasource.url=jdbc:h2:file:/var/data/realestate_db;...`
- [ ] Đổi mật khẩu tài khoản admin sau lần đầu đăng nhập

---

## 3. Build production

### Frontend
```bash
cd frontend
npm install
npm run build
# Output: frontend/dist/
```

### Backend
```bash
cd backend
mvn package -DskipTests
# Output: backend/target/crm-0.0.1-SNAPSHOT.jar
```

---

## 4. Cấu hình production `application.properties`

```properties
spring.application.name=RealEstateCRM

# Company
app.company-name=Tên Công Ty Của Bạn
app.company-tagline=Hệ thống quản lý BĐS nội bộ

# H2 — đường dẫn tuyệt đối
spring.datasource.url=jdbc:h2:file:/var/data/realestate_db;AUTO_SERVER=TRUE
spring.datasource.username=sa
spring.datasource.password=yourdbpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false
spring.jpa.show-sql=false

# H2 Console — TẮT trong production
spring.h2.console.enabled=false

# Upload — đường dẫn tuyệt đối
app.upload.dir=/var/uploads/realestate

# JWT — ĐỔI SECRET!
app.jwt.secret=change-this-to-a-very-long-random-string-min-32-chars
app.jwt.expiration-ms=86400000

# AI
app.ai.provider=ollama
app.ai.ollama.base-url=http://127.0.0.1:11434
app.ai.ollama.model=qwen2
app.ai.ollama.timeout-seconds=60

# CORS — domain thật của bạn
app.cors.allowed-origins=https://crm.yourcompany.com

# Logging
logging.level.com.realestate=WARN
logging.level.org.springframework.security=WARN

# Share link
app.share.expire-days=7
```

---

## 5. Deploy với Systemd

### Backend service

Tạo file `/etc/systemd/system/realestate-crm.service`:

```ini
[Unit]
Description=Real Estate CRM Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/realestate-crm
ExecStart=/usr/bin/java -jar /opt/realestate-crm/crm.jar \
  --spring.config.location=file:/opt/realestate-crm/application.properties
Restart=always
RestartSec=10
StandardOutput=append:/var/log/realestate-crm/app.log
StandardError=append:/var/log/realestate-crm/error.log

[Install]
WantedBy=multi-user.target
```

```bash
# Tạo thư mục
sudo mkdir -p /opt/realestate-crm /var/log/realestate-crm /var/data /var/uploads/realestate

# Copy files
sudo cp backend/target/crm-0.0.1-SNAPSHOT.jar /opt/realestate-crm/crm.jar
sudo cp production-application.properties /opt/realestate-crm/application.properties

# Enable & start
sudo systemctl daemon-reload
sudo systemctl enable realestate-crm
sudo systemctl start realestate-crm
sudo systemctl status realestate-crm
```

---

## 6. Nginx Configuration

### Option A: Nginx serve frontend + proxy backend

```nginx
server {
    listen 80;
    server_name crm.yourcompany.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name crm.yourcompany.com;

    ssl_certificate     /etc/letsencrypt/live/crm.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.yourcompany.com/privkey.pem;

    # Serve React build
    root /opt/realestate-crm/frontend-dist;
    index index.html;

    # React Router — fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Spring Boot
    location /api/ {
        proxy_pass         http://127.0.0.1:8080/api/;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Upload size limit
        client_max_body_size 50M;
    }

    # Static files cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Copy frontend build
sudo cp -r frontend/dist/* /opt/realestate-crm/frontend-dist/

# Test & reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. SSL với Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d crm.yourcompany.com
# Auto-renew
sudo systemctl enable certbot.timer
```

---

## 8. Ollama setup trên server

```bash
# Cài Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Kéo model (cần ~4GB)
ollama pull qwen2

# Tạo systemd service cho Ollama
sudo tee /etc/systemd/system/ollama.service > /dev/null << 'EOF'
[Unit]
Description=Ollama Service
After=network.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ubuntu
Environment=OLLAMA_HOST=127.0.0.1:11434
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable ollama
sudo systemctl start ollama

# Kiểm tra
curl http://127.0.0.1:11434/api/tags
```

---

## 9. Backup & Restore

### Backup hàng ngày với cron

```bash
# /etc/cron.d/realestate-backup
0 2 * * * ubuntu /opt/realestate-crm/backup.sh
```

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backup/realestate/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Database
cp /var/data/realestate_db.mv.db "$BACKUP_DIR/"

# Uploads
cp -r /var/uploads/realestate "$BACKUP_DIR/"

# Keep last 30 days
find /backup/realestate -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;

echo "Backup done: $BACKUP_DIR"
```

### Restore

```bash
sudo systemctl stop realestate-crm

# Restore DB
cp /backup/realestate/20240120/realestate_db.mv.db /var/data/

# Restore uploads
cp -r /backup/realestate/20240120/realestate /var/uploads/

sudo systemctl start realestate-crm
```

---

## 10. Monitor & Logs

```bash
# Xem log realtime
sudo journalctl -u realestate-crm -f

# Xem log file
tail -f /var/log/realestate-crm/app.log

# Kiểm tra backend health
curl http://localhost:8080/api/config/public

# Kiểm tra AI
curl http://localhost:11434/api/tags

# Các process đang chạy
ps aux | grep java
```

---

## 11. Upgrade ứng dụng

```bash
# 1. Build phiên bản mới (local)
mvn package -DskipTests
npm run build

# 2. Copy lên server
scp backend/target/crm-0.0.1-SNAPSHOT.jar ubuntu@server:/opt/realestate-crm/crm-new.jar

# 3. Swap và restart (zero-downtime)
ssh ubuntu@server
sudo systemctl stop realestate-crm
sudo mv /opt/realestate-crm/crm.jar /opt/realestate-crm/crm-backup.jar
sudo mv /opt/realestate-crm/crm-new.jar /opt/realestate-crm/crm.jar
sudo systemctl start realestate-crm

# 4. Kiểm tra
curl http://localhost:8080/api/config/public
```

---

## 12. Troubleshooting

| Vấn đề | Kiểm tra |
|---|---|
| Backend không start | `sudo journalctl -u realestate-crm -n 50` |
| 401 Unauthorized | Kiểm tra `app.jwt.secret` đúng không |
| AI không hoạt động | `curl http://localhost:11434/api/tags` — Ollama chạy chưa? |
| Upload lỗi | Kiểm tra quyền thư mục `app.upload.dir` |
| CORS error | Kiểm tra `app.cors.allowed-origins` có đúng domain không |
| DB lỗi khi restart | Xóa lock file: `rm /var/data/realestate_db.lock.db` |
| Nginx 502 | Backend chưa khởi động xong — đợi 30s rồi thử lại |
