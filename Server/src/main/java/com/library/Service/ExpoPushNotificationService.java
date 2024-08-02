package com.library.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpoPushNotificationService {

    private static final String EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

    public void sendPushNotification(String token, String title, String body, Map<String, Object> data) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        ObjectMapper objectMapper = new ObjectMapper();
        String expoPushToken = null;
        try {
            JsonNode jsonNode = objectMapper.readTree(token);
            expoPushToken = jsonNode.get("expoPushToken").asText();
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        Map<String, Object> message = new HashMap<>();
        message.put("to", expoPushToken);
        message.put("sound", "default");
        message.put("title", title);
        message.put("body", body);
        message.put("data", data);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(message, headers);

        ResponseEntity<String> response = restTemplate.exchange(EXPO_PUSH_ENDPOINT, HttpMethod.POST, entity, String.class);

        System.out.println("Response: " + response.getBody());
    }

    public static void main(String[] args) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        String jsonString = "{\"expoPushToken\":\"ExponentPushToken[I8z0-_ByTNvYHYCJorlJuR]\"}";

        ObjectMapper objectMapper = new ObjectMapper();
        String expoPushToken = null;
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonString);
            expoPushToken = jsonNode.get("expoPushToken").asText();
        } catch (IOException e) {
            e.printStackTrace();
        }

        Map<String, Object> data = new HashMap<>();
        data.put("key", "value");  // Tạo một đối tượng JSON cho "data"

        Map<String, Object> message = new HashMap<>();
        message.put("to", expoPushToken);
        message.put("sound", "default");
        message.put("title", "juhu");
        message.put("body", "ádasy");
        message.put("data", data);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(message, headers);

        ResponseEntity<String> response = restTemplate.exchange(EXPO_PUSH_ENDPOINT, HttpMethod.POST, entity, String.class);

        System.out.println("Response: " + response.getBody());
    }
}