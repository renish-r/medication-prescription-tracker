package com.medtracker.medication_tracker1.dto;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {

    private String fullName;
    private String email;

    // patient
    private String medicalHistory;

    // doctor
    private String licenseNumber;
    private String specialization;

    // pharmacist
    private String shopName;
    private String shopAddress;
}
