package com.library.Controller.Admin;

import com.library.Model.Publisher;
import com.library.Service.PublisherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/publishers")
public class PublisherController {
    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    private final PublisherService publisherService;

    @Autowired
    public PublisherController(PublisherService publisherService) {
        this.publisherService = publisherService;
    }

    @GetMapping("")
    public String publishers(Model model) {
        List<Publisher> publisherList = publisherService.getAllPublishers();
        model.addAttribute("pageTitle", "Danh sách nhà xuất bản");
        model.addAttribute("publisherList", publisherList);
        return "publishers";
    }

    @GetMapping("/{id}")
    public String viewPublisher(@PathVariable("id") Long publisherId, Model model) {
        Optional<Publisher> publisher = publisherService.getPublisherById(Math.toIntExact(publisherId));
        if (publisher.isPresent()) {
            Publisher result = publisher.get();
            result.setBooks(publisherService.getBooksByPublisherId(result.getId()));
            model.addAttribute("publisher", result);

            model.addAttribute("pageTitle", result.getName());
        }
        return "publisher";
    }
    @PostMapping("/update")
    public ResponseEntity<Publisher> updatePublisher(@RequestParam("id") int id, @RequestParam("name") String name) {
        Publisher publisher = publisherService.getPublisherById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid publisher Id:" + id));

        // Cập nhật thông tin và lưu
        publisher.setName(name);
        publisherService.saveOrUpdatePublisher(publisher);
        logger.info("erro" + publisher);
        return ResponseEntity.ok(publisher);
    }
}
