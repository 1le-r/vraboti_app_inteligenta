package mk.vraboti.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import mk.vraboti.dto.Dto.ErrorResponse;
import mk.vraboti.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter, ObjectMapper mapper) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(c -> {})
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/verify", "/api/auth/resend", "/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs", "/api/jobs/*").permitAll()
                .requestMatchers("/api/admin/**").hasRole("EMPLOYER")
                .requestMatchers("/api/me/**", "/api/jobs/*/apply").hasRole("CANDIDATE")
                .anyRequest().authenticated())
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> write(res, 401, "Најавете се за да продолжите", mapper))
                .accessDeniedHandler((req, res, ex) -> write(res, 403, "Немате пристап до овој дел", mapper)))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private static void write(jakarta.servlet.http.HttpServletResponse res, int status, String msg, ObjectMapper mapper)
            throws java.io.IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        mapper.writeValue(res.getWriter(), new ErrorResponse(msg));
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") String origins) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Content-Disposition"));
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/api/**", cfg);
        return src;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
