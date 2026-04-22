package com.realestate.crm.config;

import com.realestate.crm.entity.BuyerRequirement;
import com.realestate.crm.entity.Property;
import com.realestate.crm.entity.User;
import com.realestate.crm.enums.*;
import com.realestate.crm.repository.BuyerRequirementRepository;
import com.realestate.crm.repository.PropertyRepository;
import com.realestate.crm.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BuyerRequirementRepository buyerRequirementRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PropertyRepository propertyRepository,
                           BuyerRequirementRepository buyerRequirementRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.buyerRequirementRepository = buyerRequirementRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        User admin  = seedUser("admin",  "password", "Quản trị viên",   UserRole.MANAGER);
        User agent1 = seedUser("agent1", "password", "Nguyễn Văn Minh", UserRole.AGENT);
        User agent2 = seedUser("agent2", "password", "Trần Thị Lan",    UserRole.AGENT);

        if (propertyRepository.count() == 0) {
            saveProperty("Chung cư 2PN Cầu Giấy view hồ", PropertyType.APARTMENT, TransactionType.SALE,
                PropertyStatus.AVAILABLE, "Hà Nội", "Cầu Giấy", "Dịch Vọng", "Trần Thái Tông", "15B",
                68.5, 2, 2, 1, 2.85, "tỷ",
                "Căn hộ 2 phòng ngủ, view hồ tuyệt đẹp, nội thất đầy đủ, tòa nhà an ninh 24/7.", "Nguyễn Văn Nam", "0912345678", admin);

            saveProperty("Nhà phố Đống Đa 4 tầng ngõ thông", PropertyType.HOUSE, TransactionType.SALE,
                PropertyStatus.AVAILABLE, "Hà Nội", "Đống Đa", "Khâm Thiên", "Nguyễn Lương Bằng", "7",
                45.0, 4, 3, 4, 4.2, "tỷ",
                "Nhà xây mới 2022, ngõ thông thoáng 3m, ô tô đỗ cửa, sổ đỏ chính chủ.", "Lê Thị Hoa", "0987654321", admin);

            saveProperty("Cho thuê căn hộ 3PN Thanh Xuân full đồ", PropertyType.APARTMENT, TransactionType.RENT,
                PropertyStatus.AVAILABLE, "Hà Nội", "Thanh Xuân", "Khương Đình", "Nguyễn Trãi", "201",
                85.0, 3, 2, 1, 12.0, "triệu/tháng",
                "Căn hộ 3 phòng ngủ, đầy đủ nội thất cao cấp, điều hòa, tủ lạnh, máy giặt. Tòa nhà có hồ bơi, gym.", "Phạm Đức Long", "0934567890", agent1);

            saveProperty("Đất thổ cư Hà Đông mặt phố lớn", PropertyType.LAND, TransactionType.SALE,
                PropertyStatus.AVAILABLE, "Hà Nội", "Hà Đông", "Yên Nghĩa", "Quang Trung", null,
                120.0, 0, 0, 0, 3.6, "tỷ",
                "Đất mặt đường lớn 20m, sổ đỏ riêng, kinh doanh thuận lợi. Gần Aeon Mall Hà Đông.", "Hoàng Văn Tú", "0945678901", admin);

            saveProperty("Biệt thự Tây Hồ 5PN sân vườn rộng", PropertyType.VILLA, TransactionType.SALE,
                PropertyStatus.AVAILABLE, "Hà Nội", "Tây Hồ", "Quảng An", "Đặng Thai Mai", "55",
                250.0, 5, 4, 3, 15.5, "tỷ",
                "Biệt thự sân vườn 250m², 5 phòng ngủ, 4 WC, gara 2 xe. View hồ Tây cực đẹp.", "Vũ Minh Tuấn", "0956789012", agent2);

            saveProperty("Cho thuê văn phòng Ba Đình 80m2", PropertyType.SHOPHOUSE, TransactionType.RENT,
                PropertyStatus.AVAILABLE, "Hà Nội", "Ba Đình", "Cống Vị", "Kim Mã", "18",
                80.0, 0, 1, 1, 20.0, "triệu/tháng",
                "Văn phòng mặt phố Kim Mã, điều hòa trung tâm, thang máy. Phù hợp công ty 20-30 người.", "Bùi Thị Ngọc", "0967890123", admin);

            saveProperty("Chung cư 1PN Long Biên giá tốt", PropertyType.APARTMENT, TransactionType.SALE,
                PropertyStatus.RESERVED, "Hà Nội", "Long Biên", "Bồ Đề", "Ngô Gia Tự", "305",
                42.0, 1, 1, 1, 1.45, "tỷ",
                "Căn hộ 1 phòng ngủ, mới bàn giao, chủ cần tiền gấp. Tòa nhà mới xây.", "Đinh Công Sáng", "0978901234", agent2);

            saveProperty("Nhà ngõ Hai Bà Trưng 3 tầng đẹp", PropertyType.HOUSE, TransactionType.SALE,
                PropertyStatus.AVAILABLE, "Hà Nội", "Hai Bà Trưng", "Bạch Mai", "Minh Khai", "12A",
                36.0, 3, 2, 3, 3.1, "tỷ",
                "Nhà trong ngõ yên tĩnh, xây mới 2023, nội thất cơ bản, sổ đỏ chính chủ.", "Tạ Thị Thu", "0989012345", admin);

            saveProperty("Cho thuê phòng trọ Nam Từ Liêm", PropertyType.APARTMENT, TransactionType.RENT,
                PropertyStatus.AVAILABLE, "Hà Nội", "Nam Từ Liêm", "Mỹ Đình 1", "Phạm Hùng", "88",
                25.0, 1, 1, 1, 4.5, "triệu/tháng",
                "Phòng trọ cao cấp gần Keangnam, điều hòa, an ninh. Không gian thoáng mát.", "Lý Văn Chất", "0901234567", agent2);

            saveProperty("Shophouse Hoàn Kiếm kinh doanh đỉnh", PropertyType.SHOPHOUSE, TransactionType.SALE,
                PropertyStatus.AVAILABLE, "Hà Nội", "Hoàn Kiếm", "Lý Thái Tổ", "Đinh Tiên Hoàng", "3",
                55.0, 2, 2, 4, 18.0, "tỷ",
                "Shophouse 4 tầng mặt phố cổ sầm uất, tầng 2-4 cho thuê 30 triệu/tháng.", "Nguyễn Hoàng Anh", "0912098765", admin);
        }

        if (buyerRequirementRepository.count() == 0) {
            BuyerRequirement b1 = new BuyerRequirement();
            b1.setBuyerName("Anh Quang (khách VIP)"); b1.setBuyerPhone("0911222333");
            b1.setTransactionType(TransactionType.SALE); b1.setPropertyType(PropertyType.APARTMENT);
            b1.setTargetDistrict("Cầu Giấy"); b1.setMinArea(BigDecimal.valueOf(60)); b1.setMaxArea(BigDecimal.valueOf(90));
            b1.setMinBedrooms(2); b1.setMaxPrice(BigDecimal.valueOf(3.5)); b1.setPriceUnit("tỷ");
            b1.setNotes("Yêu cầu tầng cao, view đẹp, nội thất đầy đủ. Sẵn sàng xuống tiền ngay.");
            b1.setActive(true); b1.setAgent(agent1);
            buyerRequirementRepository.save(b1);

            BuyerRequirement b2 = new BuyerRequirement();
            b2.setBuyerName("Chị Mai - thuê văn phòng"); b2.setBuyerPhone("0933444555");
            b2.setTransactionType(TransactionType.RENT); b2.setPropertyType(PropertyType.SHOPHOUSE);
            b2.setTargetDistrict("Ba Đình"); b2.setMinArea(BigDecimal.valueOf(70)); b2.setMaxArea(BigDecimal.valueOf(120));
            b2.setMaxPrice(BigDecimal.valueOf(25)); b2.setPriceUnit("triệu/tháng");
            b2.setNotes("Cần văn phòng mặt phố hoặc ngõ lớn, tầng 1, gần trung tâm. Hợp đồng 2 năm.");
            b2.setActive(true); b2.setAgent(agent2);
            buyerRequirementRepository.save(b2);
        }
    }

    private User seedUser(String username, String rawPassword, String fullName, UserRole role) {
        return userRepository.findByUsername(username).orElseGet(() ->
            userRepository.save(User.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(fullName)
                .role(role)
                .enabled(true)
                .build())
        );
    }

    private void saveProperty(String title, PropertyType type, TransactionType txType,
                               PropertyStatus status, String province, String district,
                               String ward, String street, String houseNumber,
                               double area, int bedrooms, int bathrooms, int floors,
                               double price, String priceUnit, String description,
                               String sellerName, String sellerPhone, User createdBy) {
        Property p = new Property();
        p.setTitle(title); p.setPropertyType(type); p.setTransactionType(txType);
        p.setStatus(status); p.setProvince(province); p.setDistrict(district);
        p.setWard(ward); p.setStreet(street); p.setHouseNumber(houseNumber);
        p.setAreaSqm(BigDecimal.valueOf(area)); p.setBedrooms(bedrooms);
        p.setBathrooms(bathrooms); p.setFloors(floors);
        p.setPrice(BigDecimal.valueOf(price)); p.setPriceUnit(priceUnit);
        p.setDescription(description); p.setSellerName(sellerName);
        p.setSellerPhone(sellerPhone); p.setCreatedBy(createdBy);
        propertyRepository.save(p);
    }
}
