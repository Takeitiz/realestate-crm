package com.realestate.crm.repository;

import com.realestate.crm.entity.BuyerRequirement;
import com.realestate.crm.enums.PropertyType;
import com.realestate.crm.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface BuyerRequirementRepository extends JpaRepository<BuyerRequirement, Long> {

    List<BuyerRequirement> findByAgentIdOrderByCreatedAtDesc(Long agentId);

    List<BuyerRequirement> findByActiveTrue();

    @Query("""
        SELECT br FROM BuyerRequirement br
        WHERE br.active = true
          AND (:district IS NULL OR LOWER(br.targetDistrict) LIKE LOWER(CONCAT('%', :district, '%')))
          AND (:transactionType IS NULL OR br.transactionType = :transactionType)
          AND (:propertyType IS NULL OR br.propertyType = :propertyType)
          AND (br.maxPrice IS NULL OR br.maxPrice >= :price)
          AND (br.minBedrooms IS NULL OR br.minBedrooms <= :bedrooms)
          AND (br.minArea IS NULL OR br.minArea <= :area)
    """)
    List<BuyerRequirement> findMatchingRequirements(
        @Param("district") String district,
        @Param("transactionType") TransactionType transactionType,
        @Param("propertyType") PropertyType propertyType,
        @Param("price") BigDecimal price,
        @Param("bedrooms") Integer bedrooms,
        @Param("area") BigDecimal area
    );
}
