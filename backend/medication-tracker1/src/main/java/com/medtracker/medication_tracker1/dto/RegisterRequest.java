package com.medtracker.medication_tracker1.dto;

import com.medtracker.medication_tracker1.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String username;
    private String email;
    private String password;
    private Role role;   // IMPORTANT: this is an ENUM, not String

    // optional profile fields
    private String medicalHistory;   // patient
    private String licenseNumber;    // doctor
    private String specialization;   // doctor
    private String shopName;         // pharmacist
    private String shopAddress;      // pharmacist
}
