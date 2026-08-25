package com.pinkedin.application_service.service.impl;

import com.pinkedin.application_service.dto.request.ApplyRequest;
import com.pinkedin.application_service.dto.request.RecruitmentUpdateRequest;
import com.pinkedin.application_service.dto.response.ApplicationResponse;
import com.pinkedin.application_service.entity.Application;
import com.pinkedin.application_service.exception.ResourceNotFoundException;
import com.pinkedin.application_service.mapper.ApplicationMapper;
import com.pinkedin.application_service.repository.ApplicationRepository;
import com.pinkedin.application_service.service.interfaces.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {
    private final ApplicationRepository applicationRepository;

    @Override
    public ApplicationResponse apply(Long userId, ApplyRequest request) {
        if (applicationRepository.existsByJobIdAndUserIdAndDeletedFalse(request.getJobId(), userId)) {
            throw new IllegalArgumentException("Application already exists");
        }
        return ApplicationMapper.toResponse(applicationRepository.save(ApplicationMapper.toEntity(request, userId)));
    }

    @Override
    public void withdraw(Long userId, Long applicationId) {
        Application application = findApplication(applicationId);
        if (!application.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not your application");
        }
        application.setStatus("WITHDRAWN");
        applicationRepository.save(application);
    }

    @Override
    public Page<ApplicationResponse> getMyApplications(Long userId, Pageable pageable) {
        return applicationRepository.findByUserIdAndDeletedFalse(userId, pageable).map(ApplicationMapper::toResponse);
    }

    @Override
    public Page<ApplicationResponse> getApplicants(Long jobId, Pageable pageable) {
        return applicationRepository.findByJobIdAndDeletedFalse(jobId, pageable).map(ApplicationMapper::toResponse);
    }

    @Override
    public ApplicationResponse getApplicationDetails(Long applicationId) {
        return ApplicationMapper.toResponse(findApplication(applicationId));
    }

    @Override
    public ApplicationResponse updateStatus(Long applicationId, RecruitmentUpdateRequest request) {
        Application application = findApplication(applicationId);
        application.setStatus(request.getStatus());
        return ApplicationMapper.toResponse(applicationRepository.save(application));
    }

    private Application findApplication(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }
}
