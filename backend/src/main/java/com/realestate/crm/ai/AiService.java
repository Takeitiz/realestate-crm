package com.realestate.crm.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.provider}")
    private String aiProvider;

    @Value("${app.ai.ollama.model}")
    private String model;

    @Value("${app.ai.ollama.timeout-seconds}")
    private int timeoutSeconds;

    public AiService(@Value("${app.ai.ollama.base-url}") String ollamaBaseUrl, ObjectMapper objectMapper) {
        this.webClient = WebClient.builder().baseUrl(ollamaBaseUrl).build();
        this.objectMapper = objectMapper;
    }

    public String parseListing(String rawText) {
        if (!"ollama".equals(aiProvider)) return mockParseListing(rawText);
        String prompt = """
Bạn là hệ thống trích xuất dữ liệu bất động sản.

QUY TẮC TUYỆT ĐỐI:
- Chỉ trả về JSON thuần túy, không có markdown, không có ```, không có giải thích
- Nếu không tìm thấy thông tin thì dùng null
- propertyType chỉ được là: HOUSE, APARTMENT, LAND, SHOPHOUSE, VILLA
- transactionType chỉ được là: SALE hoặc RENT

FORMAT (trả về đúng format này):
{"title":null,"propertyType":null,"transactionType":null,"district":null,"ward":null,"street":null,"areaSqm":null,"bedrooms":null,"bathrooms":null,"floors":null,"price":null,"priceUnit":null,"sellerName":null,"sellerPhone":null,"description":null}

VÍ DỤ INPUT: Bán nhà HXH Nguyễn Trãi Q5, 4x15m, 2 lầu, 3PN, giá 6.5 tỷ, LH Minh 0901234567
VÍ DỤ OUTPUT: {"title":"Nhà HXH Nguyễn Trãi Q5","propertyType":"HOUSE","transactionType":"SALE","district":"Quận 5","ward":null,"street":"Nguyễn Trãi","areaSqm":60.0,"bedrooms":3,"bathrooms":null,"floors":2,"price":6.5,"priceUnit":"tỷ","sellerName":"Minh","sellerPhone":"0901234567","description":"Nhà hẻm xe hơi 4x15m, 2 lầu"}

INPUT: """ + rawText + """
JSON OUTPUT:""";
        return callOllama(prompt, mockParseListing(rawText));
    }

    public String parseSearchQuery(String query) {
        if (!"ollama".equals(aiProvider)) return mockParseSearch(query);
        String prompt = """
Bạn là hệ thống phân tích yêu cầu tìm bất động sản.

QUY TẮC TUYỆT ĐỐI:
- Chỉ trả về JSON thuần túy, không có markdown, không có ```, không có giải thích
- Nếu không đề cập thì dùng null
- district: tên quận/huyện chính xác như người Việt hay gọi (ví dụ: Long Biên, Cầu Giấy, Ba Đình)
- ward: tên phường/xã nếu có đề cập (ví dụ: Dịch Vọng, Khương Đình)
- street: tên đường/phố nếu có đề cập (ví dụ: Nguyễn Trãi, Kim Mã)
- maxPrice: số thực, quy đổi về đơn vị lưu trong DB:
  + Nếu SALE (mua/bán): đơn vị TỶ → "3 tỷ"=3.0, "500 triệu"=0.5, "1.5 tỷ"=1.5
  + Nếu RENT (cho thuê): đơn vị TRIỆU → "15 triệu"=15.0, "0.5 tỷ/tháng"=500.0
- minBedrooms: số phòng ngủ tối thiểu (số nguyên)
- minBathrooms: số phòng tắm/WC tối thiểu (số nguyên)
- minFloors: số tầng tối thiểu (số nguyên)
- minArea: diện tích tối thiểu (m2, số thực)

BẢNG QUY ĐỔI transactionType:
- mua / bán / cần mua / tìm mua → SALE
- thuê / cho thuê / cần thuê / tìm thuê → RENT

BẢNG QUY ĐỔI propertyType:
- chung cư / căn hộ / cc / ch → APARTMENT
- nhà / nhà phố / nhà riêng / nhà mặt phố → HOUSE
- đất / lô đất / đất nền / đất thổ cư → LAND
- biệt thự / villa → VILLA
- shophouse / mặt phố thương mại / văn phòng / ki ốt → SHOPHOUSE

FORMAT (trả về đúng format này, không thêm trường nào khác):
{"transactionType":null,"propertyType":null,"district":null,"ward":null,"street":null,"minBedrooms":null,"minBathrooms":null,"minFloors":null,"maxPrice":null,"minArea":null}

VÍ DỤ 1 INPUT: Khách cần tìm chung cư 2 phòng ngủ ở Cầu Giấy dưới 3 tỷ
VÍ DỤ 1 OUTPUT: {"transactionType":"SALE","propertyType":"APARTMENT","district":"Cầu Giấy","ward":null,"street":null,"minBedrooms":2,"minBathrooms":null,"minFloors":null,"maxPrice":3.0,"minArea":null}

VÍ DỤ 2 INPUT: Thuê văn phòng Ba Đình đường Kim Mã khoảng 80m2 tầm 20 triệu
VÍ DỤ 2 OUTPUT: {"transactionType":"RENT","propertyType":"SHOPHOUSE","district":"Ba Đình","ward":null,"street":"Kim Mã","minBedrooms":null,"minBathrooms":null,"minFloors":null,"maxPrice":20.0,"minArea":80.0}

VÍ DỤ 3 INPUT: Tìm nhà riêng Đống Đa 4 tầng 3 WC dưới 5 tỷ
VÍ DỤ 3 OUTPUT: {"transactionType":"SALE","propertyType":"HOUSE","district":"Đống Đa","ward":null,"street":null,"minBedrooms":null,"minBathrooms":3,"minFloors":4,"maxPrice":5.0,"minArea":null}

INPUT: """ + query + """
JSON OUTPUT:""";
        return callOllama(prompt, mockParseSearch(query));
    }

    public String generatePitch(String propertiesJson, String buyerContext) {
        if (!"ollama".equals(aiProvider)) return mockGeneratePitch(propertiesJson, buyerContext);
        String prompt = """
Bạn là chuyên viên môi giới bất động sản Việt Nam chuyên nghiệp.
Viết tin nhắn Zalo giới thiệu bất động sản cho khách hàng.

YÊU CẦU:
- Viết bằng tiếng Việt, lịch sự, thân thiện, tự nhiên
- Dùng emoji phù hợp (🏠 📍 💰 ✅ 📞)
- Nêu bật điểm nổi bật phù hợp với nhu cầu khách hàng
- Kết thúc bằng lời mời xem nhà hoặc liên hệ
- Độ dài khoảng 150-250 từ
- Không bịa thông tin không có trong dữ liệu

THÔNG TIN KHÁCH HÀNG: """ + buyerContext + """

DANH SÁCH BĐS PHÙ HỢP:
""" + propertiesJson + """

TIN NHẮN ZALO:""";
        return callOllama(prompt, mockGeneratePitch(propertiesJson, buyerContext));
    }

    private String callOllama(String prompt, String fallback) {
        try {
            Map<String, Object> body = Map.of("model", model, "prompt", prompt, "stream", false,
                "options", Map.of("temperature", 0.3, "num_predict", 1024));
            String responseJson = webClient.post().uri("/api/generate").bodyValue(body)
                .retrieve().bodyToMono(String.class)
                .timeout(Duration.ofSeconds(timeoutSeconds)).block();
            JsonNode node = objectMapper.readTree(responseJson);
            String raw = node.path("response").asText(fallback);
            return extractJson(raw, fallback);
        } catch (Exception e) {
            log.warn("Ollama không khả dụng, dùng fallback: {}", e.getMessage());
            return fallback;
        }
    }

    /**
     * Ollama sometimes wraps JSON in markdown code fences (```json ... ```).
     * This strips them so JSON.parse() works on the frontend.
     */
    private String extractJson(String raw, String fallback) {
        if (raw == null) return fallback;
        String text = raw.trim();
        // Strip ```json ... ``` or ``` ... ```
        if (text.startsWith("```")) {
            int start = text.indexOf('\n');
            int end = text.lastIndexOf("```");
            if (start >= 0 && end > start) {
                text = text.substring(start + 1, end).trim();
            }
        }
        // Verify it's valid JSON — if not, return fallback
        try {
            objectMapper.readTree(text);
            return text;
        } catch (Exception e) {
            log.warn("Ollama trả về không phải JSON hợp lệ: {}", text);
            return fallback;
        }
    }


    private String mockParseListing(String rawText) {
        String type = rawText.toLowerCase().contains("chung cư") || rawText.toLowerCase().contains("căn hộ") ? "APARTMENT"
                    : rawText.toLowerCase().contains("đất") ? "LAND"
                    : rawText.toLowerCase().contains("biệt thự") ? "VILLA" : "HOUSE";
        String txType = rawText.toLowerCase().contains("cho thuê") || rawText.toLowerCase().contains("thuê") ? "RENT" : "SALE";
        return String.format("""
            {
              "title": "BĐS mới (vui lòng bổ sung thông tin)",
              "propertyType": "%s",
              "transactionType": "%s",
              "district": "",
              "ward": "",
              "street": "",
              "areaSqm": null,
              "bedrooms": null,
              "bathrooms": null,
              "floors": null,
              "price": null,
              "priceUnit": "tỷ",
              "sellerName": "",
              "sellerPhone": "",
              "description": "%s"
            }""", type, txType, rawText.replace("\"", "'").replace("\n", " ").replace("\r", ""));
    }

    private String mockParseSearch(String query) {
        String q = query.toLowerCase();

        // Transaction type
        String txType = (q.contains("thuê") || q.contains("cho thuê")) ? "RENT" : "SALE";

        // Property type
        String propType = null;
        if (q.contains("chung cư") || q.contains("căn hộ") || q.contains("cc ")) propType = "APARTMENT";
        else if (q.contains("biệt thự"))                                            propType = "VILLA";
        else if (q.contains("đất") || q.contains("lô đất"))                        propType = "LAND";
        else if (q.contains("shophouse") || q.contains("văn phòng") || q.contains("mặt phố")) propType = "SHOPHOUSE";
        else if (q.contains("nhà"))                                                 propType = "HOUSE";

        // District — common Hanoi districts
        String district = null;
        String[] districts = {
            "Cầu Giấy", "Đống Đa", "Thanh Xuân", "Hà Đông", "Tây Hồ",
            "Ba Đình", "Long Biên", "Hoàn Kiếm", "Hai Bà Trưng",
            "Nam Từ Liêm", "Bắc Từ Liêm", "Hoàng Mai", "Gia Lâm"
        };
        for (String d : districts) {
            if (q.contains(d.toLowerCase())) { district = d; break; }
        }

        // Bedrooms — "X phòng ngủ" or "Xpn" or "X pn"
        Integer bedrooms = null;
        java.util.regex.Matcher mBed = java.util.regex.Pattern
            .compile("(\\d+)\\s*(?:phòng ngủ|pn\\b|phòng)").matcher(q);
        if (mBed.find()) bedrooms = Integer.parseInt(mBed.group(1));

        // Max price — "dưới X tỷ" or "X tỷ" or "X triệu"
        Double maxPrice = null;
        java.util.regex.Matcher mPrice = java.util.regex.Pattern
            .compile("(?:dưới|khoảng|tầm)?\\s*(\\d+(?:[,.]\\d+)?)\\s*(tỷ|triệu)").matcher(q);
        if (mPrice.find()) {
            double val = Double.parseDouble(mPrice.group(1).replace(",", "."));
            maxPrice = mPrice.group(2).equals("triệu") ? val : val;
        }

        return String.format("""
            {
              "transactionType": "%s",
              "propertyType": %s,
              "district": %s,
              "minBedrooms": %s,
              "maxPrice": %s,
              "minArea": null
            }""",
            txType,
            propType  != null ? "\"" + propType  + "\"" : "null",
            district  != null ? "\"" + district  + "\"" : "null",
            bedrooms  != null ? bedrooms : "null",
            maxPrice  != null ? maxPrice : "null"
        );
    }

    private String mockGeneratePitch(String propertiesJson, String buyerContext) {
        return """
            Xin chào anh/chị! 😊

            Cảm ơn anh/chị đã tin tưởng và liên hệ với chúng tôi!

            🏠 Sau khi xem xét yêu cầu, bên mình xin giới thiệu một số bất động sản phù hợp:

            ✅ Pháp lý rõ ràng, sổ đỏ/sổ hồng chính chủ
            ✅ Vị trí thuận tiện, đi lại dễ dàng
            ✅ Giá cả hợp lý, có thể thương lượng thêm
            ✅ Sẵn sàng dẫn đi xem nhà bất kỳ lúc nào

            📍 Anh/chị có thể xem chi tiết từng căn trong danh sách đính kèm.

            📅 Anh/chị muốn đặt lịch xem nhà vào thời gian nào? Bên mình phục vụ 7 ngày/tuần ạ!

            Trân trọng! 🙏

            *(Lưu ý: Đây là tin nhắn mẫu. Cài đặt Ollama + Qwen2 để tạo nội dung AI thực sự)*""";
    }
}
