package com.pinkedin.user_service.repository;

import com.pinkedin.user_service.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    boolean existsByEmailAndDeletedFalse(String email);
    Optional<UserProfile> findByEmailAndDeletedFalse(String email);
    Optional<UserProfile> findByIdAndDeletedFalse(Long id);
}
