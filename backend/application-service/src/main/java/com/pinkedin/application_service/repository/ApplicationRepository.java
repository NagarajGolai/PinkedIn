package com.pinkedin.application_service.repository;

import com.pinkedin.application_service.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByJobIdAndUserIdAndDeletedFalse(Long jobId, Long userId);
    Page<Application> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);
    Page<Application> findByJobIdAndDeletedFalse(Long jobId, Pageable pageable);
}
