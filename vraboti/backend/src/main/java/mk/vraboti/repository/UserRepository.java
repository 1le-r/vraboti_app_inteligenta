package mk.vraboti.repository;

import mk.vraboti.model.Job;
import mk.vraboti.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findBySavedJobsContains(Job job);
}
