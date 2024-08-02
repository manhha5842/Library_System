package com.library.Controller.API;

import com.library.Controller.Admin.GlobalControllerAdvice;
import com.library.DTO.FeedbackDTO;
import com.library.Model.Enum.FeedbackPurpose;
import com.library.Model.Enum.FeedbackStatus;
import com.library.Model.Feedback;
import com.library.Model.Student;
import com.library.Service.FeedbackService;
import com.library.Service.ImageUploadService;
import com.library.Service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackAPIController {
    @Autowired
    private FeedbackService feedbackService;

    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    @Autowired
    private StudentService studentService;
    @Autowired
    private ImageUploadService imageUploadService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }


    @GetMapping
    public ResponseEntity<?> getFeedbacksByStudentId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
                Student student = studentService.getStudentByEmail(auth.getEmail())
                        .orElseThrow(() -> new IllegalStateException("Could not find student"));

                return ResponseEntity.ok(feedbackService.getByStudentOrderByCreatedAtDesc(student).stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            System.out.println(e);
            return ResponseEntity.badRequest().body(null);
        }

    }

    @GetMapping("/paged")
    public ResponseEntity<?> getFeedbacksByStudentId(@PageableDefault(size = 10) Pageable pageable) {

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
                Student student = studentService.getStudentByEmail(auth.getEmail())
                        .orElseThrow(() -> new IllegalStateException("Could not find student"));

                return ResponseEntity.ok(feedbackService.getFeedbacksByStudent(student, pageable).map(this::convertToDTO));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            System.out.println(e);
            return ResponseEntity.badRequest().body(null);
        }

    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDTO> getFeedbackById(@PathVariable Long id) {
        Feedback feedback = feedbackService.getFeedbackById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found with id: " + id));
        if (feedback != null) {
            return ResponseEntity.ok(convertToDTO(feedback));
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/statuses")
    public ResponseEntity<?> getFeedbacksByStatuses(
            @RequestParam List<String> statuses,
            @PageableDefault(size = 10) Pageable pageable) {

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
                Student student = studentService.getStudentByEmail(auth.getEmail())
                        .orElseThrow(() -> new IllegalStateException("Could not find student"));


                return ResponseEntity.ok(
                        feedbackService.getFeedbacksByStatuses(
                                        statuses.stream().map(FeedbackStatus::valueOf).toList(),
                                        student,
                                        pageable)
                                .stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            System.out.println(e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<FeedbackDTO> createFeedback(
            @RequestParam("purpose") String purpose,
            @RequestParam("content") String content,
            @RequestParam("reason") String reason,
            @RequestParam("proposedSolution") String proposedSolution,
            @RequestPart(value = "image", required = false) MultipartFile image,
            HttpServletRequest request) {
        try {
            Feedback feedback = new Feedback();
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
                Student student = studentService.getStudentByEmail(auth.getEmail())
                        .orElseThrow(() -> new IllegalStateException("Could not find student"));
                feedback.setStudent(student);
                if (image != null && !image.isEmpty()) {
                    String imagePath = imageUploadService.uploadImageToFreeimageHost(image);
                    feedback.setImage(imagePath);
                }
                feedback.setPurpose(FeedbackPurpose.valueOf(purpose));
                feedback.setContent(content);
                feedback.setReason(reason);
                feedback.setProposedSolution(proposedSolution);
                feedback.setStatus(FeedbackStatus.NEW);
                return ResponseEntity.ok(convertToDTO(feedbackService.saveOrUpdateFeedback(feedback)));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    private FeedbackDTO convertToDTO(Feedback feedback) {
        FeedbackDTO feedbackDTO = new FeedbackDTO();
        feedbackDTO.setId(feedback.getId());
        feedbackDTO.setStudentId(feedback.getStudent().getId());
        feedbackDTO.setPurpose(feedback.getPurpose());
        feedbackDTO.setContent(feedback.getContent());
        feedbackDTO.setImage(feedback.getImage());
        feedbackDTO.setReason(feedback.getReason());
        feedbackDTO.setProposedSolution(feedback.getProposedSolution());
        feedbackDTO.setStatus(feedback.getStatus());
        feedbackDTO.setCreatedAt(feedback.getCreatedAt());
        feedbackDTO.setUpdatedAt(feedback.getUpdatedAt());
        feedbackDTO.setReply(feedback.getReply());
        if (feedback.getHandledBy() != null) {
            feedbackDTO.setHandledById(feedback.getHandledBy().getId());
        }
        return feedbackDTO;
    }


}