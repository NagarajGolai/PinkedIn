package com.pinkedin.user_service.service.impl;

import com.pinkedin.user_service.dto.request.LoginRequest;
import com.pinkedin.user_service.dto.request.ProfileUpdateRequest;
import com.pinkedin.user_service.dto.request.RegisterRequest;
import com.pinkedin.user_service.dto.response.UserProfileResponse;
import com.pinkedin.user_service.entity.UserProfile;
import com.pinkedin.user_service.exception.ResourceNotFoundException;
import com.pinkedin.user_service.mapper.UserMapper;
import com.pinkedin.user_service.repository.UserProfileRepository;
import com.pinkedin.user_service.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserProfileRepository userRepository;

    @Override
    public UserProfileResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        UserProfile user = UserMapper.toEntity(request);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return UserMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserProfileResponse login(LoginRequest request) {
        UserProfile user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return UserMapper.toResponse(user);
    }

    @Override
    public UserProfileResponse getProfile(Long userId) {
        return UserMapper.toResponse(findUser(userId));
    }

    @Override
    public UserProfileResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        UserProfile user = findUser(userId);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getHeadline() != null) user.setHeadline(request.getHeadline());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        user.setUpdatedAt(LocalDateTime.now());
        return UserMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void deleteProfile(Long userId) {
        UserProfile user = findUser(userId);
        user.setDeleted(true);
        userRepository.save(user);
    }

    private UserProfile findUser(Long userId) {
        return userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
