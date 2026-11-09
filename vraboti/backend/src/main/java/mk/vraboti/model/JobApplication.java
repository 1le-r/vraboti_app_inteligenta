package mk.vraboti.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "applications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "candidate_id"}))
@Getter
@Setter
@NoArgsConstructor
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id")
    private User candidate;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Column(length = 4000)
    private String coverLetter;

    private String cvFileName;

    private String cvStoredName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.NEW;

    @Column(nullable = false)
    private Instant appliedAt = Instant.now();
}
