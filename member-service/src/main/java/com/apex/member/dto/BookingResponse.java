package com.apex.member.dto;

import com.apex.member.entity.ClassBooking;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingResponse {

    private Long id;
    private Long memberId;
    private Long classId;
    private String className;
    private String trainerName;
    private LocalDateTime classDateTime;
    private String status;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;
    private String notes;

    public static BookingResponse from(ClassBooking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .memberId(b.getMemberId())
                .classId(b.getClassId())
                .className(b.getClassName())
                .trainerName(b.getTrainerName())
                .classDateTime(b.getClassDateTime())
                .status(b.getStatus() != null ? b.getStatus().name() : null)
                .bookedAt(b.getBookedAt())
                .cancelledAt(b.getCancelledAt())
                .notes(b.getNotes())
                .build();
    }
}
