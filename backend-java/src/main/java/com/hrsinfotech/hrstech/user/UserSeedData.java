package com.hrsinfotech.hrstech.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserSeedData {
    @Bean
    CommandLineRunner seedUsers(UserRepository users) {
        return args -> {
            if (users.count() > 0) return;
            users.save(new User("AR", "Amaya Rao", "EMP-19321", "Facilities", "Facilities Manager", "Facilities — Standard", "Employee", "Active", "Today, 08:42"));
            users.save(new User("DO", "Daniel Osei", "EMP-18456", "IT Infrastructure", "Network Engineer", "IT — Server Rooms", "Employee", "Active", "Today, 08:31"));
            users.save(new User("MK", "Marta Kowalski", "EMP-19812", "HR", "HR Administrator", "HR — Standard", "Employee", "Active", "Today, 08:17"));
            users.save(new User("JB", "Jonas Berg", "CTR-20844", "Vendor — ACME MEP", "HVAC Contractor", "Contractor — Mechanical", "Contractor", "Active", "Yesterday, 16:20"));
            users.save(new User("FA", "Fatima Al-Sayed", "EMP-11023", "Security", "Security Operator", "Security — Full", "Employee", "Active", "Today, 07:55"));
            users.save(new User("SC", "Sophie Chen", "EMP-17704", "Finance", "Finance Controller", "Finance — Restricted", "Employee", "Suspended", "14 Mar 2025, 17:04"));
        };
    }
}
