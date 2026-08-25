package com.pinkedin.application_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyRequest {
    @NotNull
    private Long jobId;

    private String resumeUrl;
    private String coverLetter;
}
