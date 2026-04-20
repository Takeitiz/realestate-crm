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
            Bạn là trợ lý bất động sản. Phân tích text sau và trả về JSON thuần túy:
            {"title":"...","propertyType":"HOUSE|APARTMENT|LAND|SHOPHOUSE|VILLA","transactionType":"SALE|RENT",
            "district":"...","ward":"...","street":"...","areaSqm":0.0,"bedrooms":0,"bathrooms":0,"floors":0,
            "price":0.0,"priceUnit":"tỷ|triệu|triệu/tháng","sellerName":"...","sellerPhone":"...","description":"..."}
            Text: """ + rawText;
        return callOllama(prompt, mockParseListing(rawText));
    }

    public String parseSearchQuery(String query) {
        if (!"ollama".equals(aiProvider)) return mockParseSearch(query);
        String prompt = """
            Phân tích yêu cầu tìm BĐS, trả JSON thuần túy:
            {"district":"...","propertyType":"...","transactionType":"SALE|RENT","minBedrooms":0,"maxPrice":0.0,"minArea":0.0}
            Yêu cầu: """ + query;
        return callOllama(prompt, mockParseSearch(query));
    }

    public String generatePitch(String propertiesJson, String buyerContext) {
        if (!"ollama".equals(aiProvider)) return mockGeneratePitch(propertiesJson, buyerContext);
        String prompt = "Viết tin nhắn Zalo giới thiệu BĐS bằng tiếng Việt, lịch sự, có emoji.\n"
            + "Thông tin khách: " + buyerContext + "\nDanh sách BĐS: " + propertiesJson;
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
            return node.path("response").asText(fallback);
        } catch (Exception e) {
            log.warn("Ollama không khả dụng, dùng fallback: {}", e.getMessage());
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
        String txType = query.toLowerCase().contains("thuê") ? "RENT" : "SALE";
        return String.format("""
            {
              "transactionType": "%s",
              "district": null,
              "propertyType": null,
              "minBedrooms": null,
              "maxPrice": null,
              "minArea": null
            }""", txType);
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
