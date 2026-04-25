package com.apex.member.repository;

import com.apex.member.entity.ClassBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassBookingRepository extends JpaRepository<ClassBooking, Long> {
    List<ClassBooking> findByMemberId(Long memberId);
    List<ClassBooking> findByClassId(Long classId);
    boolean existsByMemberIdAndClassIdAndStatusNot(Long memberId, Long classId, ClassBooking.BookingStatus status);
}
