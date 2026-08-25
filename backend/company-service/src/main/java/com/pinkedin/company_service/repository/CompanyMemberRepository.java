package com.pinkedin.company_service.repository;

import com.pinkedin.company_service.entity.CompanyMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyMemberRepository extends JpaRepository<CompanyMember, Long> {
    Page<CompanyMember> findByCompanyIdAndDeletedFalse(Long companyId, Pageable pageable);
    Optional<CompanyMember> findByCompanyIdAndUserIdAndDeletedFalse(Long companyId, Long userId);
    boolean existsByCompanyIdAndUserIdAndDeletedFalse(Long companyId, Long userId);
}
