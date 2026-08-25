package com.pinkedin.post_service.mapper;

import com.pinkedin.post_service.dto.request.CreatePostRequest;
import com.pinkedin.post_service.dto.response.PostResponse;
import com.pinkedin.post_service.entity.Post;

import java.time.LocalDateTime;

public class PostMapper {
    public static Post toEntity(CreatePostRequest request, Long userId) {
        return Post.builder()
                .userId(userId)
                .content(request.getContent())
                .postType(request.getPostType())
                .mediaUrl(request.getMediaUrl())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public static PostResponse toResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUserId())
                .content(post.getContent())
                .postType(post.getPostType())
                .mediaUrl(post.getMediaUrl())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
