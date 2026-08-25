package com.pinkedin.user_service.mapper;

import com.pinkedin.user_service.dto.request.RegisterRequest;
import com.pinkedin.user_service.dto.response.UserProfileResponse;
import com.pinkedin.user_service.entity.UserProfile;

import java.time.LocalDateTime;

public class UserMapper {
    public static UserProfile toEntity(RegisterRequest request) {
        return UserProfile.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phone(request.getPhone())
                .headline(request.getHeadline())
                .location(request.getLocation())
                .skills(request.getSkills())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public static UserProfileResponse toResponse(UserProfile user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .headline(user.getHeadline())
                .location(user.getLocation())
                .skills(user.getSkills())
                .build();
    }
}
