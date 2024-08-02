package com.library.DTO;

import lombok.Data;

@Data
public class NotificationDTO {
    private Long id;
    private String title;
    private String body;
    private String data;
    private String type;
    private String status;
    private String createdAt;
    private String updatedAt;

    public NotificationDTO(Long id, String title, String body, String data, String type,String status, String createdAt, String updatedAt) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.data = data;
        this.type = type;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}