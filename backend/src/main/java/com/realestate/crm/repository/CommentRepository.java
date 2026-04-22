package com.realestate.crm.repository;

import com.realestate.crm.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);
}
