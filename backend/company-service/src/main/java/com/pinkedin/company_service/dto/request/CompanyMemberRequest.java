package com.pinkedin.company_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyMemberRequest {
    @NotNull
    private Long userId;

    private String role;
}
