package com.medtracker.medication_tracker1.controller;

import com.medtracker.medication_tracker1.dto.PatientSummary;
import com.medtracker.medication_tracker1.model.Role;
import com.medtracker.medication_tracker1.model.User;
import com.medtracker.medication_tracker1.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorPatientController {

    private final UserRepository userRepo;

    public DoctorPatientController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PatientSummary>> getAllPatients() {
        List<User> patients = userRepo.findByRole(Role.PATIENT);

        List<PatientSummary> result = patients.stream()
                .map(u -> new PatientSummary(
                        u.getUsername(),
                        u.getFullName(),
                        u.getEmail()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
