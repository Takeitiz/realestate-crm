package com.realestate.crm.dto.response;

public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private String role;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String fullName, String role) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final AuthResponse r = new AuthResponse();
        public Builder token(String t) { r.token = t; return this; }
        public Builder username(String u) { r.username = u; return this; }
        public Builder fullName(String f) { r.fullName = f; return this; }
        public Builder role(String ro) { r.role = ro; return this; }
        public AuthResponse build() { return r; }
    }
}
