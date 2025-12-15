package com.medtracker.medication_tracker1.controller;

import com.medtracker.medication_tracker1.model.Prescription;
import com.medtracker.medication_tracker1.model.PrescriptionHistory;
import com.medtracker.medication_tracker1.repository.PrescriptionRepository;
import com.medtracker.medication_tracker1.service.PrescriptionHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:3000")
public class PrescriptionHistoryController {

    private final PrescriptionHistoryService historyService;
    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionHistoryController(PrescriptionHistoryService historyService,
                                         PrescriptionRepository prescriptionRepository) {
        this.historyService = historyService;
        this.prescriptionRepository = prescriptionRepository;
    }

    // List history for a prescription
    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    public ResponseEntity<?> getHistory(@PathVariable("id") Long id) {
        // if patient: ensure owns it (enforced in service or controller if needed)
        List<PrescriptionHistory> list = historyService.getHistory(id);
        return ResponseEntity.ok(list);
    }

    // Get single version
    @GetMapping("/history/{historyId}")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    public ResponseEntity<?> getHistoryVersion(@PathVariable("historyId") Long historyId) {
        PrescriptionHistory h = historyService.getVersion(historyId);
        if (h == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(h);
    }

    // Renew (create a new version and optionally create a new prescription copy)
    @PostMapping("/{id}/renew")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> renewPrescription(@PathVariable("id") Long id,
                                               @RequestParam(value = "reason", required = false) String reason,
                                               @RequestParam(value = "durationDays", required = false) Integer durationDays) {
        Prescription p = prescriptionRepository.findById(id).orElse(null);
        if (p == null) return ResponseEntity.notFound().build();

        // snapshot current
        historyService.snapshotFrom(p, p.getDoctorUsername(), reason);

        // Create a new prescription row as "renewal"
        Prescription newP = new Prescription();
        newP.setDoctorUsername(p.getDoctorUsername());
        newP.setPatientUsername(p.getPatientUsername());
        newP.setMedicationName(p.getMedicationName());
        newP.setDosage(p.getDosage());
        newP.setFrequency(p.getFrequency());
        newP.setDurationDays(durationDays != null ? durationDays : p.getDurationDays());
        newP.setInstructions(p.getInstructions());
        newP.setStatus(p.getStatus()); // preserve status or set to PENDING
        newP.setPreviousPrescriptionId(p.getId());

        Prescription saved = prescriptionRepository.save(newP);

        // also create history snapshot for new
        historyService.snapshotFrom(saved, saved.getDoctorUsername(), "Renewal created");

        return ResponseEntity.ok(saved);
    }

    // Revert: make a new prescription copying an older version
    @PostMapping("/{id}/revert")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> revertToVersion(@PathVariable("id") Long id,
                                             @RequestParam("historyId") Long historyId,
                                             @RequestParam(value = "reason", required = false) String reason) {
        Prescription p = prescriptionRepository.findById(id).orElse(null);
        if (p == null) return ResponseEntity.notFound().build();

        PrescriptionHistory version = historyService.getVersion(historyId);
        if (version == null) return ResponseEntity.notFound().build();

        // create a new prescription row copying version content
        Prescription newP = new Prescription();
        newP.setDoctorUsername(version.getDoctorUsername());
        newP.setPatientUsername(version.getPatientUsername());
        newP.setMedicationName(version.getMedicationName());
        newP.setDosage(version.getDosage());
        newP.setFrequency(version.getFrequency());
        newP.setDurationDays(version.getDurationDays());
        newP.setInstructions(version.getInstructions());
        // set previous id
        newP.setPreviousPrescriptionId(p.getId());

        Prescription saved = prescriptionRepository.save(newP);
        historyService.snapshotFrom(saved, saved.getDoctorUsername(), reason == null ? "Reverted to version " + version.getVersionNumber() : reason);

        return ResponseEntity.ok(saved);
    }
}
