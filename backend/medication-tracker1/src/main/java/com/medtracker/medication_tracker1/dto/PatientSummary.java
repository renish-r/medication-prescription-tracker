package com.medtracker.medication_tracker1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PatientSummary {
    private String username;
    private String fullName;
    private String email;
}
