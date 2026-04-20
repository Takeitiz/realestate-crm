package com.realestate.crm.service;

import com.realestate.crm.dto.request.LoginRequest;
import com.realestate.crm.dto.request.RegisterRequest;
import com.realestate.crm.dto.response.AuthResponse;
import com.realestate.crm.entity.User;
import com.realestate.crm.repository.UserRepository;
import com.realestate.crm.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(LoginRequest request) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        String token = jwtUtil.generateToken(user, user.getFullName(), user.getRole().name());
        return AuthResponse.builder()
            .token(token).username(user.getUsername())
            .fullName(user.getFullName()).role(user.getRole().name())
            .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        User user = User.builder()
            .username(request.getUsername())
            .password(passwordEncoder.encode(request.getPassword()))
            .fullName(request.getFullName())
            .role(request.getRole())
            .enabled(true)
            .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user, user.getFullName(), user.getRole().name());
        return AuthResponse.builder()
            .token(token).username(user.getUsername())
            .fullName(user.getFullName()).role(user.getRole().name())
            .build();
    }
}
