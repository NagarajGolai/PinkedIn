package com.pinkedin.post_service.service.impl;

import com.pinkedin.post_service.dto.request.CreatePostRequest;
import com.pinkedin.post_service.dto.request.UpdatePostRequest;
import com.pinkedin.post_service.dto.response.PostResponse;
import com.pinkedin.post_service.entity.Post;
import com.pinkedin.post_service.exception.ResourceNotFoundException;
import com.pinkedin.post_service.mapper.PostMapper;
import com.pinkedin.post_service.repository.PostRepository;
import com.pinkedin.post_service.service.interfaces.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;

    @Override
    public PostResponse createPost(Long userId, CreatePostRequest request) {
        Post post = PostMapper.toEntity(request, userId);
        return PostMapper.toResponse(postRepository.save(post));
    }

    @Override
    public PostResponse updatePost(Long userId, Long postId, UpdatePostRequest request) {
        Post post = findPost(postId);
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not your post");
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getMediaUrl() != null) {
            post.setMediaUrl(request.getMediaUrl());
        }
        post.setUpdatedAt(LocalDateTime.now());
        return PostMapper.toResponse(postRepository.save(post));
    }

    @Override
    public void deletePost(Long userId, Long postId) {
        Post post = findPost(postId);
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not your post");
        }
        postRepository.delete(post);
    }

    @Override
    public Page<PostResponse> getFeed(Pageable pageable) {
        return postRepository.findAllByDeletedFalseOrderByCreatedAtDesc(pageable).map(PostMapper::toResponse);
    }

    @Override
    public Page<PostResponse> getOwnPosts(Long userId, Pageable pageable) {
        return postRepository.findByUserIdAndDeletedFalse(userId, pageable).map(PostMapper::toResponse);
    }

    private Post findPost(Long postId) {
        return postRepository.findByIdAndDeletedFalse(postId);
    }
}
