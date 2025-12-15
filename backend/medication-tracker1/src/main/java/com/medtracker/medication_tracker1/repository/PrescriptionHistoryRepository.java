package com.medtracker.medication_tracker1.repository;

import com.medtracker.medication_tracker1.model.PrescriptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionHistoryRepository extends JpaRepository<PrescriptionHistory, Long> {
    List<PrescriptionHistory> findByPrescriptionIdOrderByVersionNumberDesc(Long prescriptionId);
    Integer countByPrescriptionId(Long prescriptionId);
}
