package com.library.Controller.API;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.Controller.Admin.GlobalControllerAdvice;
import com.library.DTO.MajorInfoDTO;
import com.library.DTO.StudentLoginDTO;
import com.library.Model.AuthResponse;
import com.library.Model.Enum.StudentStatus;
import com.library.Model.Major;
import com.library.Model.Student;
import com.library.Security.JwtTokenProvider;
import com.library.Service.MajorService;
import com.library.Service.StudentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/public")
public class PublicAPIController {
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final StudentService studentService;
    private final MajorService majorService;
    private final JwtTokenProvider jwtTokenProvider;
    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    @Autowired
    private RestTemplate restTemplate;

    public PublicAPIController(StudentService studentService, MajorService majorService, JwtTokenProvider jwtTokenProvider) {
        this.studentService = studentService;
        this.majorService = majorService;
        this.jwtTokenProvider = jwtTokenProvider;
    }


    @PostMapping("/checkToken")
    public ResponseEntity<?> checkToken(@RequestBody Map<String, String> tokenMap) {
        logger.info("đang check token");
        logger.info(tokenMap.toString());
        String token = tokenMap.get("token");
        logger.info(token);
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Token is missing");
        }

        boolean isValid = jwtTokenProvider.validateToken(token);
        logger.info(String.valueOf(isValid));
        if (isValid) {
            return ResponseEntity.ok().body("Token is valid");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is invalid or expired");
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody StudentLoginDTO studentLoginDTO) {
        logger.info(String.valueOf(studentLoginDTO));

        Optional<Student> optionalStudent = studentService.getStudentByEmail(studentLoginDTO.getEmail());
        if (optionalStudent.isPresent()) {
            Student student = optionalStudent.get();
            System.out.println("email correct, check password");
            if (!passwordEncoder.matches(studentLoginDTO.getPassword(), student.getPassword())) {
                System.out.println("password wrong");
                student = findAccountInfo(studentLoginDTO);
                if (student != null) {
                    return ResponseEntity.ok().body(getRespone(studentService.saveOrUpdateStudent(student)));
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
                }
            } else {
                System.out.println("password right");
                return ResponseEntity.ok().body(getRespone(optionalStudent.get()));
            }
        } else {
            Student student = findAccountInfo(studentLoginDTO);
            if (student != null) {
                return ResponseEntity.ok().body(getRespone(studentService.saveOrUpdateStudent(student)));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email");
            }
        }


    }

    @GetMapping("/getMajors")
    public ResponseEntity<?> getList() {
        List<Major> majors = majorService.getAllMajors();
        if (majors.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<MajorInfoDTO> infoDTOs = new ArrayList<>();
        for (Major major : majors) {
            infoDTOs.add(major.transferToMajorInfo());
        }
        return ResponseEntity.ok(infoDTOs);
    }


    // Lấy chuyên ngành theo ID
    @GetMapping("/getMajorsById/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<Major> major = majorService.getMajorById(Math.toIntExact(id));
        if (major.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(major.get().transferToMajorInfo());
    }

    public Student findAccountInfo(StudentLoginDTO studentLoginDTO) {
        String username = studentLoginDTO.getEmail().split("@")[0];
        String password = studentLoginDTO.getPassword();
        Student student = new Student();
        // Create Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.add("Accept", "application/json, text/plain, */*");
        headers.add("Accept-Encoding", "gzip, deflate, br, zstd");
        headers.add("Accept-Language", "en-US,en;q=0.9,vi;q=0.8,es;q=0.7");
        headers.add("Connection", "keep-alive");
        headers.add("Origin", "https://dkmh.hcmuaf.edu.vn");
        headers.add("Referer", "https://dkmh.hcmuaf.edu.vn/");
        headers.add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, như Gecko) Chrome/124.0.0.0 Safari/537.36");

        // Create body
        Map<String, String> body = new HashMap<>();
        body.put("username", username);
        body.put("password", password);
        body.put("grant_type", "password");
        // Convert body to urlencoded string
        StringBuilder formBody = new StringBuilder();
        for (Map.Entry<String, String> entry : body.entrySet()) {
            if (!formBody.isEmpty()) formBody.append('&');
            formBody.append(entry.getKey()).append('=').append(entry.getValue());
        }

        HttpEntity<String> request = new HttpEntity<>(formBody.toString(), headers);
        ResponseEntity<String> response;
        String accessToken = "";
        System.out.println(username + " " + password);
        try {
            response = restTemplate.exchange("https://dkmh.hcmuaf.edu.vn/api/auth/login", HttpMethod.POST, request, String.class);
            ObjectMapper objectMapper = new ObjectMapper();
            AuthResponse authResponse = objectMapper.readValue(response.getBody(), AuthResponse.class);
            accessToken = authResponse.getAccessToken();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
        if (accessToken != null) {
            // Tạo request mới với Bearer token
            HttpHeaders newHeaders = new HttpHeaders();
            newHeaders.setContentType(MediaType.APPLICATION_JSON);
            newHeaders.setBearerAuth(accessToken);

            HttpEntity<String> newRequest = new HttpEntity<>(newHeaders);

            String newUrl = "https://dkmh.hcmuaf.edu.vn/api/dkmh/w-locsinhvieninfo";

            ResponseEntity<String> newResponse;
            try {
                newResponse = restTemplate.exchange(newUrl, HttpMethod.POST, newRequest, String.class);
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode rootNode = objectMapper.readTree(newResponse.getBody());

                // Truy xuất tới đối tượng data bên trong JSON
                JsonNode dataNode = rootNode.path("data");
                System.out.println(dataNode);
                String name = dataNode.path("ten_day_du").asText();
                String major = dataNode.path("khoa").asText();

                student.setId(Long.parseLong(username.trim()));
                student.setEmail(studentLoginDTO.getEmail());
                student.setPassword(studentLoginDTO.getPassword());
                student.setPassword(passwordEncoder.encode(studentLoginDTO.getPassword()));
                student.setName(name);
                student.setMajor(majorService.getMajorByName(major)
                        .orElseThrow(() -> new IllegalStateException("Could not find major")));
                student.setStatus(StudentStatus.ACTIVE);
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
            return student;
        }
        return null;
    }

    @PutMapping("/expoPushToken/{id}")
    public ResponseEntity<?> updateExpoPushToken(@PathVariable Long id, @RequestBody String expoPushToken) {
        return ResponseEntity.ok(getRespone(studentService.updateExpoPushToken(id, expoPushToken)));

    }

    private Map<String, Object> getRespone(Student student) {
        Map<String, Object> response = new HashMap<>();
        response.put("user", student.transferToStudentInfo(jwtTokenProvider.createToken(student)));
        return response;
    }
}
