package com.pinkedin.application_service.controller;

import com.pinkedin.application_service.dto.request.ApplyRequest;
import com.pinkedin.application_service.dto.request.RecruitmentUpdateRequest;
import com.pinkedin.application_service.dto.response.ApplicationResponse;
import com.pinkedin.application_service.service.interfaces.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/application")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(@RequestHeader("X-User-Id") Long userId, @Valid @RequestBody ApplyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.apply(userId, request));
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Void> withdraw(@RequestHeader("X-User-Id") Long userId, @PathVariable Long applicationId) {
        applicationService.withdraw(userId, applicationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(@RequestHeader("X-User-Id") Long userId, Pageable pageable) {
        return ResponseEntity.ok(applicationService.getMyApplications(userId, pageable));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<Page<ApplicationResponse>> getApplicants(@PathVariable Long jobId, Pageable pageable) {
        return ResponseEntity.ok(applicationService.getApplicants(jobId, pageable));
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplicationDetails(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.getApplicationDetails(applicationId));
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(@PathVariable Long applicationId, @Valid @RequestBody RecruitmentUpdateRequest request) {
        return ResponseEntity.ok(applicationService.updateStatus(applicationId, request));
    }
}
