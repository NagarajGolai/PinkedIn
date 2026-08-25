package com.pinkedin.job_service.service.impl;

import com.pinkedin.job_service.dto.request.CreateJobRequest;
import com.pinkedin.job_service.dto.request.UpdateJobRequest;
import com.pinkedin.job_service.dto.response.JobResponse;
import com.pinkedin.job_service.entity.Job;
import com.pinkedin.job_service.exception.ResourceNotFoundException;
import com.pinkedin.job_service.mapper.JobMapper;
import com.pinkedin.job_service.repository.JobRepository;
import com.pinkedin.job_service.service.interfaces.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {
    private final JobRepository jobRepository;

    @Override
    public JobResponse createJob(CreateJobRequest request) {
        Job job = JobMapper.toEntity(request);
        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    public JobResponse updateJob(Long jobId, UpdateJobRequest request) {
        Job job = findJob(jobId);
        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getSalary() != null) job.setSalary(request.getSalary());
        if (request.getExperience() != null) job.setExperience(request.getExperience());
        if (request.getEmploymentType() != null) job.setEmploymentType(request.getEmploymentType());
        if (request.getSkills() != null) job.setSkills(request.getSkills());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getDeadline() != null) job.setDeadline(request.getDeadline());
        if (request.getOpenings() != null) job.setOpenings(request.getOpenings());
        job.setUpdatedAt(LocalDateTime.now());
        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    public void deleteJob(Long jobId) {
        Job job = findJob(jobId);
        job.setDeleted(true);
        jobRepository.save(job);
    }

    @Override
    public JobResponse closeJob(Long jobId) {
        Job job = findJob(jobId);
        job.setStatus("CLOSED");
        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    public JobResponse reopenJob(Long jobId) {
        Job job = findJob(jobId);
        job.setStatus("OPEN");
        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    public JobResponse getJob(Long jobId) {
        return JobMapper.toResponse(findJob(jobId));
    }

    @Override
    public Page<JobResponse> getAllJobs(Pageable pageable) {
        return jobRepository.findByDeletedFalse(pageable).map(JobMapper::toResponse);
    }

    @Override
    public Page<JobResponse> getCompanyJobs(Long companyId, Pageable pageable) {
        return jobRepository.findByCompanyIdAndDeletedFalse(companyId, pageable).map(JobMapper::toResponse);
    }

    private Job findJob(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
    }
}
