package com.medtracker.medication_tracker1.repository;

import com.medtracker.medication_tracker1.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientUsernameOrderByIssueDateDesc(String patientUsername);

    List<Prescription> findByDoctorUsernameOrderByIssueDateDesc(String doctorUsername);
}
