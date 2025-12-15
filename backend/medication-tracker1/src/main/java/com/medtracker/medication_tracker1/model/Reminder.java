package com.medtracker.medication_tracker1.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long prescriptionId; // FK to prescription.id

    private String patientUsername; // owner username

    private String patientEmail; // where to send

    // scheduled time in server timezone (ISO date-time)
    private LocalDateTime scheduledAt;

    // optional recurrence in minutes (0 = one-time)
    private Integer recurrenceMinutes;

    private Boolean active;

    private Instant createdAt;
    private Instant lastSentAt;
}
