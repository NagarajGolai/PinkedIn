package com.pinkedin.post_service.service.interfaces;

import com.pinkedin.post_service.dto.request.CreatePostRequest;
import com.pinkedin.post_service.dto.request.UpdatePostRequest;
import com.pinkedin.post_service.dto.response.PostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {
    PostResponse createPost(Long userId, CreatePostRequest request);
    PostResponse updatePost(Long userId, Long postId, UpdatePostRequest request);
    void deletePost(Long userId, Long postId);
    Page<PostResponse> getFeed(Pageable pageable);
    Page<PostResponse> getOwnPosts(Long userId, Pageable pageable);
}
