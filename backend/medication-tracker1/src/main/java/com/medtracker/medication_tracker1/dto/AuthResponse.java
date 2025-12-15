package com.medtracker.medication_tracker1.dto;

import com.medtracker.medication_tracker1.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private Role role;
}
