package com.pinkedin.company_service.repository;

import com.pinkedin.company_service.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Page<Company> findByDeletedFalse(Pageable pageable);
    Page<Company> findByOwnerIdAndDeletedFalse(Long ownerId, Pageable pageable);
    Optional<Company> findByOwnerIdAndDeletedFalse(Long ownerId);
    Page<Company> findByNameContainingIgnoreCaseAndDeletedFalse(String name, Pageable pageable);
}
