package com.medtracker.medication_tracker1.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---- Who is involved ----
    @Column(nullable = false)
    private String patientUsername;   // link to User.username of PATIENT

    @Column(nullable = false)
    private String doctorUsername;    // link to User.username of DOCTOR

    // ---- Prescription details ----
    @Column(nullable = false)
    private String medicationName;

    @Column(nullable = false)
    private String dosage;            // e.g., "1 tablet"

    @Column(nullable = false)
    private String frequency;         // e.g., "Twice a day"

    @Column(nullable = false)
    private Integer durationDays;     // number of days

    @Column(length = 1000)
    private String instructions;      // doctor notes

    // Optional: if you decide to later support PDF file upload
    private String documentUrl;       // e.g., link/path to uploaded PDF

    // ---- Lifecycle ----
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrescriptionStatus status;    // PENDING / APPROVED / REJECTED / EXPIRED

    private LocalDate issueDate;
    private LocalDate expiryDate;

    // ---- Version / audit ----
    private Integer version;              // 1, 2, 3...

    @Column(name = "previous_prescription_id")
    private Long previousPrescriptionId;  // for renewals, if any
}
