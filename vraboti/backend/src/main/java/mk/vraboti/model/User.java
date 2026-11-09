package mk.vraboti.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String phone;
    private String title;
    private String city;
    private String skills;

    @Column(length = 2000)
    private String about;

    private String company;

    private Boolean emailVerified;

    private String verificationCodeHash;
    private Instant verificationExpiresAt;
    private Integer verificationAttempts;
    private Instant verificationSentAt;

    public boolean isEmailConfirmed() {
        return !Boolean.FALSE.equals(emailVerified);
    }

    @ManyToMany
    @JoinTable(name = "saved_jobs",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "job_id"))
    private Set<Job> savedJobs = new HashSet<>();
}
