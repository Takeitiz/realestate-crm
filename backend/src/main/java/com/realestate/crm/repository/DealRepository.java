package com.realestate.crm.repository;

import com.realestate.crm.entity.Deal;
import com.realestate.crm.enums.DealStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface DealRepository extends JpaRepository<Deal, Long> {
    List<Deal> findAllByOrderByUpdatedAtDesc();
    List<Deal> findByAgentIdOrderByUpdatedAtDesc(Long agentId);
    List<Deal> findByPropertyIdOrderByUpdatedAtDesc(Long propertyId);
    List<Deal> findByStage(DealStage stage);

    @Query("SELECT d.stage as stage, COUNT(d) as cnt FROM Deal d GROUP BY d.stage")
    List<Object[]> countByStage();

    @Query("SELECT d.agent.fullName as agentName, COUNT(d) as totalDeals, " +
           "SUM(CASE WHEN d.stage = 'CLOSED' THEN 1 ELSE 0 END) as closedDeals " +
           "FROM Deal d GROUP BY d.agent.id, d.agent.fullName ORDER BY closedDeals DESC")
    List<Object[]> agentLeaderboard();
}
