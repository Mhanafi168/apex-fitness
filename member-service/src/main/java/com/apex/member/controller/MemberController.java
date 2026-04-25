package com.apex.member.controller;

import com.apex.member.dto.*;
import com.apex.member.entity.*;
import com.apex.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // ── Member CRUD ───────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<MemberResponse> createMember(@Valid @RequestBody MemberRequest req) {
        Member member = Member.builder()
                .userId(req.getUserId())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phoneNumber(req.getPhoneNumber())
                .address(req.getAddress())
                .membershipType(req.getMembershipType())
                .membershipStartDate(req.getMembershipStartDate())
                .membershipEndDate(req.getMembershipEndDate())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(MemberResponse.from(memberService.createMember(member)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MemberResponse>> getAllMembers() {
        return ResponseEntity.ok(
                memberService.getAllMembers().stream()
                        .map(MemberResponse::from)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER')")
    public ResponseEntity<MemberResponse> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(MemberResponse.from(memberService.getMemberById(id)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<MemberResponse> getMemberByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(MemberResponse.from(memberService.getMemberByUserId(userId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<MemberResponse> updateMember(
            @PathVariable Long id, @RequestBody MemberRequest req) {
        Member updated = Member.builder()
                .fullName(req.getFullName())
                .phoneNumber(req.getPhoneNumber())
                .address(req.getAddress())
                .membershipType(req.getMembershipType())
                .membershipEndDate(req.getMembershipEndDate())
                .build();
        return ResponseEntity.ok(MemberResponse.from(memberService.updateMember(id, updated)));
    }

    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> suspendMember(@PathVariable Long id) {
        memberService.suspendMember(id);
        return ResponseEntity.noContent().build();
    }

    // ── Bookings ──────────────────────────────────────────────────────────────

    @PostMapping("/bookings")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<BookingResponse> bookClass(@Valid @RequestBody BookingRequest req) {
        ClassBooking booking = ClassBooking.builder()
                .memberId(req.getMemberId())
                .classId(req.getClassId())
                .className(req.getClassName())
                .trainerName(req.getTrainerName())
                .classDateTime(req.getClassDateTime())
                .notes(req.getNotes())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BookingResponse.from(memberService.bookClass(booking)));
    }

    @GetMapping("/{memberId}/bookings")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','TRAINER')")
    public ResponseEntity<List<BookingResponse>> getMemberBookings(@PathVariable Long memberId) {
        return ResponseEntity.ok(
                memberService.getBookingsByMember(memberId).stream()
                        .map(BookingResponse::from)
                        .collect(Collectors.toList()));
    }

    @PutMapping("/bookings/{bookingId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(BookingResponse.from(memberService.cancelBooking(bookingId)));
    }
}
