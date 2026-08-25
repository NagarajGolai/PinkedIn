package com.pinkedin.company_service.controller;

import com.pinkedin.company_service.dto.request.CompanyLoginRequest;
import com.pinkedin.company_service.dto.request.CompanyMemberRequest;
import com.pinkedin.company_service.dto.request.CompanyRegisterRequest;
import com.pinkedin.company_service.dto.request.CreateCompanyRequest;
import com.pinkedin.company_service.dto.request.UpdateCompanyRequest;
import com.pinkedin.company_service.dto.response.CompanyMemberResponse;
import com.pinkedin.company_service.dto.response.CompanyResponse;
import com.pinkedin.company_service.service.interfaces.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping("/register")
    public ResponseEntity<CompanyResponse> registerCompany(@Valid @RequestBody CompanyRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.registerCompany(request));
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.createCompany(request));
    }

    @PostMapping("/login")
    public ResponseEntity<CompanyResponse> login(@Valid @RequestBody CompanyLoginRequest request) {
        return ResponseEntity.ok(companyService.login(request));
    }

    @PutMapping("/{companyId}")
    public ResponseEntity<CompanyResponse> updateCompany(@PathVariable Long companyId, @Valid @RequestBody UpdateCompanyRequest request) {
        return ResponseEntity.ok(companyService.updateCompany(companyId, request));
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long companyId) {
        companyService.deleteCompany(companyId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyResponse> getCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(companyService.getCompany(companyId));
    }

    @GetMapping
    public ResponseEntity<Page<CompanyResponse>> getAllCompanies(Pageable pageable) {
        return ResponseEntity.ok(companyService.getAllCompanies(pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<CompanyResponse>> getCompaniesOwnedByUser(@PathVariable Long userId, Pageable pageable) {
        return ResponseEntity.ok(companyService.getCompaniesOwnedByUser(userId, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<CompanyResponse>> searchCompanies(@RequestParam(required = false) String keyword, Pageable pageable) {
        return ResponseEntity.ok(companyService.searchCompanies(keyword, pageable));
    }

    @PostMapping("/{companyId}/members")
    public ResponseEntity<CompanyMemberResponse> addMember(@PathVariable Long companyId, @Valid @RequestBody CompanyMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.addMember(companyId, request));
    }

    @GetMapping("/{companyId}/members")
    public ResponseEntity<Page<CompanyMemberResponse>> getMembers(@PathVariable Long companyId, Pageable pageable) {
        return ResponseEntity.ok(companyService.getMembers(companyId, pageable));
    }

    @DeleteMapping("/{companyId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long companyId, @PathVariable Long userId) {
        companyService.removeMember(companyId, userId);
        return ResponseEntity.noContent().build();
    }
}
