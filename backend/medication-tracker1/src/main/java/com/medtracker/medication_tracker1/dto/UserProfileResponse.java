package com.medtracker.medication_tracker1.dto;

import com.medtracker.medication_tracker1.model.Role;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileResponse {

    private String fullName;
    private String username;
    private String email;
    private Role role;

    // patient
    private String medicalHistory;

    // doctor
    private String licenseNumber;
    private String specialization;

    // pharmacist
    private String shopName;
    private String shopAddress;
}
