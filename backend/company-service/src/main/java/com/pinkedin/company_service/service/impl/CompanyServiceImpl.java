package com.pinkedin.company_service.service.impl;

import com.pinkedin.company_service.client.UserClient;
import com.pinkedin.company_service.dto.request.CompanyLoginRequest;
import com.pinkedin.company_service.dto.request.CompanyMemberRequest;
import com.pinkedin.company_service.dto.request.CompanyRegisterRequest;
import com.pinkedin.company_service.dto.request.CreateCompanyRequest;
import com.pinkedin.company_service.dto.request.UpdateCompanyRequest;
import com.pinkedin.company_service.dto.request.UserLoginRequest;
import com.pinkedin.company_service.dto.request.UserRegisterRequest;
import com.pinkedin.company_service.dto.response.CompanyMemberResponse;
import com.pinkedin.company_service.dto.response.CompanyResponse;
import com.pinkedin.company_service.dto.response.UserProfileResponse;
import com.pinkedin.company_service.entity.Company;
import com.pinkedin.company_service.entity.CompanyMember;
import com.pinkedin.company_service.exception.ResourceNotFoundException;
import com.pinkedin.company_service.mapper.CompanyMapper;
import com.pinkedin.company_service.repository.CompanyMemberRepository;
import com.pinkedin.company_service.repository.CompanyRepository;
import com.pinkedin.company_service.service.interfaces.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {
    private final CompanyRepository companyRepository;
    private final CompanyMemberRepository companyMemberRepository;
    private final UserClient userClient;

    @Override
    public CompanyResponse createCompany(CreateCompanyRequest request) {
        Company company = CompanyMapper.toEntity(request);
        company.setCreatedAt(LocalDateTime.now());
        company.setUpdatedAt(LocalDateTime.now());
        Company savedCompany = companyRepository.save(company);

        CompanyMember ownerMember = CompanyMember.builder()
                .companyId(savedCompany.getId())
                .userId(request.getOwnerId())
                .role("OWNER")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        companyMemberRepository.save(ownerMember);

        return CompanyMapper.toResponse(savedCompany);
    }

    @Override
    public CompanyResponse registerCompany(CompanyRegisterRequest request) {
        UserRegisterRequest userRequest = UserRegisterRequest.builder()
                .name(request.getOwnerName())
                .email(request.getOwnerEmail())
                .password(request.getOwnerPassword())
                .headline(request.getOwnerHeadline())
                .location(request.getOwnerLocation())
                .build();

        UserProfileResponse user = userClient.registerUser(userRequest);

        CreateCompanyRequest companyRequest = CreateCompanyRequest.builder()
                .name(request.getName())
                .description(request.getDescription())
                .industry(request.getIndustry())
                .website(request.getWebsite())
                .companySize(request.getCompanySize())
                .location(request.getLocation())
                .ownerId(user.getId())
                .build();

        Company company = CompanyMapper.toEntity(companyRequest);
        company.setCreatedAt(LocalDateTime.now());
        company.setUpdatedAt(LocalDateTime.now());
        Company savedCompany = companyRepository.save(company);

        CompanyMember ownerMember = CompanyMember.builder()
                .companyId(savedCompany.getId())
                .userId(user.getId())
                .role("OWNER")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        companyMemberRepository.save(ownerMember);

        return CompanyMapper.toResponse(savedCompany);
    }

    @Override
    public CompanyResponse login(CompanyLoginRequest request) {
        UserProfileResponse user = userClient.login(new UserLoginRequest(request.getEmail(), request.getPassword()));
        Company company = companyRepository.findByOwnerIdAndDeletedFalse(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found for owner"));
        return CompanyMapper.toResponse(company);
    }

    @Override
    public CompanyResponse updateCompany(Long companyId, UpdateCompanyRequest request) {
        Company company = findCompany(companyId);
        if (request.getName() != null) company.setName(request.getName());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getCompanySize() != null) company.setCompanySize(request.getCompanySize());
        if (request.getLocation() != null) company.setLocation(request.getLocation());
        company.setUpdatedAt(LocalDateTime.now());
        return CompanyMapper.toResponse(companyRepository.save(company));
    }

    @Override
    public void deleteCompany(Long companyId) {
        Company company = findCompany(companyId);
        company.setDeleted(true);
        companyRepository.save(company);
    }

    @Override
    public CompanyResponse getCompany(Long companyId) {
        return CompanyMapper.toResponse(findCompany(companyId));
    }

    @Override
    public Page<CompanyResponse> getAllCompanies(Pageable pageable) {
        return companyRepository.findByDeletedFalse(pageable).map(CompanyMapper::toResponse);
    }

    @Override
    public Page<CompanyResponse> getCompaniesOwnedByUser(Long userId, Pageable pageable) {
        return companyRepository.findByOwnerIdAndDeletedFalse(userId, pageable).map(CompanyMapper::toResponse);
    }

    @Override
    public Page<CompanyResponse> searchCompanies(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return getAllCompanies(pageable);
        }
        return companyRepository.findByNameContainingIgnoreCaseAndDeletedFalse(keyword, pageable).map(CompanyMapper::toResponse);
    }

    @Override
    public CompanyMemberResponse addMember(Long companyId, CompanyMemberRequest request) {
        findCompany(companyId);
        if (companyMemberRepository.existsByCompanyIdAndUserIdAndDeletedFalse(companyId, request.getUserId())) {
            throw new IllegalArgumentException("User is already a member of the company");
        }

        CompanyMember member = CompanyMember.builder()
                .companyId(companyId)
                .userId(request.getUserId())
                .role(request.getRole() == null || request.getRole().isBlank() ? "MEMBER" : request.getRole())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CompanyMember savedMember = companyMemberRepository.save(member);
        return toMemberResponse(savedMember);
    }

    @Override
    public Page<CompanyMemberResponse> getMembers(Long companyId, Pageable pageable) {
        findCompany(companyId);
        return companyMemberRepository.findByCompanyIdAndDeletedFalse(companyId, pageable)
                .map(this::toMemberResponse);
    }

    @Override
    public void removeMember(Long companyId, Long userId) {
        CompanyMember member = companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company member not found"));
        member.setDeleted(true);
        member.setUpdatedAt(LocalDateTime.now());
        companyMemberRepository.save(member);
    }

    private CompanyMemberResponse toMemberResponse(CompanyMember member) {
        try {
            UserProfileResponse user = userClient.getUser(member.getUserId());
            return CompanyMemberResponse.builder()
                    .id(member.getId())
                    .companyId(member.getCompanyId())
                    .userId(member.getUserId())
                    .role(member.getRole())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .headline(user.getHeadline())
                    .location(user.getLocation())
                    .skills(user.getSkills())
                    .build();
        } catch (Exception e) {
            // If user lookup fails, return member with basic info
            return CompanyMemberResponse.builder()
                    .id(member.getId())
                    .companyId(member.getCompanyId())
                    .userId(member.getUserId())
                    .role(member.getRole())
                    .name("Unknown User")
                    .email("N/A")
                    .phone("N/A")
                    .headline("N/A")
                    .location("N/A")
                    .skills("N/A")
                    .build();
        }
    }

    private Company findCompany(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }
}
