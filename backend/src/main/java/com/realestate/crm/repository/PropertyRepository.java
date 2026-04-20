package com.realestate.crm.repository;

import com.realestate.crm.entity.Property;
import com.realestate.crm.enums.PropertyStatus;
import com.realestate.crm.enums.PropertyType;
import com.realestate.crm.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    @Query("""
        SELECT p FROM Property p
        WHERE (:district IS NULL OR LOWER(p.district) LIKE LOWER(CONCAT('%', :district, '%')))
          AND (:ward IS NULL OR LOWER(p.ward) LIKE LOWER(CONCAT('%', :ward, '%')))
          AND (:propertyType IS NULL OR p.propertyType = :propertyType)
          AND (:transactionType IS NULL OR p.transactionType = :transactionType)
          AND (:status IS NULL OR p.status = :status)
          AND (:minArea IS NULL OR p.areaSqm >= :minArea)
          AND (:maxArea IS NULL OR p.areaSqm <= :maxArea)
          AND (:minBedrooms IS NULL OR p.bedrooms >= :minBedrooms)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        ORDER BY p.updatedAt DESC
    """)
    Page<Property> findWithFilters(
        @Param("district") String district,
        @Param("ward") String ward,
        @Param("propertyType") PropertyType propertyType,
        @Param("transactionType") TransactionType transactionType,
        @Param("status") PropertyStatus status,
        @Param("minArea") BigDecimal minArea,
        @Param("maxArea") BigDecimal maxArea,
        @Param("minBedrooms") Integer minBedrooms,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );

    @Query("""
        SELECT p FROM Property p
        WHERE p.district = :district
          AND p.areaSqm BETWEEN :minArea AND :maxArea
          AND p.price BETWEEN :minPrice AND :maxPrice
          AND p.id != :excludeId
          AND p.status = 'AVAILABLE'
    """)
    List<Property> findPotentialDuplicates(
        @Param("district") String district,
        @Param("minArea") BigDecimal minArea,
        @Param("maxArea") BigDecimal maxArea,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("excludeId") Long excludeId
    );
}
