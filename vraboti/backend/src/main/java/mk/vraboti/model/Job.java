package mk.vraboti.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String category;

    private Integer salaryMin;
    private Integer salaryMax;

    @Column(length = 4000)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_requirements", joinColumns = @JoinColumn(name = "job_id"))
    @OrderColumn(name = "position")
    @Column(name = "requirement", length = 500)
    private List<String> requirements = new ArrayList<>();

    private boolean active = true;

    @Column(nullable = false)
    private Instant postedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employer_id")
    private User employer;
}
