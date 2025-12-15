package com.medtracker.medication_tracker1.service;

import com.medtracker.medication_tracker1.model.Prescription;
import com.medtracker.medication_tracker1.model.PrescriptionHistory;
import com.medtracker.medication_tracker1.repository.PrescriptionHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class PrescriptionHistoryService {

    private static final Logger log = LoggerFactory.getLogger(PrescriptionHistoryService.class);

    private final PrescriptionHistoryRepository historyRepo;

    public PrescriptionHistoryService(PrescriptionHistoryRepository historyRepo) {
        this.historyRepo = historyRepo;
    }

    /**
     * Save snapshot as next version. Runs in a REQUIRES_NEW transaction so history
     * persists even if the outer transaction rolls back.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public PrescriptionHistory snapshotFrom(Prescription p, String changedBy, String changeReason) {
        Integer currentCount = historyRepo.countByPrescriptionId(p.getId());
        int nextVersion = (currentCount == null ? 1 : currentCount + 1);

        PrescriptionHistory h = PrescriptionHistory.builder()
                .prescriptionId(p.getId())
                .versionNumber(nextVersion)
                .medicationName(p.getMedicationName())
                .dosage(p.getDosage())
                .frequency(p.getFrequency())
                .durationDays(p.getDurationDays())
                .instructions(p.getInstructions())
                .status(p.getStatus() == null ? "PENDING" : p.getStatus().name())
                .modifiedBy(changedBy)
                .modifiedAt(Instant.now())
                .changeReason(changeReason)
                .patientUsername(p.getPatientUsername())
                .doctorUsername(p.getDoctorUsername())
                .build();

        PrescriptionHistory saved = historyRepo.save(h);
        log.info("Snapshot saved: prescriptionId={} version={} by={}", p.getId(), nextVersion, changedBy);
        return saved;
    }

    public List<PrescriptionHistory> getHistory(Long prescriptionId) {
        return historyRepo.findByPrescriptionIdOrderByVersionNumberDesc(prescriptionId);
    }

    public PrescriptionHistory getVersion(Long historyId) {
        return historyRepo.findById(historyId).orElse(null);
    }
}
