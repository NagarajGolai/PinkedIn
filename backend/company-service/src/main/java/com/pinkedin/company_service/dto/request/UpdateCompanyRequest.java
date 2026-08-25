package com.pinkedin.company_service.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCompanyRequest {
    private String name;
    private String description;
    private String industry;
    private String website;
    private String companySize;
    private String location;
}
