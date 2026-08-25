package com.pinkedin.application_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@SQLDelete(sql = "UPDATE applications SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long jobId;

    @Column(nullable = false)
    private Long userId;

    private String resumeUrl;
    private String coverLetter;

    @Column(nullable = false)
    private String status;

    private LocalDateTime appliedDate;

    @Column(nullable = false)
    private boolean deleted = false;
}
