package com.medtracker.medication_tracker1.dto;

import com.medtracker.medication_tracker1.model.Role;
import lombok.Data;

@Data
public class LoginRequest {
    private String usernameOrEmail;
    private String password;
    private Role role;   // ENUM, not String
}
