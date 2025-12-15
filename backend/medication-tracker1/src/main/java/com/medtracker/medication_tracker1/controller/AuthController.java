package com.medtracker.medication_tracker1.controller;

import com.medtracker.medication_tracker1.dto.*;
import com.medtracker.medication_tracker1.model.Role;
import com.medtracker.medication_tracker1.model.User;
import com.medtracker.medication_tracker1.repository.UserRepository;
import com.medtracker.medication_tracker1.security.CustomUserDetails;
import com.medtracker.medication_tracker1.security.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // React URL
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepo,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authManager,
                          JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        Role role = (req.getRole() == null) ? Role.PATIENT : req.getRole();

        User user = User.builder()
                .fullName(req.getFullName())
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .medicalHistory(req.getMedicalHistory())
                .licenseNumber(req.getLicenseNumber())
                .specialization(req.getSpecialization())
                .shopName(req.getShopName())
                .shopAddress(req.getShopAddress())
                .build();

        userRepo.save(user);

        return ResponseEntity.ok("Registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getUsernameOrEmail(),
                        req.getPassword()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User user = userDetails.getUser();

        // If frontend sends role, verify it matches DB role
        if (req.getRole() != null && user.getRole() != req.getRole()) {
            return ResponseEntity.status(403).body("Role mismatch");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        return ResponseEntity.ok(
                new AuthResponse(token, user.getUsername(), user.getRole())
        );
    }
}
