package mk.vraboti.web;

import jakarta.validation.Valid;
import mk.vraboti.dto.Dto.*;
import mk.vraboti.security.CurrentUser;
import mk.vraboti.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest req) {
        return auth.register(req);
    }

    @PostMapping("/verify")
    public AuthResponse verify(@Valid @RequestBody VerifyRequest req) {
        return auth.verify(req);
    }

    @PostMapping("/resend")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resend(@Valid @RequestBody ResendRequest req) {
        auth.resend(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal CurrentUser me) {
        return UserDto.of(auth.get(me.id()));
    }

    @PutMapping("/me")
    public UserDto updateProfile(@AuthenticationPrincipal CurrentUser me, @Valid @RequestBody ProfileRequest req) {
        return auth.updateProfile(me.id(), req);
    }
}
