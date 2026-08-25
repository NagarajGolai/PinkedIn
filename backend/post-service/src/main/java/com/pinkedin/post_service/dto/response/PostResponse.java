package com.pinkedin.post_service.dto.response;

import com.pinkedin.post_service.entity.PostType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
    private Long id;
    private Long userId;
    private String content;
    private PostType postType;
    private String mediaUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
