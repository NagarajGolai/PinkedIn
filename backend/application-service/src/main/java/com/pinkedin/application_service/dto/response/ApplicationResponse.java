package com.pinkedin.application_service.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private Long userId;
    private String resumeUrl;
    private String coverLetter;
    private String status;
    private LocalDateTime appliedDate;
}
