package mk.vraboti.service;

import mk.vraboti.dto.Dto.*;
import mk.vraboti.model.Role;
import mk.vraboti.model.User;
import mk.vraboti.repository.UserRepository;
import mk.vraboti.security.JwtService;
import mk.vraboti.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final VerificationService verification;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt, VerificationService verification) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.verification = verification;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        User u = users.findByEmailIgnoreCase(email).orElse(null);
        if (u != null && u.isEmailConfirmed()) {
            throw new ApiException(HttpStatus.CONFLICT, "Веќе постои профил со оваа е-пошта");
        }
        if (req.role() == Role.EMPLOYER && (req.company() == null || req.company().isBlank())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Внесете име на компанијата");
        }
        if (u == null) {
            u = new User();
            u.setEmail(email);
        }
        u.setFullName(req.fullName().trim());
        u.setPassword(encoder.encode(req.password()));
        u.setRole(req.role());
        u.setCompany(req.role() == Role.EMPLOYER ? req.company().trim() : null);
        u.setEmailVerified(false);
        users.save(u);
        verification.sendCode(u);
        return new RegisterResponse(u.getEmail(), true);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public AuthResponse login(LoginRequest req) {
        User u = users.findByEmailIgnoreCase(req.email().trim())
                .filter(x -> encoder.matches(req.password(), x.getPassword()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Погрешна е-пошта или лозинка"));
        if (!u.isEmailConfirmed()) {
            verification.sendCode(u);
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Е-поштата не е потврдена. Ви испративме код.", "EMAIL_NOT_VERIFIED");
        }
        return new AuthResponse(jwt.generate(u), UserDto.of(u));
    }

    @Transactional(noRollbackFor = ApiException.class)
    public AuthResponse verify(VerifyRequest req) {
        User u = users.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Кодот е погрешен или истечен.", "CODE_INVALID"));
        verification.verify(u, req.code());
        return new AuthResponse(jwt.generate(u), UserDto.of(u));
    }

    @Transactional
    public void resend(ResendRequest req) {
        users.findByEmailIgnoreCase(req.email().trim())
                .filter(u -> !u.isEmailConfirmed())
                .ifPresent(u -> {
                    if (!verification.sendCode(u)) {
                        throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                                "Почекајте една минута пред да побарате нов код.", "RESEND_TOO_SOON");
                    }
                });
    }

    @Transactional(readOnly = true)
    public User get(Long id) {
        return users.findById(id).orElseThrow(() -> ApiException.notFound("Корисникот"));
    }

    @Transactional
    public UserDto updateProfile(Long id, ProfileRequest req) {
        User u = get(id);
        if (!u.getEmail().equalsIgnoreCase(req.email()) && users.existsByEmailIgnoreCase(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Оваа е-пошта ја користи друг профил");
        }
        u.setFullName(req.fullName().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setPhone(req.phone());
        u.setTitle(req.title());
        u.setCity(req.city());
        u.setSkills(req.skills());
        u.setAbout(req.about());
        if (u.getRole() == Role.EMPLOYER && req.company() != null && !req.company().isBlank()) {
            u.setCompany(req.company().trim());
        }
        return UserDto.of(u);
    }
}
