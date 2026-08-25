package com.pinkedin.company_service.client;

import com.pinkedin.company_service.dto.request.UserLoginRequest;
import com.pinkedin.company_service.dto.request.UserRegisterRequest;
import com.pinkedin.company_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service", path = "/user")
public interface UserClient {
    @GetMapping("/{userId}")
    UserProfileResponse getUser(@PathVariable("userId") Long userId);

    @PostMapping("/register")
    UserProfileResponse registerUser(@RequestBody UserRegisterRequest request);

    @PostMapping("/login")
    UserProfileResponse login(@RequestBody UserLoginRequest request);
}
