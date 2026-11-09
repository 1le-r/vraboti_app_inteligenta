package mk.vraboti.config;

import mk.vraboti.model.*;
import mk.vraboti.repository.JobApplicationRepository;
import mk.vraboti.repository.JobRepository;
import mk.vraboti.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seed", havingValue = "true")
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository users;
    private final JobRepository jobs;
    private final JobApplicationRepository applications;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, JobRepository jobs, JobApplicationRepository applications,
                      PasswordEncoder encoder) {
        this.users = users;
        this.jobs = jobs;
        this.applications = applications;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) return;

        User employer = user("Ивана Ристовска", "hr@pixellab.mk", Role.EMPLOYER);
        employer.setCompany("Пиксел Лаб");
        users.save(employer);

        User elena = user("Елена Николовска", "elena@example.mk", Role.CANDIDATE);
        elena.setPhone("070 456 789");
        elena.setTitle("UI/UX дизајнер");
        elena.setCity("Скопје");
        elena.setSkills("Figma, Прототипирање, HTML/CSS, Корисничко истражување");
        elena.setAbout("Дизајнерка со 4 години искуство во веб и мобилни апликации.");
        users.save(elena);

        Job j1 = job(employer, "Frontend програмер (React)", "Пиксел Лаб", "Скопје", "Хибридно", "ИТ и софтвер", 70000, 95000, 1,
                "Бараме frontend програмер кој ќе гради кориснички интерфејси за наши клиенти од ЕУ. Работиш во мал тим со дизајнер и двајца backend инженери.",
                "Најмалку 2 години искуство со React и TypeScript", "Добро познавање на CSS и пристапност",
                "Англиски јазик на работно ниво", "Искуство со REST API");
        Job j2 = job(employer, "Сметководител", "Финанс Плус ДООЕЛ", "Битола", "Полно работно време", "Финансии", 42000, 52000, 3,
                "Водење на книговодство за портфолио од 30 мали и средни компании, подготовка на ДДВ пријави и завршни сметки.",
                "Лиценца за сметководител", "Познавање на македонските даночни прописи", "Педантност и одговорност");
        Job j3 = job(employer, "Дигитален маркетинг специјалист", "Брендвајз", "Скопје", "Полно работно време", "Маркетинг", 45000, 60000, 2,
                "Планирање и водење на кампањи на Meta и Google за домашни и регионални брендови. Мерење резултати и месечни извештаи до клиентите.",
                "Искуство со Meta Ads Manager и Google Ads", "Аналитичко размислување", "Креативност во пишување содржини");
        job(employer, "Рецепционер/ка во хотел", "Хотел Езерски Бисер", "Охрид", "Скратено работно време", "Угостителство", 28000, 34000, 5,
                "Прием и одјава на гости, резервации и комуникација со туристи во летната и зимската сезона.",
                "Англиски јазик, пожелно и германски", "Љубезност и сериозен пристап", "Работа во смени");
        Job j5 = job(employer, "UI/UX дизајнер", "Пиксел Лаб", "Далечински", "Хибридно", "Дизајн", 60000, 80000, 6,
                "Дизајн на веб и мобилни апликации од истражување до готов прототип во Figma.",
                "Портфолио со реални проекти", "Одлично познавање на Figma", "Искуство со корисничко тестирање");
        job(employer, "Возач Ц категорија", "Транслог Тетово", "Тетово", "Полно работно време", "Логистика", 38000, 45000, 8,
                "Дистрибуција на стока низ Македонија и регионот. Возило на компанијата, дневници и платен прекувремен труд.",
                "Возачка дозвола Ц категорија", "Тахограф картичка", "Најмалку 1 година искуство");
        Job j7 = job(employer, "Пракса: Junior Python програмер", "Датаворкс", "Скопје", "Пракса", "ИТ и софтвер", 20000, 25000, 10,
                "Тримесечна платена пракса во тимот за обработка на податоци со можност за вработување.",
                "Студент или свршен студент на ФИНКИ, ФЕИТ или сродно", "Основи на Python и SQL", "Желба за учење");
        Job j8 = job(employer, "Продажен претставник", "Нутримак", "Куманово", "Полно работно време", "Продажба", 35000, 50000, 14,
                "Теренска продажба на прехранбени производи кон маркети во североисточниот регион.",
                "Возачка дозвола Б категорија", "Комуникациски вештини", "Искуство во продажба е предност");
        j8.setActive(false);

        elena.getSavedJobs().add(j1);

        app(j1, candidate("Марија Стојановска", "marija.s@example.mk"), "070 123 456",
                "Работам 3 години како React програмерка во агенција и сакам да преминам во продуктна компанија.", ApplicationStatus.INTERVIEW, 1);
        app(j1, candidate("Бојан Трајков", "bojan.trajkov@example.mk"), "071 555 210",
                "Имам искуство со Vue и React, моментално довршувам проект за е-трговија.", ApplicationStatus.NEW, 0.3);
        app(j3, candidate("Ана Петровска", "ana.p@example.mk"), "075 889 001",
                "Водев кампањи за три локални брендови со вкупен буџет од над 20.000 евра.", ApplicationStatus.REVIEW, 1.5);
        app(j2, candidate("Горан Илиевски", "goran.ilievski@example.mk"), "078 300 444",
                "Лиценциран сметководител со 6 години искуство.", ApplicationStatus.NEW, 2);
        app(j5, elena, "070 456 789",
                "Дизајнирам дигитални производи веќе 4 години. Во прилог е линк до моето портфолио.", ApplicationStatus.REVIEW, 4);
        app(j7, candidate("Давид Јовановски", "david.j@example.mk"), "072 101 202",
                "Студент сум во трета година на ФИНКИ.", ApplicationStatus.REJECTED, 6);

        log.info("Креирани демо податоци. Работодавач: hr@pixellab.mk / demo1234, Кандидат: elena@example.mk / demo1234");
    }

    private User user(String name, String email, Role role) {
        User u = new User();
        u.setFullName(name);
        u.setEmail(email);
        u.setPassword(encoder.encode("demo1234"));
        u.setRole(role);
        u.setEmailVerified(true);
        return u;
    }

    private User candidate(String name, String email) {
        return users.save(user(name, email, Role.CANDIDATE));
    }

    private Job job(User employer, String title, String company, String location, String type, String category,
                    int min, int max, int daysAgo, String description, String... reqs) {
        Job j = new Job();
        j.setEmployer(employer);
        j.setTitle(title);
        j.setCompany(company);
        j.setLocation(location);
        j.setType(type);
        j.setCategory(category);
        j.setSalaryMin(min);
        j.setSalaryMax(max);
        j.setDescription(description);
        j.setRequirements(new ArrayList<>(List.of(reqs)));
        j.setPostedAt(Instant.now().minus(Duration.ofDays(daysAgo)));
        return jobs.save(j);
    }

    private void app(Job job, User c, String phone, String letter, ApplicationStatus status, double daysAgo) {
        JobApplication a = new JobApplication();
        a.setJob(job);
        a.setCandidate(c);
        a.setFullName(c.getFullName());
        a.setEmail(c.getEmail());
        a.setPhone(phone);
        a.setCoverLetter(letter);
        a.setStatus(status);
        a.setAppliedAt(Instant.now().minus(Duration.ofMinutes((long) (daysAgo * 24 * 60))));
        applications.save(a);
    }
}
