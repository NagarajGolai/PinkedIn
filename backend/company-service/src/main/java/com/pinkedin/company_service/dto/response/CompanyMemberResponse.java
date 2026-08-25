package com.pinkedin.company_service.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyMemberResponse {
    private Long id;
    private Long companyId;
    private Long userId;
    private String role;
    private String name;
    private String email;
    private String phone;
    private String headline;
    private String location;
    private String skills;
}
