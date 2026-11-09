package mk.vraboti.service;

import mk.vraboti.dto.Dto.JobDto;
import mk.vraboti.dto.Dto.JobRequest;
import mk.vraboti.model.Job;
import mk.vraboti.model.JobApplication;
import mk.vraboti.model.User;
import mk.vraboti.repository.JobApplicationRepository;
import mk.vraboti.repository.JobRepository;
import mk.vraboti.repository.UserRepository;
import mk.vraboti.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobService {
    private final JobRepository jobs;
    private final JobApplicationRepository applications;
    private final UserRepository users;
    private final FileStorageService files;

    public JobService(JobRepository jobs, JobApplicationRepository applications, UserRepository users,
                      FileStorageService files) {
        this.jobs = jobs;
        this.applications = applications;
        this.users = users;
        this.files = files;
    }

    @Transactional(readOnly = true)
    public List<JobDto> search(String q, String category, String location, String type) {
        return jobs.search(n(q), n(category), n(location), n(type)).stream()
                .map(j -> JobDto.of(j, null)).toList();
    }

    @Transactional(readOnly = true)
    public JobDto get(Long id) {
        Job j = find(id);
        if (!j.isActive()) throw ApiException.notFound("Огласот");
        return JobDto.of(j, null);
    }

    @Transactional(readOnly = true)
    public Set<Long> savedIds(Long userId) {
        return user(userId).getSavedJobs().stream().map(Job::getId).collect(Collectors.toSet());
    }

    @Transactional
    public Set<Long> save(Long userId, Long jobId, boolean saved) {
        User u = user(userId);
        Job j = find(jobId);
        if (saved) u.getSavedJobs().add(j);
        else u.getSavedJobs().remove(j);
        return u.getSavedJobs().stream().map(Job::getId).collect(Collectors.toSet());
    }

    @Transactional(readOnly = true)
    public List<JobDto> forEmployer(Long employerId) {
        return jobs.findByEmployerOrderByPostedAtDesc(user(employerId)).stream()
                .map(j -> JobDto.of(j, applications.countByJob(j))).toList();
    }

    @Transactional
    public JobDto create(Long employerId, JobRequest req) {
        validate(req);
        Job j = new Job();
        j.setEmployer(user(employerId));
        apply(j, req);
        jobs.save(j);
        return JobDto.of(j, 0L);
    }

    @Transactional
    public JobDto update(Long employerId, Long id, JobRequest req) {
        validate(req);
        Job j = owned(employerId, id);
        apply(j, req);
        return JobDto.of(j, applications.countByJob(j));
    }

    @Transactional
    public JobDto toggle(Long employerId, Long id) {
        Job j = owned(employerId, id);
        j.setActive(!j.isActive());
        return JobDto.of(j, applications.countByJob(j));
    }

    @Transactional
    public void delete(Long employerId, Long id) {
        Job j = owned(employerId, id);
        for (JobApplication a : applications.findByJob(j)) {
            files.delete(a.getCvStoredName());
            applications.delete(a);
        }
        for (User u : users.findBySavedJobsContains(j)) {
            u.getSavedJobs().remove(j);
        }
        jobs.delete(j);
    }

    Job find(Long id) {
        return jobs.findById(id).orElseThrow(() -> ApiException.notFound("Огласот"));
    }

    Job owned(Long employerId, Long id) {
        Job j = find(id);
        if (!j.getEmployer().getId().equals(employerId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Овој оглас не е ваш");
        }
        return j;
    }

    private User user(Long id) {
        return users.findById(id).orElseThrow(() -> ApiException.notFound("Корисникот"));
    }

    private static void validate(JobRequest r) {
        if (r.salaryMin() > r.salaryMax()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Платата „од“ не може да биде поголема од платата „до“");
        }
    }

    private static void apply(Job j, JobRequest r) {
        j.setTitle(r.title().trim());
        j.setCompany(r.company().trim());
        j.setLocation(r.location());
        j.setType(r.type());
        j.setCategory(r.category());
        j.setSalaryMin(r.salaryMin());
        j.setSalaryMax(r.salaryMax());
        j.setDescription(r.description().trim());
        List<String> reqs = r.requirements() == null ? List.of()
                : r.requirements().stream().map(String::trim).filter(s -> !s.isEmpty()).toList();
        j.setRequirements(new ArrayList<>(reqs));
    }

    private static String n(String s) {
        return s == null ? "" : s.trim();
    }
}
