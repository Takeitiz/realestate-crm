package com.realestate.crm.repository;

import com.realestate.crm.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);
}
