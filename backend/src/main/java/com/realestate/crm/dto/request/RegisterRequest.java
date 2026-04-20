package com.realestate.crm.dto.request;

import com.realestate.crm.enums.UserRole;

public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private UserRole role;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
}
