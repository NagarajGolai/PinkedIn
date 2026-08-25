package com.pinkedin.company_service.service.interfaces;

import com.pinkedin.company_service.dto.request.CompanyLoginRequest;
import com.pinkedin.company_service.dto.request.CompanyMemberRequest;
import com.pinkedin.company_service.dto.request.CompanyRegisterRequest;
import com.pinkedin.company_service.dto.request.CreateCompanyRequest;
import com.pinkedin.company_service.dto.request.UpdateCompanyRequest;
import com.pinkedin.company_service.dto.response.CompanyMemberResponse;
import com.pinkedin.company_service.dto.response.CompanyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CompanyService {
    CompanyResponse registerCompany(CompanyRegisterRequest request);

    CompanyResponse createCompany(CreateCompanyRequest request);

    CompanyResponse login(CompanyLoginRequest request);

    CompanyResponse updateCompany(Long companyId, UpdateCompanyRequest request);

    void deleteCompany(Long companyId);

    CompanyResponse getCompany(Long companyId);

    Page<CompanyResponse> getAllCompanies(Pageable pageable);

    Page<CompanyResponse> getCompaniesOwnedByUser(Long userId, Pageable pageable);

    Page<CompanyResponse> searchCompanies(String keyword, Pageable pageable);

    CompanyMemberResponse addMember(Long companyId, CompanyMemberRequest request);

    Page<CompanyMemberResponse> getMembers(Long companyId, Pageable pageable);

    void removeMember(Long companyId, Long userId);
}
