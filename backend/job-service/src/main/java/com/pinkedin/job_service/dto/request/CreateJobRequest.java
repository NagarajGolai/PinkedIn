package com.pinkedin.job_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateJobRequest {
    @NotBlank
    private String title;

    private String description;
    private String salary;
    private String experience;
    private String employmentType;
    private String skills;
    private String location;
    private LocalDate deadline;

    @NotNull
    private Integer openings;

    @NotNull
    private Long companyId;
}
