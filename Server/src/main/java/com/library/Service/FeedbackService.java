package com.library.Service;

import com.library.DTO.FeedbackUpdateRequest;
import com.library.Model.Enum.FeedbackStatus;
import com.library.Model.Feedback;
import com.library.Model.Librarian;
import com.library.Model.Student;
import com.library.Repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;
    private final NotificationService notificationService;

    public FeedbackService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Xem tất cả feedback không phân trang
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    // Xem tất cả feedback theo dạng phân trang
    public Page<Feedback> getAllFeedbacks(Pageable pageable) {
        return feedbackRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    // Xem feedback theo ID
    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    // Thêm mới hoặc cập nhật feedback
    public Feedback saveOrUpdateFeedback(Feedback feedback) {
        Feedback result = feedbackRepository.save(feedback);
        notificationService.sendFeedbackNotification(result);
        return result;
    }
    // Cập nhật feedback
    public void updateFeedback(long id, FeedbackUpdateRequest request, Librarian currentLibrarian) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found with id: " + id));

        feedback.setStatus(request.getStatus());
        feedback.setHandledBy(currentLibrarian);
        if(request.getStatus().equals(FeedbackStatus.NOTED)) feedback.setReply((request.getContent()));
        if(request.getStatus().equals(FeedbackStatus.REJECTED)) feedback.setReason((request.getContent()));
        notificationService.sendFeedbackNotification(feedback);
        feedbackRepository.save(feedback);
    }

    // Xóa feedback theo ID
    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }

    // Lấy feedback của sinh viên theo dạng phân trang
    public Page<Feedback> getFeedbacksByStudent(Student student, Pageable pageable) {
        return feedbackRepository.findByStudentOrderByCreatedAtDesc(student, pageable);
    }
    // Lấy feedback của sinh viên
    public List<Feedback> getByStudentOrderByCreatedAtDesc(Student student) {
        return feedbackRepository.findByStudentOrderByCreatedAtDesc(student);
    }

    // Lấy feedback của sinh viên kèm theo status theo dạng phân trang
    public Page<Feedback> getFeedbacksByStudentAndStatus(Student student, FeedbackStatus status, Pageable pageable) {
        return feedbackRepository.findByStudentAndStatusOrderByCreatedAtDesc(student, status, pageable);
    }

    // Lấy feedback theo status theo dạng phân trang
    public Page<Feedback> getFeedbacksByStatus(FeedbackStatus status,Student student  , Pageable pageable) {
        return feedbackRepository.findByStatusAndStudentOrderByCreatedAtDesc(status,student, pageable);
    }

    // Lấy tất cả feedback từ mới nhất đến cũ nhất
    public List<Feedback> getAllFeedbacksOrderByCreatedAtDesc() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    // Lấy feedback theo trạng thái không phân trang
    public List<Feedback> getFeedbacksByStatus(FeedbackStatus status,Student student ) {
        return feedbackRepository.findByStatusAndStudentOrderByCreatedAtDesc(status,student);
    }


    // Lấy feedback theo danh sách trạng thái không phân trang
    public List<Feedback> getFeedbacksByStatuses(List<FeedbackStatus> statuses,Student student ) {
        return feedbackRepository.findByStatusInAndStudentOrderByCreatedAtDesc(statuses,student);
    }

    // Lấy feedback theo danh sách trạng thái theo dạng phân trang
    public Page<Feedback> getFeedbacksByStatuses(List<FeedbackStatus> statuses,Student student, Pageable pageable ) {
        return feedbackRepository.findByStatusInAndStudentOrderByCreatedAtDesc(statuses,student, pageable);
    }
}