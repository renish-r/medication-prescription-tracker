package com.medtracker.medication_tracker1.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // encrypted

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // ---- Profile fields for Milestone 1 ----

    // for patients
    @Column(length = 1000)
    private String medicalHistory;

    // for doctors
    private String licenseNumber;
    private String specialization;

    // for pharmacists
    private String shopName;
    private String shopAddress;
}
