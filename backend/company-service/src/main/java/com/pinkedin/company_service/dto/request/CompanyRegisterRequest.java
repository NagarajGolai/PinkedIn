package com.pinkedin.company_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyRegisterRequest {
    @NotBlank
    private String name;

    private String description;
    private String industry;
    private String website;
    private String companySize;
    private String location;

    @NotBlank
    private String ownerName;

    @NotBlank
    @Email
    private String ownerEmail;

    @NotBlank
    private String ownerPassword;

    private String ownerHeadline;
    private String ownerLocation;
    private String ownerSkills;
}
