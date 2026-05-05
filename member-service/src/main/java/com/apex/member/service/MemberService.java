package com.apex.member.service;

import com.apex.member.client.PaymentApiClient;
import com.apex.member.client.TrainerApiClient;
import com.apex.member.entity.*;
import com.apex.member.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final ClassBookingRepository bookingRepository;
    private final TrainerApiClient trainerApiClient;
    private final PaymentApiClient paymentApiClient;

    @Transactional
    public Member createMember(Member member) {
        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + member.getEmail());
        }
        if (member.getMembershipStartDate() == null) {
            member.setMembershipStartDate(LocalDate.now());
        }
        if (member.getMembershipEndDate() == null) {
            member.setMembershipEndDate(LocalDate.now().plusMonths(1));
        }
        return memberRepository.save(member);
    }

    public Member getMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + id));
    }

    public Member getMemberByUserId(Long userId) {
        return memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found for user: " + userId));
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    @Transactional
    public Member updateMember(Long id, Member updated) {
        Member existing = getMemberById(id);
        existing.setFullName(updated.getFullName());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setAddress(updated.getAddress());
        existing.setMembershipType(updated.getMembershipType());
        existing.setMembershipEndDate(updated.getMembershipEndDate());
        return memberRepository.save(existing);
    }

    @Transactional
    public void suspendMember(Long id) {
        Member m = getMemberById(id);
        m.setStatus(Member.MembershipStatus.SUSPENDED);
        memberRepository.save(m);
    }

    // ── Bookings ──────────────────────────────────────────────────────────────

    @Transactional
    public ClassBooking bookClass(ClassBooking booking) {
        // PAYMENT VALIDATION: Check if member has made a payment for class booking
        if (!paymentApiClient.hasMemberPaidForClassBooking(booking.getMemberId())) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
                    "Payment required: Member must complete a payment before booking a class");
        }

        boolean alreadyBooked = bookingRepository.existsByMemberIdAndClassIdAndStatusNot(
                booking.getMemberId(), booking.getClassId(), ClassBooking.BookingStatus.CANCELLED);
        if (alreadyBooked) {
            throw new IllegalStateException("Member already booked this class");
        }
        return bookingRepository.save(booking);
    }

    public List<ClassBooking> getBookingsByMember(Long memberId) {
        return bookingRepository.findByMemberId(memberId);
    }

    /**
     * Admin: all bookings for the class (including cancelled).
     * Trainer: only if they own the class; excludes cancelled rows from the roster view.
     */
    public List<ClassBooking> getBookingsForClass(Long classId, boolean isAdmin,
                                                  Long jwtUserId, String authorizationHeader) {
        if (!isAdmin) {
            if (jwtUserId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Please log in again — your session token needs to be refreshed.");
            }
            Long classTrainerId = trainerApiClient.getTrainerIdOwningClass(classId);
            Long myTrainerId = trainerApiClient.getTrainerRecordIdForUser(jwtUserId, authorizationHeader);
            if (classTrainerId == null || myTrainerId == null || !Objects.equals(classTrainerId, myTrainerId)) {
                throw new AccessDeniedException("You can only view bookings for your own classes.");
            }
            return bookingRepository.findByClassId(classId).stream()
                    .filter(b -> b.getStatus() != ClassBooking.BookingStatus.CANCELLED)
                    .toList();
        }
        return bookingRepository.findByClassId(classId);
    }

    @Transactional
    public ClassBooking cancelBooking(Long bookingId) {
        ClassBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
        booking.setStatus(ClassBooking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
