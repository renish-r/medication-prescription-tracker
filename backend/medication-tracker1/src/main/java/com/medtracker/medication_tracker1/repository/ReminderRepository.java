package com.medtracker.medication_tracker1.repository;

import com.medtracker.medication_tracker1.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByActiveTrueAndScheduledAtBefore(LocalDateTime time);
    List<Reminder> findByPrescriptionId(Long prescriptionId);
}
