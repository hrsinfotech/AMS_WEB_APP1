package com.hrsinfotech.hrstech.user;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String initials;
    private String name;
    private String employeeId;
    private String department;
    private String title;
    private String accessGroup;
    private String type;
    private String status;
    private String lastSeen;

    protected User() {
    }

    public User(String initials, String name, String employeeId, String department, String title,
                String accessGroup, String type, String status, String lastSeen) {
        this.initials = initials;
        this.name = name;
        this.employeeId = employeeId;
        this.department = department;
        this.title = title;
        this.accessGroup = accessGroup;
        this.type = type;
        this.status = status;
        this.lastSeen = lastSeen;
    }

    public Long getId() { return id; }
    public String getInitials() { return initials; }
    public String getName() { return name; }
    public String getEmployeeId() { return employeeId; }
    public String getDepartment() { return department; }
    public String getTitle() { return title; }
    public String getAccessGroup() { return accessGroup; }
    public String getType() { return type; }
    public String getStatus() { return status; }
    public String getLastSeen() { return lastSeen; }
    public void setStatus(String status) { this.status = status; }
}
