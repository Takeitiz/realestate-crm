package com.realestate.crm.repository;

import com.realestate.crm.entity.PropertyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyDocumentRepository extends JpaRepository<PropertyDocument, Long> {
    List<PropertyDocument> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);
}
