package com.hrsinfotech.hrstech.user;

import jakarta.validation.constraints.NotBlank;

public final class UserRequests {
    private UserRequests() {
    }

    public record CreateUser(
        @NotBlank String name,
        @NotBlank String department,
        @NotBlank String title,
        @NotBlank String type
    ) {
    }

    public record StatusUpdate(@NotBlank String status) {
    }
}
