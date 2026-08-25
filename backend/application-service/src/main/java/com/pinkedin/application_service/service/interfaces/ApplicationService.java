package com.pinkedin.application_service.service.interfaces;

import com.pinkedin.application_service.dto.request.ApplyRequest;
import com.pinkedin.application_service.dto.request.RecruitmentUpdateRequest;
import com.pinkedin.application_service.dto.response.ApplicationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ApplicationService {
    ApplicationResponse apply(Long userId, ApplyRequest request);
    void withdraw(Long userId, Long applicationId);
    Page<ApplicationResponse> getMyApplications(Long userId, Pageable pageable);
    Page<ApplicationResponse> getApplicants(Long jobId, Pageable pageable);
    ApplicationResponse getApplicationDetails(Long applicationId);
    ApplicationResponse updateStatus(Long applicationId, RecruitmentUpdateRequest request);
}
