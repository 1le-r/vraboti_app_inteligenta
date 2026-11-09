package mk.vraboti.web;

import jakarta.validation.Valid;
import mk.vraboti.dto.Dto.*;
import mk.vraboti.model.ApplicationStatus;
import mk.vraboti.security.CurrentUser;
import mk.vraboti.service.ApplicationService;
import mk.vraboti.service.JobService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final JobService jobs;
    private final ApplicationService applications;

    public AdminController(JobService jobs, ApplicationService applications) {
        this.jobs = jobs;
        this.applications = applications;
    }

    @GetMapping("/stats")
    public StatsDto stats(@AuthenticationPrincipal CurrentUser me) {
        return applications.stats(me.id());
    }

    @GetMapping("/jobs")
    public List<JobDto> myJobs(@AuthenticationPrincipal CurrentUser me) {
        return jobs.forEmployer(me.id());
    }

    @PostMapping("/jobs")
    @ResponseStatus(HttpStatus.CREATED)
    public JobDto create(@AuthenticationPrincipal CurrentUser me, @Valid @RequestBody JobRequest req) {
        return jobs.create(me.id(), req);
    }

    @PutMapping("/jobs/{id}")
    public JobDto update(@AuthenticationPrincipal CurrentUser me, @PathVariable Long id,
                         @Valid @RequestBody JobRequest req) {
        return jobs.update(me.id(), id, req);
    }

    @PatchMapping("/jobs/{id}/toggle")
    public JobDto toggle(@AuthenticationPrincipal CurrentUser me, @PathVariable Long id) {
        return jobs.toggle(me.id(), id);
    }

    @DeleteMapping("/jobs/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal CurrentUser me, @PathVariable Long id) {
        jobs.delete(me.id(), id);
    }

    @GetMapping("/applications")
    public List<ApplicationDto> applications(@AuthenticationPrincipal CurrentUser me,
                                             @RequestParam(required = false) Long jobId,
                                             @RequestParam(required = false) ApplicationStatus status) {
        return applications.forEmployer(me.id(), jobId, status);
    }

    @GetMapping("/applications/{id}")
    public ApplicationDto open(@AuthenticationPrincipal CurrentUser me, @PathVariable Long id) {
        return applications.open(me.id(), id);
    }

    @PatchMapping("/applications/{id}/status")
    public ApplicationDto status(@AuthenticationPrincipal CurrentUser me, @PathVariable Long id,
                                 @Valid @RequestBody StatusRequest req) {
        return applications.setStatus(me.id(), id, req.status());
    }

    @GetMapping("/applications/{id}/cv")
    public ResponseEntity<Resource> cv(@AuthenticationPrincipal CurrentUser me, @PathVariable Long id) {
        var cv = applications.cv(me.id(), id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(cv.fileName(), StandardCharsets.UTF_8).build().toString())
                .body(cv.resource());
    }
}
