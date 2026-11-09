package mk.vraboti.service;

import mk.vraboti.dto.Dto.*;
import mk.vraboti.model.*;
import mk.vraboti.repository.JobApplicationRepository;
import mk.vraboti.repository.JobRepository;
import mk.vraboti.repository.UserRepository;
import mk.vraboti.web.ApiException;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ApplicationService {
    private final JobApplicationRepository applications;
    private final JobRepository jobs;
    private final UserRepository users;
    private final JobService jobService;
    private final FileStorageService files;

    public ApplicationService(JobApplicationRepository applications, JobRepository jobs, UserRepository users,
                              JobService jobService, FileStorageService files) {
        this.applications = applications;
        this.jobs = jobs;
        this.users = users;
        this.jobService = jobService;
        this.files = files;
    }

    @Transactional
    public ApplicationDto apply(Long candidateId, Long jobId, String fullName, String email, String phone,
                                String coverLetter, MultipartFile cv) {
        User candidate = users.findById(candidateId).orElseThrow(() -> ApiException.notFound("Корисникот"));
        Job job = jobService.find(jobId);
        if (!job.isActive()) throw new ApiException(HttpStatus.BAD_REQUEST, "Огласот е затворен");
        if (applications.existsByJobAndCandidate(job, candidate)) {
            throw new ApiException(HttpStatus.CONFLICT, "Веќе аплициравте на овој оглас");
        }
        if (isBlank(fullName) || isBlank(email)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Внесете име и е-пошта");
        }
        if (isBlank(coverLetter) || coverLetter.trim().length() < 10) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Напишете барем една реченица во мотивационото писмо");
        }

        JobApplication a = new JobApplication();
        a.setJob(job);
        a.setCandidate(candidate);
        a.setFullName(fullName.trim());
        a.setEmail(email.trim());
        a.setPhone(phone);
        a.setCoverLetter(coverLetter.trim());
        if (cv != null && !cv.isEmpty()) {
            a.setCvStoredName(files.store(cv));
            a.setCvFileName(cv.getOriginalFilename());
        }
        applications.save(a);
        return ApplicationDto.of(a);
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> mine(Long candidateId) {
        User c = users.findById(candidateId).orElseThrow(() -> ApiException.notFound("Корисникот"));
        return applications.findByCandidateOrderByAppliedAtDesc(c).stream().map(ApplicationDto::of).toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> forEmployer(Long employerId, Long jobId, ApplicationStatus status) {
        return applications.findForEmployer(employer(employerId), jobId, status).stream()
                .map(ApplicationDto::of).toList();
    }

    @Transactional
    public ApplicationDto open(Long employerId, Long id) {
        JobApplication a = owned(employerId, id);
        if (a.getStatus() == ApplicationStatus.NEW) a.setStatus(ApplicationStatus.REVIEW);
        return ApplicationDto.of(a);
    }

    @Transactional
    public ApplicationDto setStatus(Long employerId, Long id, ApplicationStatus status) {
        JobApplication a = owned(employerId, id);
        a.setStatus(status);
        return ApplicationDto.of(a);
    }

    public record CvFile(Resource resource, String fileName) {}

    @Transactional(readOnly = true)
    public CvFile cv(Long employerId, Long id) {
        JobApplication a = owned(employerId, id);
        if (a.getCvStoredName() == null) throw ApiException.notFound("CV-то");
        return new CvFile(files.load(a.getCvStoredName()), a.getCvFileName());
    }

    @Transactional(readOnly = true)
    public StatsDto stats(Long employerId) {
        User e = employer(employerId);
        List<JobCount> perJob = jobs.findByEmployerOrderByPostedAtDesc(e).stream()
                .map(j -> new JobCount(j.getId(), j.getTitle(), applications.countByJob(j)))
                .filter(c -> c.count() > 0)
                .sorted((x, y) -> Long.compare(y.count(), x.count()))
                .limit(5).toList();
        List<ApplicationDto> recent = applications.findForEmployer(e, null, null).stream()
                .limit(5).map(ApplicationDto::of).toList();
        return new StatsDto(
                jobs.countByEmployerAndActiveTrue(e),
                applications.countByJobEmployer(e),
                applications.countByJobEmployerAndStatus(e, ApplicationStatus.NEW),
                applications.countByJobEmployerAndStatus(e, ApplicationStatus.INTERVIEW),
                perJob, recent);
    }

    private JobApplication owned(Long employerId, Long id) {
        JobApplication a = applications.findById(id).orElseThrow(() -> ApiException.notFound("Апликацијата"));
        if (!a.getJob().getEmployer().getId().equals(employerId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Оваа апликација не е за ваш оглас");
        }
        return a;
    }

    private User employer(Long id) {
        return users.findById(id).orElseThrow(() -> ApiException.notFound("Корисникот"));
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
