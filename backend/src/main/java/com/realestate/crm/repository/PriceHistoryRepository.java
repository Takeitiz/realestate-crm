package com.realestate.crm.repository;

import com.realestate.crm.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByPropertyIdOrderByChangedAtDesc(Long propertyId);
}
