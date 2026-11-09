package mk.vraboti.repository;

import mk.vraboti.model.Job;
import mk.vraboti.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    @Query("""
            select j from Job j
            where j.active = true
              and (:q = '' or lower(j.title) like lower(concat('%', :q, '%'))
                           or lower(j.company) like lower(concat('%', :q, '%'))
                           or lower(j.description) like lower(concat('%', :q, '%')))
              and (:category = '' or j.category = :category)
              and (:location = '' or j.location = :location)
              and (:type = '' or j.type = :type)
            order by j.postedAt desc
            """)
    List<Job> search(@Param("q") String q,
                     @Param("category") String category,
                     @Param("location") String location,
                     @Param("type") String type);

    List<Job> findByEmployerOrderByPostedAtDesc(User employer);

    long countByEmployerAndActiveTrue(User employer);
}
