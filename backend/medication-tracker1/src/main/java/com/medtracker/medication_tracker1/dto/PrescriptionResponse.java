package com.medtracker.medication_tracker1.dto;

import com.medtracker.medication_tracker1.model.PrescriptionStatus;
import lombok.*;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrescriptionResponse {

    private Long id;
    private String patientUsername;
    private String doctorUsername;

    private String medicationName;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private String instructions;
    private String documentUrl;

    private PrescriptionStatus status;
    private LocalDate issueDate;
    private LocalDate expiryDate;

    private Integer version;
    private Long previousPrescriptionId;
}
