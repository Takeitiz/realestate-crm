-- Seed Data for Real Estate CRM (Hanoi)
-- Passwords are BCrypt hashed: admin123 and agent123

INSERT INTO users (username, password, full_name, role, enabled, created_at)
SELECT 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', N'Quản trị viên', 'MANAGER', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, password, full_name, role, enabled, created_at)
SELECT 'agent1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', N'Nguyễn Văn Minh', 'AGENT', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'agent1');

INSERT INTO users (username, password, full_name, role, enabled, created_at)
SELECT 'agent2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', N'Trần Thị Lan', 'AGENT', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'agent2');

-- Sample Properties (Hanoi Districts)
INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Chung cư 2PN Cầu Giấy view hồ', 'APARTMENT', 'SALE', 'AVAILABLE', N'Hà Nội', N'Cầu Giấy', N'Dịch Vọng', N'Trần Thái Tông', '15B', 68.5, 2, 2, 1, 2.85, N'tỷ', N'Căn hộ 2 phòng ngủ, view hồ tuyệt đẹp, nội thất đầy đủ, tòa nhà an ninh 24/7. Gần trường Đại học Quốc gia, thuận tiện đi lại.', N'Nguyễn Văn Nam', '0912345678', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Chung cư 2PN Cầu Giấy view hồ');

INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Nhà phố Đống Đa 4 tầng ngõ thông', 'HOUSE', 'SALE', 'AVAILABLE', N'Hà Nội', N'Đống Đa', N'Khâm Thiên', N'Nguyễn Lương Bằng', '7', 45.0, 4, 3, 4, 4.2, N'tỷ', N'Nhà xây mới 2022, ngõ thông thoáng 3m, ô tô đỗ cửa, sổ đỏ chính chủ. Gần phố cổ, tiện kinh doanh.', N'Lê Thị Hoa', '0987654321', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Nhà phố Đống Đa 4 tầng ngõ thông');

INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Cho thuê căn hộ 3PN Thanh Xuân full đồ', 'APARTMENT', 'RENT', 'AVAILABLE', N'Hà Nội', N'Thanh Xuân', N'Khương Đình', N'Nguyễn Trãi', '201', 85.0, 3, 2, 1, 12.0, N'triệu/tháng', N'Căn hộ 3 phòng ngủ, đầy đủ nội thất cao cấp, điều hòa, tủ lạnh, máy giặt. Tòa nhà có hồ bơi, gym và bảo vệ 24/7.', N'Phạm Đức Long', '0934567890', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Cho thuê căn hộ 3PN Thanh Xuân full đồ');

INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Đất thổ cư Hà Đông mặt phố lớn', 'LAND', 'SALE', 'AVAILABLE', N'Hà Nội', N'Hà Đông', N'Yên Nghĩa', N'Quang Trung', NULL, 120.0, 0, 0, 0, 3.6, N'tỷ', N'Đất mặt đường lớn 20m, sổ đỏ riêng, kinh doanh thuận lợi. Gần trung tâm thương mại Aeon Mall Hà Đông.', N'Hoàng Văn Tú', '0945678901', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Đất thổ cư Hà Đông mặt phố lớn');

INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Biệt thự Tây Hồ 5PN sân vườn rộng', 'VILLA', 'SALE', 'AVAILABLE', N'Hà Nội', N'Tây Hồ', N'Quảng An', N'Đặng Thai Mai', '55', 250.0, 5, 4, 3, 15.5, N'tỷ', N'Biệt thự sân vườn 250m², 5 phòng ngủ, 4 WC, gara 2 xe ô tô. View hồ Tây cực đẹp, an ninh khu vực tốt.', N'Vũ Minh Tuấn', '0956789012', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Biệt thự Tây Hồ 5PN sân vườn rộng');

INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Cho thuê văn phòng Ba Đình 80m2', 'SHOPHOUSE', 'RENT', 'AVAILABLE', N'Hà Nội', N'Ba Đình', N'Cống Vị', N'Kim Mã', '18', 80.0, 0, 1, 1, 20.0, N'triệu/tháng', N'Văn phòng tầng 1-2 mặt phố Kim Mã, sảnh đón tiếp lịch sự, điều hòa trung tâm, thang máy. Phù hợp công ty 20-30 người.', N'Bùi Thị Ngọc', '0967890123', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Cho thuê văn phòng Ba Đình 80m2');

INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Chung cư 1PN Long Biên giá tốt', 'APARTMENT', 'SALE', 'RESERVED', N'Hà Nội', N'Long Biên', N'Bồ Đề', N'Ngô Gia Tự', '305', 42.0, 1, 1, 1, 1.45, N'tỷ', N'Căn hộ 1 phòng ngủ, mới bàn giao, cần mua ngay, chủ cần tiền gấp. Tòa nhà mới xây, khu dân cư sầm uất.', N'Đinh Công Sáng', '0978901234', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Chung cư 1PN Long Biên giá tốt');

INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Nhà ngõ Hai Bà Trưng 3 tầng đẹp', 'HOUSE', 'SALE', 'AVAILABLE', N'Hà Nội', N'Hai Bà Trưng', N'Bạch Mai', N'Minh Khai', '12A', 36.0, 3, 2, 3, 3.1, N'tỷ', N'Nhà trong ngõ yên tĩnh, xây mới 2023, nội thất cơ bản, sổ đỏ chính chủ, có thể thương lượng.', N'Tạ Thị Thu', '0989012345', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Nhà ngõ Hai Bà Trưng 3 tầng đẹp');

INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Cho thuê phòng trọ Nam Từ Liêm', 'APARTMENT', 'RENT', 'AVAILABLE', N'Hà Nội', N'Nam Từ Liêm', N'Mỹ Đình 1', N'Phạm Hùng', '88', 25.0, 1, 1, 1, 4.5, N'triệu/tháng', N'Phòng trọ cao cấp gần Keangnam, điều hòa, nóng lạnh, tủ quần áo, an ninh. Không gian thoáng mát, ưu tiên đi làm.', N'Lý Văn Chất', '0901234567', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Cho thuê phòng trọ Nam Từ Liêm');

INSERT INTO properties (title, property_type, transaction_type, status, province, district, ward, street, house_number, area_sqm, bedrooms, bathrooms, floors, price, price_unit, description, seller_name, seller_phone, created_by_id, created_at, updated_at)
SELECT N'Shophouse Hoàn Kiếm kinh doanh đỉnh', 'SHOPHOUSE', 'SALE', 'AVAILABLE', N'Hà Nội', N'Hoàn Kiếm', N'Lý Thái Tổ', N'Đinh Tiên Hoàng', '3', 55.0, 2, 2, 4, 18.0, N'tỷ', N'Shophouse 4 tầng mặt phố cổ sầm uất, kinh doanh đắt khách, tầng 2-4 cho thuê 30 triệu/tháng. Đầu tư siêu lợi nhuận.', N'Nguyễn Hoàng Anh', '0912098765', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = N'Shophouse Hoàn Kiếm kinh doanh đỉnh');

-- Sample Buyer Requirements
INSERT INTO buyer_requirements (buyer_name, buyer_phone, transaction_type, property_type, target_district, min_area, max_area, min_bedrooms, max_price, price_unit, notes, active, agent_id, created_at, updated_at)
SELECT N'Anh Quang (khách VIP)', '0911222333', 'SALE', 'APARTMENT', N'Cầu Giấy', 60.0, 90.0, 2, 3.5, N'tỷ', N'Yêu cầu tầng cao, view đẹp, nội thất đầy đủ. Sẵn sàng xuống tiền ngay.', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM buyer_requirements WHERE buyer_name = N'Anh Quang (khách VIP)');

INSERT INTO buyer_requirements (buyer_name, buyer_phone, transaction_type, property_type, target_district, min_area, max_area, min_bedrooms, max_price, price_unit, notes, active, agent_id, created_at, updated_at)
SELECT N'Chị Mai - thuê văn phòng', '0933444555', 'RENT', 'SHOPHOUSE', N'Ba Đình', 70.0, 120.0, NULL, 25.0, N'triệu/tháng', N'Cần văn phòng mặt phố hoặc ngõ lớn, tầng 1, gần trung tâm. Hợp đồng 2 năm.', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM buyer_requirements WHERE buyer_name = N'Chị Mai - thuê văn phòng');
