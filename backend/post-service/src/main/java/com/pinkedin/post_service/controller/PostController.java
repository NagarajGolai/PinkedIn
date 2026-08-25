package com.pinkedin.post_service.controller;

import com.pinkedin.post_service.dto.request.CreatePostRequest;
import com.pinkedin.post_service.dto.request.UpdatePostRequest;
import com.pinkedin.post_service.dto.response.PostResponse;
import com.pinkedin.post_service.service.interfaces.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/post")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@RequestHeader("X-User-Id") Long userId, @Valid @RequestBody CreatePostRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(userId, request));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(@RequestHeader("X-User-Id") Long userId, @PathVariable Long postId, @Valid @RequestBody UpdatePostRequest request) {
        return ResponseEntity.ok(postService.updatePost(userId, postId, request));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@RequestHeader("X-User-Id") Long userId, @PathVariable Long postId) {
        postService.deletePost(userId, postId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponse>> getFeed(Pageable pageable) {
        return ResponseEntity.ok(postService.getFeed(pageable));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<PostResponse>> getOwnPosts(@RequestHeader("X-User-Id") Long userId, Pageable pageable) {
        return ResponseEntity.ok(postService.getOwnPosts(userId, pageable));
    }
}
