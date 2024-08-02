package com.library.Service;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

public class EmailService {

    private final String username = "travellab2023@gmail.com"; // Địa chỉ email của bạn
    private final String password = "sbqhjjexxrorqwgi"; // Mật khẩu email của bạn

    public void sendEmail(String toEmail, String subject, String content) {
        // Cấu hình các thuộc tính SMTP
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        // Tạo session với thông tin xác thực
        Session session = Session.getInstance(props, new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            // Tạo một đối tượng MimeMessage
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject(subject);
            message.setText(content);
            message.setHeader("Content-Type", "text/plain; charset=UTF-8");
            Transport.send(message);
            System.out.println("Email sent successfully");

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) {
        EmailService emailService = new EmailService();
        emailService.sendEmail("manhha584224@gmail.com", "Test Subject", "Test Content");
    }
}