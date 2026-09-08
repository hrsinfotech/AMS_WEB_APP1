package com.hrsinfotech.hrstech.camera;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/cameras")
public class CameraController {
    private final CameraRepository cameras;

    public CameraController(CameraRepository cameras) {
        this.cameras = cameras;
    }

    @GetMapping
    public List<Camera> list() {
        return cameras.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Camera create(@Valid @RequestBody CameraRequests.CameraPayload request) {
        return cameras.save(from(request));
    }

    @PutMapping("/{id}")
    public Camera update(@PathVariable Long id, @Valid @RequestBody CameraRequests.CameraPayload request) {
        Camera camera = cameras.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Camera not found"));
        camera.update(request.name().trim(), request.cameraCode().trim(), request.department().trim(),
            request.zone().trim(), request.placement().trim(), valueOrEmpty(request.streamUrl()),
            request.health().trim(), request.faceIdentification().trim(), request.alertSeverity().trim(),
            request.alertsEnabled(), valueOrEmpty(request.photoEvidenceUrl()));
        return cameras.save(camera);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!cameras.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Camera not found");
        }
        cameras.deleteById(id);
    }

    private static Camera from(CameraRequests.CameraPayload request) {
        return new Camera(request.name().trim(), request.cameraCode().trim(), request.department().trim(),
            request.zone().trim(), request.placement().trim(), valueOrEmpty(request.streamUrl()),
            request.health().trim(), request.faceIdentification().trim(), request.alertSeverity().trim(),
            request.alertsEnabled(), valueOrEmpty(request.photoEvidenceUrl()));
    }

    private static String valueOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
