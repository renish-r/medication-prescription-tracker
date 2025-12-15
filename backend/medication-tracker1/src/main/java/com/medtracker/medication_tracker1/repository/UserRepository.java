package com.medtracker.medication_tracker1.repository;

import com.medtracker.medication_tracker1.model.Role;
import com.medtracker.medication_tracker1.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);



    // NEW: list all patients for doctor dropdown
    List<User> findByRole(Role role);
}
