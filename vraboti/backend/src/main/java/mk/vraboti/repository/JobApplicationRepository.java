package mk.vraboti.repository;

import mk.vraboti.model.ApplicationStatus;
import mk.vraboti.model.Job;
import mk.vraboti.model.JobApplication;
import mk.vraboti.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByCandidateOrderByAppliedAtDesc(User candidate);

    boolean existsByJobAndCandidate(Job job, User candidate);

    long countByJob(Job job);

    List<JobApplication> findByJob(Job job);

    @Query("""
            select a from JobApplication a
            where a.job.employer = :employer
              and (:jobId is null or a.job.id = :jobId)
              and (:status is null or a.status = :status)
            order by a.appliedAt desc
            """)
    List<JobApplication> findForEmployer(@Param("employer") User employer,
                                         @Param("jobId") Long jobId,
                                         @Param("status") ApplicationStatus status);

    long countByJobEmployer(User employer);

    long countByJobEmployerAndStatus(User employer, ApplicationStatus status);
}
