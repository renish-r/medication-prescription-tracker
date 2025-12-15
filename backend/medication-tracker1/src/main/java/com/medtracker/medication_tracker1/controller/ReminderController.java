package com.medtracker.medication_tracker1.controller;

import com.medtracker.medication_tracker1.model.Reminder;
import com.medtracker.medication_tracker1.service.ReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "http://localhost:3000")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> createReminder(@RequestBody Reminder r) {
        Reminder saved = reminderService.createOrUpdate(r);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/prescription/{prescId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> listForPrescription(@PathVariable Long prescId) {
        List<Reminder> list = reminderService.findByPrescription(prescId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/sendNow")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> sendNow(@PathVariable Long id) {
        Optional<Reminder> maybe = reminderService.findById(id);
        if (maybe.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Reminder r = maybe.get();
        reminderService.sendReminderNow(r);
        Map<String,String> resp = Map.of("message", "Sent");
        return ResponseEntity.ok(resp);
    }



    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> deleteReminder(@PathVariable Long id) {
        reminderService.delete(id);
        return ResponseEntity.ok().build();
    }
}
