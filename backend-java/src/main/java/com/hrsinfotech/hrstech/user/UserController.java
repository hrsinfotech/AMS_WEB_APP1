package com.hrsinfotech.hrstech.user;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping
    public List<User> list() {
        return users.findAll();
    }

    @PostMapping
    public User create(@Valid @RequestBody UserRequests.CreateUser request) {
        String initials = initialsFor(request.name());
        String prefix = request.type().equalsIgnoreCase("Contractor") ? "CTR" : "EMP";
        String employeeId = prefix + "-" + (21000 + users.count());
        return users.save(new User(initials, request.name().trim(), employeeId, request.department().trim(),
            request.title().trim(), request.department().trim() + " — Standard", request.type().trim(),
            "Active", "Not yet recorded"));
    }

    @PatchMapping("/{id}/status")
    public User updateStatus(@PathVariable Long id, @Valid @RequestBody UserRequests.StatusUpdate request) {
        if (!request.status().equals("Active") && !request.status().equals("Suspended")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be Active or Suspended");
        }
        User user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.setStatus(request.status());
        return users.save(user);
    }

    private static String initialsFor(String name) {
        String[] parts = name.trim().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (int index = 0; index < Math.min(parts.length, 2); index++) {
            initials.append(parts[index].charAt(0));
        }
        return initials.toString().toUpperCase();
    }
}
