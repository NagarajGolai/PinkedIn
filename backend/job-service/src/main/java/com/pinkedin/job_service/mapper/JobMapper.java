package com.pinkedin.job_service.mapper;

import com.pinkedin.job_service.dto.request.CreateJobRequest;
import com.pinkedin.job_service.dto.response.JobResponse;
import com.pinkedin.job_service.entity.Job;

import java.time.LocalDateTime;

public class JobMapper {
    public static Job toEntity(CreateJobRequest request) {
        return Job.builder()
                .companyId(request.getCompanyId())
                .title(request.getTitle())
                .description(request.getDescription())
                .salary(request.getSalary())
                .experience(request.getExperience())
                .employmentType(request.getEmploymentType())
                .skills(request.getSkills())
                .location(request.getLocation())
                .deadline(request.getDeadline())
                .openings(request.getOpenings())
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public static JobResponse toResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .companyId(job.getCompanyId())
                .title(job.getTitle())
                .description(job.getDescription())
                .salary(job.getSalary())
                .experience(job.getExperience())
                .employmentType(job.getEmploymentType())
                .skills(job.getSkills())
                .location(job.getLocation())
                .deadline(job.getDeadline())
                .openings(job.getOpenings())
                .status(job.getStatus())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
