package com.library.Controller.API;

import com.library.Security.JwtTokenProvider;
import com.library.Model.Major;
import com.library.Service.MajorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/majors")
public class MajorAPIController {

    @Autowired
    private MajorService majorService;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<Major> majors = majorService.getAllMajors();
        if (majors.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(majors);
    }

}
