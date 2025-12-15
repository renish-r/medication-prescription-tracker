package com.medtracker.medication_tracker1.service;

import com.medtracker.medication_tracker1.model.User;
import com.medtracker.medication_tracker1.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return userRepo.findByUsername(usernameOrEmail)
                .or(() -> userRepo.findByEmail(usernameOrEmail));
    }

    public User save(User user) {
        return userRepo.save(user);
    }
}
