package com.library.Service;

import com.library.DTO.NotificationDTO;
import com.library.Model.*;
import com.library.Model.Enum.NotificationStatus;
import com.library.Model.Enum.NotificationType;
import com.library.Repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ExpoPushNotificationService expoPushNotificationService;

    private final EmailService emailService = new EmailService();

    public void sendBorrowRecordNotification(Student student, String title, String body, Map<String, Object> data) {
        sendNotification(student, title, body, data, NotificationType.BORROW_RECORD);
    }

    public void sendFineRecordNotification(Student student, String title, String body, Map<String, Object> data) {
        sendNotification(student, title, body, data, NotificationType.FINE_RECORD);
    }

    public void sendFeedbackNotification(Student student, String title, String body, Map<String, Object> data) {
        sendNotification(student, title, body, data, NotificationType.FEEDBACK);
    }

    public void sendBookUpdateNotification(Student student, String title, String body, Map<String, Object> data) {
        sendNotification(student, title, body, data, NotificationType.BOOK_UPDATE);
    }

    public void sendSystemUpdateNotification(Student student, String title, String body, Map<String, Object> data) {
        sendNotification(student, title, body, data, NotificationType.SYSTEM_UPDATE);
    }


    public void sendFineRecordNotification(FineRecord fineRecord) {
        Student student = fineRecord.getBorrowRecord().getStudent();
        String title = "Thông báo phiếu phạt";
        String body = "";
        Map<String, Object> data = new HashMap<>();
        data.put("fineRecordId", fineRecord.getId());
        data.put("status", fineRecord.getStatus().name());

        switch (fineRecord.getStatus()) {
            case PENDING:
                body = String.format("Phiếu phạt số %d của bạn đang chờ thanh toán. Số tiền phạt: %.2f.", fineRecord.getId(), fineRecord.getFineAmount());
                break;
//            case PAID:
//                body = String.format("Phiếu phạt số %d của bạn đã được thanh toán. Cảm ơn bạn!", fineRecord.getId());
//                break;
            case UNPAID:
                body = String.format("Phiếu phạt số %d của bạn chưa thanh toán. Vui lòng thanh toán ngay.", fineRecord.getId());
                break;
            default:
                break;
        }

        sendNotification(student, title, body, data, NotificationType.FINE_RECORD);
        sendFineRecordEmail(student.getEmail(), fineRecord);
    }

    public void sendFeedbackNotification(Feedback feedback) {
        Student student = feedback.getStudent();
        String title = "Thông báo phản hồi";
        String body = "";
        Map<String, Object> data = new HashMap<>();
        data.put("feedbackId", feedback.getId());
        data.put("status", feedback.getStatus().name());
        body = switch (feedback.getStatus()) {
            case NEW ->
                    String.format("Phản hồi của bạn với mã số %d đã được nhận. Chúng tôi sẽ xử lý sớm nhất.", feedback.getId());
            case NOTED ->
                    String.format("Phản hồi của bạn với mã số %d đã được ghi nhận. Cảm ơn bạn đã góp ý!", feedback.getId());
            case REJECTED ->
                    String.format("Phản hồi của bạn với mã số %d đã bị từ chối. Lý do: %s", feedback.getId(), feedback.getReason());
        };

        sendNotification(student, title, body, data, NotificationType.FEEDBACK);
        sendFeedbackEmail(student.getEmail(), feedback);
    }

    public void sendRenewalRecordNotification(RenewalRecord renewalRecord) {
        Student student = renewalRecord.getBorrowRecord().getStudent();
        String title = "Thông báo đơn gia hạn";
        String body = "";
        Map<String, Object> data = new HashMap<>();
        data.put("borrowRecord", renewalRecord.getBorrowRecord().getId());
        data.put("status", renewalRecord.getStatus().name());
        body = switch (renewalRecord.getStatus()) {
            case ACCEPTED -> "Đơn yêu cầu gia hạn đã được chấp nhận.";
            case CANCELLED -> "Đơn yêu cầu gia hạn bị từ chối.";
            default -> body;
        };

        sendNotification(student, title, body, data, NotificationType.BORROW_RECORD);
        sendRenewalRecordEmail(student.getEmail(), renewalRecord);
    }

    public void sendBorrowRecordNotification(BorrowRecord borrowRecord) {
        Student student = borrowRecord.getStudent();
        String title = "Thông báo đơn mượn sách";
        String body = "";
        Map<String, Object> data = new HashMap<>();
        data.put("borrowRecordId", borrowRecord.getId());
        data.put("status", borrowRecord.getStatus().name());

        body = switch (borrowRecord.getStatus()) {
            case PENDING -> String.format("Đơn mượn sách số %d của bạn đang chờ xử lý.", borrowRecord.getId());
            case CANCELLED -> String.format("Đơn mượn sách số %d của bạn đã bị hủy.", borrowRecord.getId());
            case BORROWED -> String.format("Bạn đã mượn sách thành công. Mã đơn mượn sách: %d.", borrowRecord.getId());
            case RETURN_PENDING -> String.format("Đơn mượn sách số %d của bạn đang chờ trả.", borrowRecord.getId());
            case COMPLETED -> String.format("Đơn mượn sách số %d của bạn đã hoàn thành.", borrowRecord.getId());
            case OVERDUE ->
                    String.format("Đơn mượn sách số %d của bạn đã quá hạn. Vui lòng trả sách ngay.", borrowRecord.getId());
            case ARCHIVED -> String.format("Đơn mượn sách số %d của bạn đã được lưu trữ.", borrowRecord.getId());
        };

        sendNotification(student, title, body, data, NotificationType.BORROW_RECORD);
        sendBorrowRecordEmail(student.getEmail(), borrowRecord);
    }
    public void sendBorrowRecordNotificationWithoutEmail(BorrowRecord borrowRecord) {
        Student student = borrowRecord.getStudent();
        String title = "Thông báo đơn mượn sách";
        String body = "";
        Map<String, Object> data = new HashMap<>();
        data.put("borrowRecordId", borrowRecord.getId());
        data.put("status", borrowRecord.getStatus().name());

        body = switch (borrowRecord.getStatus()) {
            case PENDING -> String.format("Đơn mượn sách số %d của bạn đang chờ xử lý.", borrowRecord.getId());
            case CANCELLED -> String.format("Đơn mượn sách số %d của bạn đã bị hủy.", borrowRecord.getId());
            case BORROWED -> String.format("Bạn đã mượn sách thành công. Mã đơn mượn sách: %d.", borrowRecord.getId());
            case RETURN_PENDING -> String.format("Đơn mượn sách số %d của bạn đang chờ trả.", borrowRecord.getId());
            case COMPLETED -> String.format("Đơn mượn sách số %d của bạn đã hoàn thành.", borrowRecord.getId());
            case OVERDUE ->
                    String.format("Đơn mượn sách số %d của bạn đã quá hạn. Vui lòng trả sách ngay.", borrowRecord.getId());
            case ARCHIVED -> String.format("Đơn mượn sách số %d của bạn đã được lưu trữ.", borrowRecord.getId());
        };

        sendNotification(student, title, body, data, NotificationType.BORROW_RECORD);
    }

    private void sendFineRecordEmail(String toEmail, FineRecord fineRecord) {
        String subject = "Thông báo phiếu phạt";
        String content = switch (fineRecord.getStatus()) {
            case PENDING ->
                    String.format("Kính gửi quý sinh viên,\n\nPhiếu phạt số %d của bạn đang chờ thanh toán. Số tiền phạt: %.2f.\n\nTrân trọng,\nThư viện", fineRecord.getId(), fineRecord.getFineAmount());
            case PAID ->
                    String.format("Kính gửi quý sinh viên,\n\nPhiếu phạt số %d của bạn đã được thanh toán. Cảm ơn bạn!\n\nTrân trọng,\nThư viện", fineRecord.getId());
            case UNPAID ->
                    String.format("Kính gửi quý sinh viên,\n\nPhiếu phạt số %d của bạn chưa thanh toán. Vui lòng thanh toán ngay.\n\nTrân trọng,\nThư viện", fineRecord.getId());
        };

        emailService.sendEmail(toEmail, subject, content);
    }

    private void sendFeedbackEmail(String toEmail, Feedback feedback) {
        String subject = "Thông báo phản hồi";
        String content = switch (feedback.getStatus()) {
            case NEW ->
                    String.format("Kính gửi quý sinh viên,\n\nPhản hồi của bạn với mã số %d đã được nhận. Chúng tôi sẽ xử lý sớm nhất.\n\nTrân trọng,\nThư viện", feedback.getId());
            case NOTED ->
                    String.format("Kính gửi quý sinh viên,\n\nPhản hồi của bạn với mã số %d đã được ghi nhận. Cảm ơn bạn đã góp ý!\n\nTrân trọng,\nThư viện", feedback.getId());
            case REJECTED ->
                    String.format("Kính gửi quý sinh viên,\n\nPhản hồi của bạn với mã số %d đã bị từ chối. Lý do: %s\n\nTrân trọng,\nThư viện", feedback.getId(), feedback.getReason());
        };

        emailService.sendEmail(toEmail, subject, content);
    }

    private void sendBorrowRecordEmail(String toEmail, BorrowRecord borrowRecord) {
        String subject = "Thông báo đơn mượn sách";
        String content = switch (borrowRecord.getStatus()) {
            case PENDING ->
                    String.format("Kính gửi quý sinh viên,\n\nĐơn mượn sách số %d của bạn đang chờ xử lý.\n\nTrân trọng,\nThư viện", borrowRecord.getId());
            case CANCELLED ->
                    String.format("Kính gửi quý sinh viên,\n\nĐơn mượn sách số %d của bạn đã bị hủy.\n\nTrân trọng,\nThư viện", borrowRecord.getId());
            case BORROWED ->
                    String.format("Kính gửi quý sinh viên,\n\nBạn đã mượn sách thành công. Mã đơn mượn sách: %d.\n\nTrân trọng,\nThư viện", borrowRecord.getId());
            case RETURN_PENDING ->
                    String.format("Kính gửi quý sinh viên,\n\nĐơn mượn sách số %d của bạn đang chờ trả.\n\nTrân trọng,\nThư viện", borrowRecord.getId());
            case COMPLETED ->
                    String.format("Kính gửi quý sinh viên,\n\nĐơn mượn sách số %d của bạn đã hoàn thành.\n\nTrân trọng,\nThư viện", borrowRecord.getId());
            case OVERDUE ->
                    String.format("Kính gửi quý sinh viên,\n\nĐơn mượn sách số %d của bạn đã quá hạn. Vui lòng trả sách ngay.\n\nTrân trọng,\nThư viện", borrowRecord.getId());
            case ARCHIVED ->
                    String.format("Kính gửi quý sinh viên,\n\nĐơn mượn sách số %d của bạn đã được lưu trữ.\n\nTrân trọng,\nThư viện", borrowRecord.getId());
        };

        emailService.sendEmail(toEmail, subject, content);
    }

    private void sendRenewalRecordEmail(String toEmail, RenewalRecord renewalRecord) {
        String subject = "Thông báo đơn gia hạn mượn sách";
        String content = switch (renewalRecord.getStatus()) {
            case ACCEPTED ->
                    String.format("Kính gửi quý sinh viên,\n\nĐơn gia hạn mượn sách số %d của bạn đã được chấp nhận.\n\nTrân trọng,\nThư viện", renewalRecord.getId());
            case CANCELLED ->
                    String.format("Kính gửi quý sinh viên,\n\nĐơn gia hạn mượn sách số %d của bạn đã bị từ chối.\n\nTrân trọng,\nThư viện", renewalRecord.getId());
            default -> "";
        };

        emailService.sendEmail(toEmail, subject, content);
    }

    public List<NotificationDTO> getNotificationsByStudentId(Long studentId) {
        List<Notification> notifications = notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        return notifications.stream()
                .map(Notification::transferToDTO)
                .collect(Collectors.toList());
    }

    private void sendNotification(Student student, String title, String body, Map<String, Object> data, NotificationType type) {
        // Tạo thông báo
        Notification notification = new Notification();
        notification.setStudent(student);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setData(data.toString());
        notification.setType(type);
        notification.setStatus(NotificationStatus.NEW);

        // Lưu thông báo vào cơ sở dữ liệu
        notificationRepository.save(notification);

        // Gửi thông báo push qua Expo
        expoPushNotificationService.sendPushNotification(student.getExpoPushToken(), title, body, data);
    }





    // Thêm hoặc cập nhật thông báo
    public Notification saveOrUpdateNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    // Xóa thông báo theo ID
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    // Lấy tất cả thông báo không phân trang
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Lấy tất cả thông báo theo dạng phân trang
    public Page<Notification> getAllNotifications(Pageable pageable) {
        return notificationRepository.findAll(pageable);
    }

    // Lấy thông báo theo ID
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    // Lấy thông báo của sinh viên theo dạng phân trang
    public Page<Notification> getNotificationsByStudent(Student student, Pageable pageable) {
        return notificationRepository.findByStudentOrderByCreatedAtDesc(student, pageable);
    }

    // Lấy thông báo của sinh viên không phân trang
    public List<Notification> getNotificationsByStudent(Student student) {
        return notificationRepository.findByStudentOrderByCreatedAtDesc(student);
    }

    // Lấy thông báo theo trạng thái theo dạng phân trang
    public Page<Notification> getNotificationsByStatus(NotificationStatus status, Pageable pageable) {
        return notificationRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }

    // Lấy thông báo theo trạng thái không phân trang
    public List<Notification> getNotificationsByStatus(NotificationStatus status) {
        return notificationRepository.findByStatusOrderByCreatedAtDesc(status);
    }
}