package com.medtracker.medication_tracker1.controller;

import com.medtracker.medication_tracker1.model.Role;
import com.medtracker.medication_tracker1.model.User;
import com.medtracker.medication_tracker1.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // List all users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> listUsers() {
        List<User> users = userRepo.findAll();
        return ResponseEntity.ok(users);
    }

    // Get single user
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        Optional<User> u = userRepo.findById(id);
        return u.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create user (admin can create any role)
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
        // basic validation
        if (userRepo.existsByUsername(req.username())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepo.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User u = new User();
        u.setFullName(req.fullName());
        u.setUsername(req.username());
        u.setEmail(req.email());
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setRole(req.role() == null ? Role.PATIENT : req.role());
        // optional fields
        u.setMedicalHistory(req.medicalHistory());
        u.setLicenseNumber(req.licenseNumber());
        u.setSpecialization(req.specialization());
        u.setShopName(req.shopName());
        u.setShopAddress(req.shopAddress());

        userRepo.save(u);
        return ResponseEntity.ok(u);
    }

    // Update user (admin)
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        Optional<User> ou = userRepo.findById(id);
        if (ou.isEmpty()) return ResponseEntity.notFound().build();

        User u = ou.get();
        if (req.fullName() != null) u.setFullName(req.fullName());
        if (req.email() != null && !req.email().equals(u.getEmail())) {
            if (userRepo.existsByEmail(req.email())) return ResponseEntity.badRequest().body("Email exists");
            u.setEmail(req.email());
        }
        if (req.username() != null && !req.username().equals(u.getUsername())) {
            if (userRepo.existsByUsername(req.username())) return ResponseEntity.badRequest().body("Username exists");
            u.setUsername(req.username());
        }
        if (req.password() != null && !req.password().isBlank()) {
            u.setPassword(passwordEncoder.encode(req.password()));
        }
        if (req.role() != null) u.setRole(req.role());
        // optional fields
        u.setMedicalHistory(req.medicalHistory());
        u.setLicenseNumber(req.licenseNumber());
        u.setSpecialization(req.specialization());
        u.setShopName(req.shopName());
        u.setShopAddress(req.shopAddress());

        userRepo.save(u);
        return ResponseEntity.ok(u);
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepo.existsById(id)) return ResponseEntity.notFound().build();
        userRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Simple DTOs used by controller (records use accessor names like username(), email(), etc.)
    public static record CreateUserRequest(
            String fullName,
            String username,
            String email,
            String password,
            Role role,
            String medicalHistory,
            String licenseNumber,
            String specialization,
            String shopName,
            String shopAddress
    ) {}

    public static record UpdateUserRequest(
            String fullName,
            String username,
            String email,
            String password,
            Role role,
            String medicalHistory,
            String licenseNumber,
            String specialization,
            String shopName,
            String shopAddress
    ) {}
}
