package com.realestate.crm.repository;

import com.realestate.crm.entity.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {
    List<PropertyImage> findByPropertyIdOrderByDisplayOrderAsc(Long propertyId);
    void deleteByPropertyId(Long propertyId);
}
