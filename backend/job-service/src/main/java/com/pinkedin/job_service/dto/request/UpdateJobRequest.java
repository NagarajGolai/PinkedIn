package com.pinkedin.job_service.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateJobRequest {
    private String title;
    private String description;
    private String salary;
    private String experience;
    private String employmentType;
    private String skills;
    private String location;
    private LocalDate deadline;
    private Integer openings;
}
