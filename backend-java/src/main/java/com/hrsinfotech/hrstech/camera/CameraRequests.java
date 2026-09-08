package com.hrsinfotech.hrstech.camera;

import jakarta.validation.constraints.NotBlank;

public final class CameraRequests {
    private CameraRequests() {
    }

    public record CameraPayload(
        @NotBlank String name,
        @NotBlank String cameraCode,
        @NotBlank String department,
        @NotBlank String zone,
        @NotBlank String placement,
        String streamUrl,
        @NotBlank String health,
        @NotBlank String faceIdentification,
        @NotBlank String alertSeverity,
        boolean alertsEnabled,
        String photoEvidenceUrl
    ) {
    }
}
