package com.realestate.crm.controller;

import com.realestate.crm.dto.request.PropertyRequest;
import com.realestate.crm.entity.User;
import com.realestate.crm.enums.*;
import com.realestate.crm.repository.UserRepository;
import com.realestate.crm.service.PropertyService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/properties/import")
public class BulkImportController {

    private final PropertyService propertyService;
    private final UserRepository userRepository;

    private static final String[] HEADERS = {
        "title", "propertyType", "transactionType", "status",
        "province", "district", "ward", "street", "houseNumber",
        "areaSqm", "bedrooms", "bathrooms", "floors", "direction",
        "price", "priceUnit", "description", "sellerName", "sellerPhone", "sellerNotes",
        "lat", "lng"
    };

    public BulkImportController(PropertyService propertyService, UserRepository userRepository) {
        this.propertyService = propertyService;
        this.userRepository = userRepository;
    }

    /** Download a blank Excel template */
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("BĐS Import");

            // Header style
            CellStyle headerStyle = wb.createCellStyle();
            Font font = wb.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(HEADERS[i]);
                c.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            // Example row
            Row example = sheet.createRow(1);
            String[] exampleVals = {
                "Căn hộ 2PN Cầu Giấy", "APARTMENT", "SALE", "AVAILABLE",
                "Hà Nội", "Cầu Giấy", "Dịch Vọng", "Trần Thái Tông", "15B",
                "68", "2", "2", "10", "EAST",
                "2.5", "tỷ", "Căn hộ view đẹp, full nội thất", "Nguyễn Văn A", "0912345678", "Chủ cần bán gấp",
                "21.028511", "105.854167"
            };
            for (int i = 0; i < exampleVals.length; i++) {
                example.createCell(i).setCellValue(exampleVals[i]);
            }

            // Instruction sheet
            Sheet info = wb.createSheet("Hướng dẫn");
            String[] instructions = {
                "HƯỚNG DẪN NHẬP LIỆU HÀNG LOẠT",
                "",
                "propertyType: APARTMENT | HOUSE | LAND | VILLA | SHOPHOUSE | OFFICE",
                "transactionType: SALE | RENT",
                "status: AVAILABLE | RESERVED | SOLD | RENTED",
                "direction: NORTH | SOUTH | EAST | WEST | NORTHEAST | NORTHWEST | SOUTHEAST | SOUTHWEST",
                "priceUnit: tỷ | triệu | triệu/tháng | USD",
                "",
                "⚠️ Không xóa dòng tiêu đề (dòng 1).",
                "⚠️ Nhập dữ liệu từ dòng 2 trở đi.",
                "⚠️ Chỉ title và district là bắt buộc.",
            };
            for (int i = 0; i < instructions.length; i++) {
                Row r = info.createRow(i);
                r.createCell(0).setCellValue(instructions[i]);
            }
            info.setColumnWidth(0, 15000);

            wb.write(out);
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bds-import-template.xlsx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(out.toByteArray());
        }
    }

    /** Upload and process Excel file */
    @PostMapping
    public ResponseEntity<Map<String, Object>> importExcel(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User caller = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        int success = 0;
        List<Map<String, Object>> errors = new ArrayList<>();

        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            int totalRows = sheet.getLastRowNum();

            for (int rowNum = 1; rowNum <= totalRows; rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row == null || isRowEmpty(row)) continue;

                try {
                    PropertyRequest req = rowToRequest(row);
                    propertyService.create(req, caller);
                    success++;
                } catch (Exception e) {
                    Map<String, Object> err = new LinkedHashMap<>();
                    err.put("row", rowNum + 1);
                    err.put("error", e.getMessage());
                    err.put("title", getCellStr(row, 0));
                    errors.add(err);
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", success);
        result.put("errors", errors);
        result.put("total", success + errors.size());
        return ResponseEntity.ok(result);
    }

    private PropertyRequest rowToRequest(Row row) {
        PropertyRequest req = new PropertyRequest();
        req.setTitle(getCellStr(row, 0));
        String pt = getCellStr(row, 1);
        if (!pt.isEmpty()) req.setPropertyType(PropertyType.valueOf(pt));
        String tt = getCellStr(row, 2);
        if (!tt.isEmpty()) req.setTransactionType(TransactionType.valueOf(tt));
        String st = getCellStr(row, 3);
        if (!st.isEmpty()) req.setStatus(PropertyStatus.valueOf(st));
        req.setProvince(getCellStr(row, 4));
        req.setDistrict(getCellStr(row, 5));
        req.setWard(getCellStr(row, 6));
        req.setStreet(getCellStr(row, 7));
        req.setHouseNumber(getCellStr(row, 8));
        String area = getCellStr(row, 9); if (!area.isEmpty()) req.setAreaSqm(new BigDecimal(area));
        String bed = getCellStr(row, 10); if (!bed.isEmpty()) req.setBedrooms(Integer.parseInt(bed));
        String bath = getCellStr(row, 11); if (!bath.isEmpty()) req.setBathrooms(Integer.parseInt(bath));
        String fl = getCellStr(row, 12); if (!fl.isEmpty()) req.setFloors(Integer.parseInt(fl));
        String dir = getCellStr(row, 13); if (!dir.isEmpty()) req.setDirection(Direction.valueOf(dir));
        String price = getCellStr(row, 14); if (!price.isEmpty()) req.setPrice(new BigDecimal(price));
        req.setPriceUnit(getCellStr(row, 15));
        req.setDescription(getCellStr(row, 16));
        req.setSellerName(getCellStr(row, 17));
        req.setSellerPhone(getCellStr(row, 18));
        req.setSellerNotes(getCellStr(row, 19));
        String lat = getCellStr(row, 20); if (!lat.isEmpty()) req.setLat(Double.parseDouble(lat));
        String lng = getCellStr(row, 21); if (!lng.isEmpty()) req.setLng(Double.parseDouble(lng));
        return req;
    }

    private String getCellStr(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double v = cell.getNumericCellValue();
                if (v == Math.floor(v)) yield String.valueOf((long) v);
                yield String.valueOf(v);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < HEADERS.length; i++) {
            Cell c = row.getCell(i);
            if (c != null && c.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }
}
