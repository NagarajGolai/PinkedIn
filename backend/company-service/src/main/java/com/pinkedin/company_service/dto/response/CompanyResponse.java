package com.pinkedin.company_service.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResponse {
    private Long id;
    private String name;
    private String description;
    private String industry;
    private String website;
    private String companySize;
    private String location;
    private Long ownerId;
}
