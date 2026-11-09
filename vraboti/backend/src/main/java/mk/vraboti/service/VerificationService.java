package mk.vraboti.service;

import mk.vraboti.model.User;
import mk.vraboti.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

@Service
public class VerificationService {
    public static final Duration CODE_TTL = Duration.ofMinutes(10);
    public static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    public static final int MAX_ATTEMPTS = 5;

    private final SecureRandom random = new SecureRandom();
    private final PasswordEncoder encoder;
    private final MailService mail;

    public VerificationService(PasswordEncoder encoder, MailService mail) {
        this.encoder = encoder;
        this.mail = mail;
    }

    public boolean sendCode(User u) {
        Instant now = Instant.now();
        if (u.getVerificationSentAt() != null && u.getVerificationSentAt().plus(RESEND_COOLDOWN).isAfter(now)) {
            return false;
        }
        String code = String.format("%06d", random.nextInt(1_000_000));
        u.setVerificationCodeHash(encoder.encode(code));
        u.setVerificationExpiresAt(now.plus(CODE_TTL));
        u.setVerificationAttempts(0);
        u.setVerificationSentAt(now);
        mail.sendVerificationCode(u.getEmail(), u.getFullName(), code, CODE_TTL);
        return true;
    }

    public void verify(User u, String code) {
        if (u.isEmailConfirmed()) return;

        if (u.getVerificationCodeHash() == null || u.getVerificationExpiresAt() == null
                || u.getVerificationExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Кодот истече. Побарајте нов код.", "CODE_EXPIRED");
        }
        int attempts = u.getVerificationAttempts() == null ? 0 : u.getVerificationAttempts();
        if (attempts >= MAX_ATTEMPTS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Премногу погрешни обиди. Побарајте нов код.", "CODE_EXPIRED");
        }
        if (code == null || !encoder.matches(code.trim(), u.getVerificationCodeHash())) {
            u.setVerificationAttempts(attempts + 1);
            int left = MAX_ATTEMPTS - attempts - 1;
            throw new ApiException(HttpStatus.BAD_REQUEST, left > 0
                    ? "Погрешен код. Ви остануваат уште " + left + " обиди."
                    : "Погрешен код. Побарајте нов код.", left > 0 ? "CODE_INVALID" : "CODE_EXPIRED");
        }

        u.setEmailVerified(true);
        u.setVerificationCodeHash(null);
        u.setVerificationExpiresAt(null);
        u.setVerificationAttempts(null);
        u.setVerificationSentAt(null);
    }
}
