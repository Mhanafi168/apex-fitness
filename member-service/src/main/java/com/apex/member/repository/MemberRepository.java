package com.apex.member.repository;

import com.apex.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByUserId(Long userId);
    Optional<Member> findByEmail(String email);
    List<Member> findByStatus(Member.MembershipStatus status);
    boolean existsByEmail(String email);
}
