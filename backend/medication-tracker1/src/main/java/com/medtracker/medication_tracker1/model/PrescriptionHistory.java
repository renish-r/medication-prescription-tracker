package com.medtracker.medication_tracker1.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "prescription_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link back to the main prescription
    private Long prescriptionId;

    private Integer versionNumber; // 1,2,3...

    private String medicationName;
    private String dosage;
    private String frequency;
    private Integer durationDays;

    @Column(length = 2000)
    private String instructions;

    private String status; // PENDING/APPROVED/REJECTED/EXPIRED

    private String modifiedBy; // doctor username
    private Instant modifiedAt;

    @Column(length = 1000)
    private String changeReason; // optional

    // Optional: snapshot of patient and doctor
    private String patientUsername;
    private String doctorUsername;
}
