package com.pinkedin.company_service.mapper;

import com.pinkedin.company_service.dto.request.CreateCompanyRequest;
import com.pinkedin.company_service.dto.response.CompanyResponse;
import com.pinkedin.company_service.entity.Company;

import java.time.LocalDateTime;

public class CompanyMapper {
    public static Company toEntity(CreateCompanyRequest request) {
        return Company.builder()
                .name(request.getName())
                .description(request.getDescription())
                .industry(request.getIndustry())
                .website(request.getWebsite())
                .companySize(request.getCompanySize())
                .location(request.getLocation())
                .ownerId(request.getOwnerId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public static CompanyResponse toResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .industry(company.getIndustry())
                .website(company.getWebsite())
                .companySize(company.getCompanySize())
                .location(company.getLocation())
                .ownerId(company.getOwnerId())
                .build();
    }
}
