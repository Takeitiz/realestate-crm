package com.realestate.crm.repository;

import com.realestate.crm.entity.Appointment;
import com.realestate.crm.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByAgentIdOrderByScheduledAtDesc(Long agentId);
    List<Appointment> findAllByOrderByScheduledAtDesc();
    List<Appointment> findByPropertyIdOrderByScheduledAtDesc(Long propertyId);

    @Query("SELECT a FROM Appointment a WHERE a.status = :status AND a.scheduledAt BETWEEN :from AND :to")
    List<Appointment> findUpcoming(@Param("status") AppointmentStatus status,
                                   @Param("from") LocalDateTime from,
                                   @Param("to") LocalDateTime to);
}
