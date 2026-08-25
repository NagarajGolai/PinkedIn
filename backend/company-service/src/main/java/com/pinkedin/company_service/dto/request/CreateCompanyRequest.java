package com.pinkedin.company_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCompanyRequest {
    @NotBlank
    private String name;

    private String description;
    private String industry;
    private String website;
    private String companySize;
    private String location;

    @NotNull
    private Long ownerId;
}
