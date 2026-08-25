package com.pinkedin.application_service.mapper;

import com.pinkedin.application_service.dto.request.ApplyRequest;
import com.pinkedin.application_service.dto.response.ApplicationResponse;
import com.pinkedin.application_service.entity.Application;

import java.time.LocalDateTime;

public class ApplicationMapper {
    public static Application toEntity(ApplyRequest request, Long userId) {
        return Application.builder()
                .jobId(request.getJobId())
                .userId(userId)
                .resumeUrl(request.getResumeUrl())
                .coverLetter(request.getCoverLetter())
                .status("APPLIED")
                .appliedDate(LocalDateTime.now())
                .build();
    }

    public static ApplicationResponse toResponse(Application application) {
        return ApplicationResponse.builder()
                .id(application.getId())
                .jobId(application.getJobId())
                .userId(application.getUserId())
                .resumeUrl(application.getResumeUrl())
                .coverLetter(application.getCoverLetter())
                .status(application.getStatus())
                .appliedDate(application.getAppliedDate())
                .build();
    }
}
