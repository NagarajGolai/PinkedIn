package com.pinkedin.job_service.service.interfaces;

import com.pinkedin.job_service.dto.request.CreateJobRequest;
import com.pinkedin.job_service.dto.request.UpdateJobRequest;
import com.pinkedin.job_service.dto.response.JobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobService {
    JobResponse createJob(CreateJobRequest request);
    JobResponse updateJob(Long jobId, UpdateJobRequest request);
    void deleteJob(Long jobId);
    JobResponse closeJob(Long jobId);
    JobResponse reopenJob(Long jobId);
    JobResponse getJob(Long jobId);
    Page<JobResponse> getAllJobs(Pageable pageable);
    Page<JobResponse> getCompanyJobs(Long companyId, Pageable pageable);
}
