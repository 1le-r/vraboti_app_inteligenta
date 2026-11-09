package mk.vraboti.web;

import mk.vraboti.dto.Dto.ApplicationDto;
import mk.vraboti.security.CurrentUser;
import mk.vraboti.service.ApplicationService;
import mk.vraboti.service.JobService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/me")
public class CandidateController {
    private final ApplicationService applications;
    private final JobService jobs;

    public CandidateController(ApplicationService applications, JobService jobs) {
        this.applications = applications;
        this.jobs = jobs;
    }

    @GetMapping("/applications")
    public List<ApplicationDto> myApplications(@AuthenticationPrincipal CurrentUser me) {
        return applications.mine(me.id());
    }

    @GetMapping("/saved")
    public Set<Long> saved(@AuthenticationPrincipal CurrentUser me) {
        return jobs.savedIds(me.id());
    }

    @PostMapping("/saved/{jobId}")
    public Set<Long> save(@AuthenticationPrincipal CurrentUser me, @PathVariable Long jobId) {
        return jobs.save(me.id(), jobId, true);
    }

    @DeleteMapping("/saved/{jobId}")
    public Set<Long> unsave(@AuthenticationPrincipal CurrentUser me, @PathVariable Long jobId) {
        return jobs.save(me.id(), jobId, false);
    }
}
