package mk.vraboti.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import mk.vraboti.web.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.io.UnsupportedEncodingException;
import java.time.Duration;

@Service
public class MailService {
    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String from;

    public MailService(ObjectProvider<JavaMailSender> mailSender,
                       @Value("${app.mail.from}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendVerificationCode(String to, String name, String code, Duration validFor) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.warn("""

                    ==================================================
                      SMTP не е поставен. Код за потврда:
                      {}  ->  {}
                    ==================================================""", to, code);
            return;
        }

        long minutes = validFor.toMinutes();
        String plain = """
                Здраво %s,

                Вашиот код за потврда на Вработи е: %s

                Кодот важи %d минути. Ако не сте се регистрирале вие, игнорирајте ја оваа порака.
                """.formatted(name, code, minutes);

        try {
            MimeMessage msg = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(from, "Вработи");
            helper.setTo(to);
            helper.setSubject(code + " е вашиот код за Вработи");
            helper.setText(plain, html(name, code, minutes));
            sender.send(msg);
            log.info("Испратен код за потврда до {}", to);
        } catch (MessagingException | UnsupportedEncodingException | MailException e) {
            log.error("Е-поштата до {} не е испратена", to, e);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Не успеавме да ја испратиме е-поштата. Обидете се повторно за една минута.");
        }
    }

    private static String html(String name, String code, long minutes) {
        return """
                <div style="background:#F3F5FA;padding:32px 16px;font-family:Segoe UI,Arial,sans-serif;color:#0F1729">
                  <div style="max-width:460px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
                    <div style="background:#1E36D6;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:700">
                      <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:8px;background:#FFB020;color:#1F1400;margin-right:8px">В</span>Вработи
                    </div>
                    <div style="padding:28px">
                      <p style="margin:0 0 12px;font-size:16px">Здраво %s,</p>
                      <p style="margin:0 0 20px;color:#5A6479">Внесете го овој код за да ја потврдите вашата е-пошта:</p>
                      <div style="font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;background:#E2E8FF;color:#1E36D6;border-radius:12px;padding:16px 0">%s</div>
                      <p style="margin:20px 0 0;color:#5A6479;font-size:13px">Кодот важи %d минути. Ако не сте се регистрирале вие, игнорирајте ја оваа порака.</p>
                    </div>
                  </div>
                </div>
                """.formatted(HtmlUtils.htmlEscape(name), code, minutes);
    }
}