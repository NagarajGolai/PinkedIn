package com.pinkedin.post_service.dto.request;

import com.pinkedin.post_service.entity.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePostRequest {
    @NotBlank
    private String content;

    @NotNull
    private PostType postType;

    private String mediaUrl;
}
