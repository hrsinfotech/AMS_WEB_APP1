package com.hrsinfotech.hrstech.camera;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CameraSeedData {
    @Bean
    CommandLineRunner seedCameras(CameraRepository cameras) {
        return args -> {
            if (cameras.count() > 0) return;
            cameras.save(new Camera("Canteen Entry", "CAM-CAN-01", "Canteen", "North Wing", "Door entry",
                "rtsp://camera.local/canteen-entry", "Online", "Enabled", "Green", true, ""));
            cameras.save(new Camera("Security South Door", "CAM-SEC-01", "Security", "South Wing", "Door entry",
                "rtsp://camera.local/security-south", "Degraded", "Enabled", "Yellow", true, ""));
            cameras.save(new Camera("Server Room East", "CAM-SRV-01", "Server", "Basement", "East corner",
                "rtsp://camera.local/server-east", "Offline", "Unavailable", "Red", true, ""));
            cameras.save(new Camera("Production North Door", "CAM-PRD-01", "Production", "East Annex", "Door entry",
                "rtsp://camera.local/production-north", "Online", "Enabled", "Green", true, ""));
        };
    }
}
