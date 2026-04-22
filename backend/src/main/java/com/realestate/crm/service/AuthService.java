package com.realestate.crm.service;

import com.realestate.crm.dto.request.LoginRequest;
import com.realestate.crm.dto.request.RegisterRequest;
import com.realestate.crm.dto.response.AuthResponse;
import com.realestate.crm.entity.User;
import com.realestate.crm.repository.UserRepository;
import com.realestate.crm.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Used by Spring Security to load user from DB during authentication
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("Người dùng không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Sai mật khẩu");
        }
        if (!user.isEnabled()) {
            throw new BadCredentialsException("Tài khoản đã bị khóa");
        }

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
