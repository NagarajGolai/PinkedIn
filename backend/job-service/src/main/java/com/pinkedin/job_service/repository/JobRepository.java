package com.pinkedin.job_service.repository;

import com.pinkedin.job_service.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
    Page<Job> findByCompanyIdAndDeletedFalse(Long companyId, Pageable pageable);
    Page<Job> findByDeletedFalse(Pageable pageable);
}
