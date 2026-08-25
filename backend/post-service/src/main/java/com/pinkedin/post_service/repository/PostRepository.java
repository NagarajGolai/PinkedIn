package com.pinkedin.post_service.repository;

import com.pinkedin.post_service.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);
    Page<Post> findAllByDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
    Post findByIdAndDeletedFalse(Long id);
}
