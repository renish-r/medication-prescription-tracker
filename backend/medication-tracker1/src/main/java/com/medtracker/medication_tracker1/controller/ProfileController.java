package com.medtracker.medication_tracker1.controller;

import com.medtracker.medication_tracker1.dto.UserProfileResponse;
import com.medtracker.medication_tracker1.dto.UserProfileUpdateRequest;
import com.medtracker.medication_tracker1.model.User;
import com.medtracker.medication_tracker1.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    private final UserRepository userRepo;

    public ProfileController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found for " + username));
    }

    private UserProfileResponse toResponse(User u) {
        return UserProfileResponse.builder()
                .fullName(u.getFullName())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole())
                .medicalHistory(u.getMedicalHistory())
                .licenseNumber(u.getLicenseNumber())
                .specialization(u.getSpecialization())
                .shopName(u.getShopName())
                .shopAddress(u.getShopAddress())
                .build();
    }

    // Any authenticated user (patient/doctor/pharmacist/admin) can view own profile
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        User u = getCurrentUser();
        return ResponseEntity.ok(toResponse(u));
    }

    // Update own profile (role-specific fields)
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @RequestBody UserProfileUpdateRequest req) {

        User u = getCurrentUser();

        if (req.getFullName() != null) {
            u.setFullName(req.getFullName());
        }
        if (req.getEmail() != null) {
            u.setEmail(req.getEmail());
        }

        // Patient fields
        if (req.getMedicalHistory() != null) {
            u.setMedicalHistory(req.getMedicalHistory());
        }

        // Doctor fields
        if (req.getLicenseNumber() != null) {
            u.setLicenseNumber(req.getLicenseNumber());
        }
        if (req.getSpecialization() != null) {
            u.setSpecialization(req.getSpecialization());
        }

        // Pharmacist fields
        if (req.getShopName() != null) {
            u.setShopName(req.getShopName());
        }
        if (req.getShopAddress() != null) {
            u.setShopAddress(req.getShopAddress());
        }

        User saved = userRepo.save(u);
        return ResponseEntity.ok(toResponse(saved));
    }
}
