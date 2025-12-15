package com.medtracker.medication_tracker1.controller;

import com.medtracker.medication_tracker1.dto.PrescriptionRequest;
import com.medtracker.medication_tracker1.dto.PrescriptionResponse;
import com.medtracker.medication_tracker1.model.Prescription;
import com.medtracker.medication_tracker1.model.PrescriptionStatus;
import com.medtracker.medication_tracker1.repository.PrescriptionRepository;
import com.medtracker.medication_tracker1.service.PrescriptionHistoryService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class PrescriptionController {

    private final PrescriptionRepository prescriptionRepo;
    private final PrescriptionHistoryService historyService;

    public PrescriptionController(PrescriptionRepository prescriptionRepo,
                                  PrescriptionHistoryService historyService) {
        this.prescriptionRepo = prescriptionRepo;
        this.historyService = historyService;
    }

    // ---- Helper to map entity -> response ----
    private PrescriptionResponse toResponse(Prescription p) {
        return PrescriptionResponse.builder()
                .id(p.getId())
                .patientUsername(p.getPatientUsername())
                .doctorUsername(p.getDoctorUsername())
                .medicationName(p.getMedicationName())
                .dosage(p.getDosage())
                .frequency(p.getFrequency())
                .durationDays(p.getDurationDays())
                .instructions(p.getInstructions())
                .documentUrl(p.getDocumentUrl())
                .status(p.getStatus())
                .issueDate(p.getIssueDate())
                .expiryDate(p.getExpiryDate())
                .version(p.getVersion())
                .previousPrescriptionId(p.getPreviousPrescriptionId())
                .build();
    }

    // ---------------- DOCTOR ENDPOINTS ----------------

    // Doctor issues a new prescription
    @PostMapping("/doctor/prescriptions")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @RequestBody PrescriptionRequest req) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorUsername = auth.getName();

        LocalDate issueDate = LocalDate.now();
        LocalDate expiryDate = issueDate.plusDays(
                (req.getDurationDays() != null && req.getDurationDays() > 0)
                        ? req.getDurationDays()
                        : 30 // default
        );

        Prescription p = Prescription.builder()
                .patientUsername(req.getPatientUsername())
                .doctorUsername(doctorUsername)
                .medicationName(req.getMedicationName())
                .dosage(req.getDosage())
                .frequency(req.getFrequency())
                .durationDays(req.getDurationDays())
                .instructions(req.getInstructions())
                .documentUrl(req.getDocumentUrl())
                .status(PrescriptionStatus.PENDING)   // initially pending
                .issueDate(issueDate)
                .expiryDate(expiryDate)
                .version(1)
                .build();

        Prescription saved = prescriptionRepo.save(p);

        // create history snapshot for the created prescription
        try {
            historyService.snapshotFrom(saved, doctorUsername, "Created via Doctor UI");
        } catch (Exception ex) {
            // Log only (do not fail the main flow) - ensure you have logging configured
            System.err.println("Failed to snapshot history on create: " + ex.getMessage());
        }

        return ResponseEntity.ok(toResponse(saved));
    }

    // Doctor views all prescriptions they have issued
    @GetMapping("/doctor/prescriptions")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PrescriptionResponse>> getDoctorPrescriptions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorUsername = auth.getName();

        List<Prescription> list =
                prescriptionRepo.findByDoctorUsernameOrderByIssueDateDesc(doctorUsername);

        return ResponseEntity.ok(
                list.stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    // Doctor approves a pending prescription
    @PutMapping("/doctor/prescriptions/{id}/approve")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> approvePrescription(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorUsername = auth.getName();

        return prescriptionRepo.findById(id)
                .map(p -> {
                    if (!p.getDoctorUsername().equals(doctorUsername)) {
                        return ResponseEntity.status(403).body("Not your prescription");
                    }
                    p.setStatus(PrescriptionStatus.APPROVED);
                    Prescription saved = prescriptionRepo.save(p);

                    // snapshot for approved state
                    try {
                        historyService.snapshotFrom(saved, doctorUsername, "Approved by doctor");
                    } catch (Exception ex) {
                        System.err.println("Failed to snapshot history on approve: " + ex.getMessage());
                    }

                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Doctor can mark as rejected
    @PutMapping("/doctor/prescriptions/{id}/reject")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> rejectPrescription(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorUsername = auth.getName();

        return prescriptionRepo.findById(id)
                .map(p -> {
                    if (!p.getDoctorUsername().equals(doctorUsername)) {
                        return ResponseEntity.status(403).body("Not your prescription");
                    }
                    p.setStatus(PrescriptionStatus.REJECTED);
                    Prescription saved = prescriptionRepo.save(p);

                    // snapshot for rejected state
                    try {
                        historyService.snapshotFrom(saved, doctorUsername, "Rejected by doctor");
                    } catch (Exception ex) {
                        System.err.println("Failed to snapshot history on reject: " + ex.getMessage());
                    }

                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Doctor renews a prescription (basic version control)
    @PostMapping("/doctor/prescriptions/{id}/renew")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> renewPrescription(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorUsername = auth.getName();

        return prescriptionRepo.findById(id)
                .map(old -> {
                    if (!old.getDoctorUsername().equals(doctorUsername)) {
                        return ResponseEntity.status(403).body("Not your prescription");
                    }

                    // snapshot the old prescription (capture current state) before creating renewal
                    try {
                        historyService.snapshotFrom(old, doctorUsername, "Snapshot before renewal");
                    } catch (Exception ex) {
                        System.err.println("Failed to snapshot history before renewal: " + ex.getMessage());
                    }

                    LocalDate newIssue = LocalDate.now();
                    LocalDate newExpiry = newIssue.plusDays(
                            old.getDurationDays() != null ? old.getDurationDays() : 30
                    );

                    Prescription renewed = Prescription.builder()
                            .patientUsername(old.getPatientUsername())
                            .doctorUsername(old.getDoctorUsername())
                            .medicationName(old.getMedicationName())
                            .dosage(old.getDosage())
                            .frequency(old.getFrequency())
                            .durationDays(old.getDurationDays())
                            .instructions(old.getInstructions())
                            .documentUrl(old.getDocumentUrl())
                            .status(PrescriptionStatus.APPROVED) // renewed & approved
                            .issueDate(newIssue)
                            .expiryDate(newExpiry)
                            .version((old.getVersion() == null ? 1 : old.getVersion() + 1))
                            .previousPrescriptionId(old.getId())
                            .build();

                    Prescription saved = prescriptionRepo.save(renewed);

                    // snapshot the renewed prescription
                    try {
                        historyService.snapshotFrom(saved, doctorUsername, "Renewal created");
                    } catch (Exception ex) {
                        System.err.println("Failed to snapshot history after renewal: " + ex.getMessage());
                    }

                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ---------------- PATIENT ENDPOINTS ----------------

    // Patient views their prescriptions (approved + pending etc.)
    @GetMapping("/patient/prescriptions")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PrescriptionResponse>> getPatientPrescriptions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String patientUsername = auth.getName();

        List<Prescription> list =
                prescriptionRepo.findByPatientUsernameOrderByIssueDateDesc(patientUsername);

        return ResponseEntity.ok(
                list.stream().map(this::toResponse).collect(Collectors.toList())
        );
    }
}
