package com.pinkedin.job_service.controller;

import com.pinkedin.job_service.dto.request.CreateJobRequest;
import com.pinkedin.job_service.dto.request.UpdateJobRequest;
import com.pinkedin.job_service.dto.response.JobResponse;
import com.pinkedin.job_service.service.interfaces.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/job")
@RequiredArgsConstructor
public class JobController {
    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody CreateJobRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(request));
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<JobResponse> updateJob(@PathVariable Long jobId, @Valid @RequestBody UpdateJobRequest request) {
        return ResponseEntity.ok(jobService.updateJob(jobId, request));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long jobId) {
        jobService.deleteJob(jobId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{jobId}/close")
    public ResponseEntity<JobResponse> closeJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.closeJob(jobId));
    }

    @PostMapping("/{jobId}/reopen")
    public ResponseEntity<JobResponse> reopenJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.reopenJob(jobId));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getJob(jobId));
    }

    @GetMapping
    public ResponseEntity<Page<JobResponse>> getAllJobs(Pageable pageable) {
        return ResponseEntity.ok(jobService.getAllJobs(pageable));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<Page<JobResponse>> getCompanyJobs(@PathVariable Long companyId, Pageable pageable) {
        return ResponseEntity.ok(jobService.getCompanyJobs(companyId, pageable));
    }
}
