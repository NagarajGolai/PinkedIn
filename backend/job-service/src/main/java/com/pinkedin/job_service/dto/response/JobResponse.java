package com.pinkedin.job_service.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {
    private Long id;
    private Long companyId;
    private String title;
    private String description;
    private String salary;
    private String experience;
    private String employmentType;
    private String skills;
    private String location;
    private LocalDate deadline;
    private Integer openings;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
