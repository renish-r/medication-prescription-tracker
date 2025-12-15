package com.medtracker.medication_tracker1.dto;

import lombok.Data;

@Data
public class PrescriptionRequest {

    private String patientUsername;  // which patient
    private String medicationName;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private String instructions;

    private String documentUrl; // optional PDF link for now
}
