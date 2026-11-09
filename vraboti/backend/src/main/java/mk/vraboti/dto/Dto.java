package mk.vraboti.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import mk.vraboti.model.*;

import java.time.Instant;
import java.util.List;

public final class Dto {
    private Dto() {}

    public record LoginRequest(
            @NotBlank(message = "Внесете е-пошта") @Email(message = "Невалидна е-пошта") String email,
            @NotBlank(message = "Внесете лозинка") String password) {}

    public record RegisterRequest(
            @NotBlank(message = "Внесете име и презиме") String fullName,
            @NotBlank(message = "Внесете е-пошта") @Email(message = "Невалидна е-пошта") String email,
            @NotBlank @Size(min = 6, message = "Лозинката мора да има најмалку 6 знаци") String password,
            @NotNull(message = "Изберете тип на профил") Role role,
            String company) {}

    public record AuthResponse(String token, UserDto user) {}

    public record RegisterResponse(String email, boolean verificationRequired) {}

    public record VerifyRequest(
            @NotBlank(message = "Внесете е-пошта") @Email(message = "Невалидна е-пошта") String email,
            @NotBlank(message = "Внесете го кодот") @Pattern(regexp = "\\d{6}", message = "Кодот има 6 цифри") String code) {}

    public record ResendRequest(
            @NotBlank(message = "Внесете е-пошта") @Email(message = "Невалидна е-пошта") String email) {}

    public record UserDto(Long id, String fullName, String email, Role role, String phone, String title,
                          String city, String skills, String about, String company) {
        public static UserDto of(User u) {
            return new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getPhone(), u.getTitle(),
                    u.getCity(), u.getSkills(), u.getAbout(), u.getCompany());
        }
    }

    public record ProfileRequest(
            @NotBlank(message = "Внесете име и презиме") String fullName,
            @NotBlank(message = "Внесете е-пошта") @Email(message = "Невалидна е-пошта") String email,
            String phone, String title, String city, String skills, String about, String company) {}

    public record JobRequest(
            @NotBlank(message = "Внесете наслов") String title,
            @NotBlank(message = "Внесете компанија") String company,
            @NotBlank(message = "Изберете локација") String location,
            @NotBlank(message = "Изберете тип на работа") String type,
            @NotBlank(message = "Изберете категорија") String category,
            @NotNull(message = "Внесете плата од") @PositiveOrZero Integer salaryMin,
            @NotNull(message = "Внесете плата до") @PositiveOrZero Integer salaryMax,
            @NotBlank(message = "Внесете опис") String description,
            List<String> requirements) {}

    public record JobDto(Long id, String title, String company, String location, String type, String category,
                         Integer salaryMin, Integer salaryMax, String description, List<String> requirements,
                         boolean active, Instant postedAt, Long applicationCount) {
        public static JobDto of(Job j, Long count) {
            return new JobDto(j.getId(), j.getTitle(), j.getCompany(), j.getLocation(), j.getType(), j.getCategory(),
                    j.getSalaryMin(), j.getSalaryMax(), j.getDescription(), List.copyOf(j.getRequirements()),
                    j.isActive(), j.getPostedAt(), count);
        }
    }

    public record ApplicationDto(Long id, Long jobId, String jobTitle, String company, String location,
                                 String fullName, String email, String phone, String coverLetter,
                                 String cvFileName, ApplicationStatus status, Instant appliedAt) {
        public static ApplicationDto of(JobApplication a) {
            Job j = a.getJob();
            return new ApplicationDto(a.getId(), j.getId(), j.getTitle(), j.getCompany(), j.getLocation(),
                    a.getFullName(), a.getEmail(), a.getPhone(), a.getCoverLetter(), a.getCvFileName(),
                    a.getStatus(), a.getAppliedAt());
        }
    }

    public record StatusRequest(@NotNull(message = "Изберете статус") ApplicationStatus status) {}

    public record JobCount(Long jobId, String title, long count) {}

    public record StatsDto(long activeJobs, long totalApplications, long newApplications, long interviews,
                           List<JobCount> perJob, List<ApplicationDto> recent) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ErrorResponse(String message, String code) {
        public ErrorResponse(String message) {
            this(message, null);
        }
    }
}
