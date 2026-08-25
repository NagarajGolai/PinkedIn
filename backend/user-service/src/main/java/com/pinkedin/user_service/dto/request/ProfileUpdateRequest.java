package com.pinkedin.user_service.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateRequest {
    private String name;
    private String phone;
    private String headline;
    private String location;
    private String skills;
}
