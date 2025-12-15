package com.medtracker.medication_tracker1.service;

import com.medtracker.medication_tracker1.model.Reminder;
import com.medtracker.medication_tracker1.repository.ReminderRepository;
import com.medtracker.medication_tracker1.repository.PrescriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Service
public class ReminderService {
    private static final Logger log = LoggerFactory.getLogger(ReminderService.class);

    private final ReminderRepository reminderRepo;
    private final JavaMailSender mailSender;
    private final PrescriptionRepository prescriptionRepo;
    // inside ReminderService class
    public Optional<Reminder> findById(Long id) {
        return reminderRepo.findById(id);
    }
    public ReminderService(ReminderRepository reminderRepo,
                           JavaMailSender mailSender,
                           PrescriptionRepository prescriptionRepo) {
        this.reminderRepo = reminderRepo;
        this.mailSender = mailSender;
        this.prescriptionRepo = prescriptionRepo;
    }

    public Reminder createOrUpdate(Reminder r) {
        if (r.getActive() == null) r.setActive(true);
        if (r.getCreatedAt() == null) r.setCreatedAt(Instant.now());
        return reminderRepo.save(r);
    }

    public List<Reminder> findByPrescription(Long prescriptionId) {
        return reminderRepo.findByPrescriptionId(prescriptionId);
    }

    public void delete(Long id) {
        reminderRepo.deleteById(id);
    }

    // Manual trigger endpoint can call this too
    @Transactional
    public void sendReminderNow(Reminder r) {
        try {
            // Prepare email
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(r.getPatientEmail());
            msg.setSubject("Medication Reminder");
            // simple body — you can enrich with prescription details
            msg.setText(buildEmailBody(r));
            mailSender.send(msg);

            r.setLastSentAt(Instant.now());
            // For recurring reminders, compute next scheduledAt outside this method or use recurrenceMinutes
            reminderRepo.save(r);
            log.info("Reminder email sent to {} for prescription {}", r.getPatientEmail(), r.getPrescriptionId());
        } catch (Exception ex) {
            log.error("Failed to send reminder email", ex);
        }
    }

    private String buildEmailBody(Reminder r) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(r.getPatientUsername()).append(",\n\n");
        sb.append("This is a reminder to take your medication for prescription id: ").append(r.getPrescriptionId()).append(".\n");
        sb.append("Scheduled at: ").append(r.getScheduledAt()).append("\n\n");
        sb.append("If you've already taken it, you can ignore this message.\n\n");
        sb.append("Regards,\nOnline Medication Tracker");
        return sb.toString();
    }

    // Scheduled job runs every minute and sends due reminders
    @Scheduled(cron = "0 * * * * *") // every minute at second 0
    public void processDueReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<Reminder> due = reminderRepo.findByActiveTrueAndScheduledAtBefore(now);
        for (Reminder r : due) {
            sendReminderNow(r);
            // Update next run if recurrence specified
            if (r.getRecurrenceMinutes() != null && r.getRecurrenceMinutes() > 0) {
                r.setScheduledAt(r.getScheduledAt().plusMinutes(r.getRecurrenceMinutes()));
                r.setLastSentAt(Instant.now());
                reminderRepo.save(r);
            } else {
                // one-time: deactivate
                r.setActive(false);
                r.setLastSentAt(Instant.now());
                reminderRepo.save(r);
            }
        }
    }
}
