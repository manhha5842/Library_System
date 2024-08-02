package com.library.Controller.Admin;

import com.library.Model.Enum.FeedbackStatus;
import com.library.Model.Enum.RenewalRecordStatus;
import com.library.Model.UserInformation;
import com.library.Repository.LibrarianRepository;
import com.library.Service.FeedbackService;
import com.library.Service.RenewalRecordService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.Map;

@ControllerAdvice
public class GlobalControllerAdvice {

    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    @Autowired
    private LibrarianRepository librarianRepository;
    private final FeedbackService feedbackService;
    @Autowired
    private RenewalRecordService renewalRecordService;

    public GlobalControllerAdvice(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @ModelAttribute("userInfo")
    public UserInformation userEmail(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User oauthUser) {
            UserInformation userInfo = new UserInformation();
            Map<String, Object> attributes = oauthUser.getAttributes();
            userInfo.setSub((String) attributes.get("sub"));
            userInfo.setPicture((String) attributes.get("picture"));
            userInfo.setEmail((String) attributes.get("email"));
            userInfo.setEmailVerified((Boolean) attributes.get("email_verified"));
            userInfo.setHd((String) attributes.get("hd"));
            userInfo.setName(librarianRepository.findByEmail(userInfo.getEmail()).get().getName());
            return userInfo;
        }
        return null;
    }
    @ModelAttribute("newFeedback")
    public long newFeedback( ) {
        return feedbackService.getAllFeedbacks().stream()
                    .filter(copy -> ( copy.getStatus() == FeedbackStatus.NEW  ))
                    .count();
    }  @ModelAttribute("newRenewalRecord")
    public long newRenewalRecord( ) {
        return renewalRecordService.getRenewalRecordsByStatus(RenewalRecordStatus.PENDING).size();
    }


}