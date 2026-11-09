package mk.vraboti.web;

import mk.vraboti.dto.Dto.ApplicationDto;
import mk.vraboti.dto.Dto.JobDto;
import mk.vraboti.security.CurrentUser;
import mk.vraboti.service.ApplicationService;
import mk.vraboti.service.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobs;
    private final ApplicationService applications;

    public JobController(JobService jobs, ApplicationService applications) {
        this.jobs = jobs;
        this.applications = applications;
    }

    @GetMapping
    public List<JobDto> search(@RequestParam(required = false) String q,
                               @RequestParam(required = false) String category,
                               @RequestParam(required = false) String location,
                               @RequestParam(required = false) String type) {
        return jobs.search(q, category, location, type);
    }

    @GetMapping("/{id}")
    public JobDto get(@PathVariable Long id) {
        return jobs.get(id);
    }

    @PostMapping(value = "/{id}/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationDto apply(@AuthenticationPrincipal CurrentUser me,
                                @PathVariable Long id,
                                @RequestParam String fullName,
                                @RequestParam String email,
                                @RequestParam(required = false) String phone,
                                @RequestParam String coverLetter,
                                @RequestParam(required = false) MultipartFile cv) {
        return applications.apply(me.id(), id, fullName, email, phone, coverLetter, cv);
    }
}
