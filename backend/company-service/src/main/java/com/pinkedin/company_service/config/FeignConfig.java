package com.pinkedin.company_service.config;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableFeignClients(basePackages = "com.pinkedin.company_service.client")
public class FeignConfig {
}
