package com.pinkedin.application_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruitmentUpdateRequest {
    @NotBlank
    private String status;
}
