package com.hrsinfotech.hrstech.camera;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cameras")
public class Camera {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String cameraCode;
    private String department;
    private String zone;
    private String placement;
    private String streamUrl;
    private String health;
    private String faceIdentification;
    private String alertSeverity;
    private boolean alertsEnabled;
    private String photoEvidenceUrl;

    protected Camera() {
    }

    public Camera(String name, String cameraCode, String department, String zone, String placement,
                  String streamUrl, String health, String faceIdentification, String alertSeverity,
                  boolean alertsEnabled, String photoEvidenceUrl) {
        this.name = name;
        this.cameraCode = cameraCode;
        this.department = department;
        this.zone = zone;
        this.placement = placement;
        this.streamUrl = streamUrl;
        this.health = health;
        this.faceIdentification = faceIdentification;
        this.alertSeverity = alertSeverity;
        this.alertsEnabled = alertsEnabled;
        this.photoEvidenceUrl = photoEvidenceUrl;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCameraCode() { return cameraCode; }
    public String getDepartment() { return department; }
    public String getZone() { return zone; }
    public String getPlacement() { return placement; }
    public String getStreamUrl() { return streamUrl; }
    public String getHealth() { return health; }
    public String getFaceIdentification() { return faceIdentification; }
    public String getAlertSeverity() { return alertSeverity; }
    public boolean isAlertsEnabled() { return alertsEnabled; }
    public String getPhotoEvidenceUrl() { return photoEvidenceUrl; }

    public void update(String name, String cameraCode, String department, String zone, String placement,
                       String streamUrl, String health, String faceIdentification, String alertSeverity,
                       boolean alertsEnabled, String photoEvidenceUrl) {
        this.name = name;
        this.cameraCode = cameraCode;
        this.department = department;
        this.zone = zone;
        this.placement = placement;
        this.streamUrl = streamUrl;
        this.health = health;
        this.faceIdentification = faceIdentification;
        this.alertSeverity = alertSeverity;
        this.alertsEnabled = alertsEnabled;
        this.photoEvidenceUrl = photoEvidenceUrl;
    }
}
