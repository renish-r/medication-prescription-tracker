package com.medtracker.medication_tracker1.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TestRoleController {

    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public String patientArea() {
        return "Patient area - prescriptions & reminders";
    }

    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public String doctorArea() {
        return "Doctor area - approve & issue prescriptions";
    }

    @GetMapping("/pharmacist/me")
    @PreAuthorize("hasRole('PHARMACIST')")
    public String pharmacistArea() {
        return "Pharmacist area - handle stock & dispensing";
    }

    @GetMapping("/admin/me")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminArea() {
        return "Admin area - manage all roles";
    }
}
