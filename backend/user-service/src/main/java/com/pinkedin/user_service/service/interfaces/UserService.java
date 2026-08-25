package com.pinkedin.user_service.service.interfaces;

import com.pinkedin.user_service.dto.request.LoginRequest;
import com.pinkedin.user_service.dto.request.ProfileUpdateRequest;
import com.pinkedin.user_service.dto.request.RegisterRequest;
import com.pinkedin.user_service.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse register(RegisterRequest request);
    UserProfileResponse login(LoginRequest request);
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, ProfileUpdateRequest request);
    void deleteProfile(Long userId);
}
