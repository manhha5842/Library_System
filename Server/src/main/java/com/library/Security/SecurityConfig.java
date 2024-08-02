package com.library.Security;

import com.library.Service.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private CustomOAuth2UserService oAuth2UserService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomOAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Autowired
    private CustomAuthenticationFailureHandler customAuthenticationFailureHandler;

    @Configuration
    @Order(1)
    public static class ApiWebSecurityConfiguration {

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        @Bean
        public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
            http
                    .securityMatcher("/api/**") // Chỉ áp dụng cho các endpoint API
                    .csrf(AbstractHttpConfigurer::disable)
                    .sessionManagement(session -> session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers(("/api/public/**")).permitAll()
                            .requestMatchers("/api/**").authenticated()
                    )
                    .addFilterBefore(new JwtTokenFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
                    .exceptionHandling(exceptionHandling ->
                            exceptionHandling.authenticationEntryPoint((request, response, authException) ->
                                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED))); // Chuyển lỗi xác thực cho API về 401

            return http.build();
        }
    }

    @Configuration
    @Order(2)
    public static class FormWebSecurityConfiguration {

        @Autowired
        private CustomOAuth2UserService oAuth2UserService;

        @Autowired
        private CustomOAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

        @Autowired
        private CustomAuthenticationFailureHandler customAuthenticationFailureHandler;

        @Bean
        public SecurityFilterChain formSecurityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(csrf -> csrf
                            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                            .ignoringRequestMatchers("/api/**"))
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/login", "/login/**", "/assets/**", "/error", "/oauth2/**","/**").permitAll()
                            .anyRequest().authenticated())
                    .exceptionHandling(exceptionHandling ->
                            exceptionHandling.accessDeniedPage("/login"))
                    .formLogin(form -> form
                            .loginPage("/login")
                            .permitAll())
                    .logout(logout -> logout
                            .logoutUrl("/perform_logout")
                            .logoutSuccessUrl("/logged_out")
                            .invalidateHttpSession(true)
                            .deleteCookies("JSESSIONID")
                            .permitAll())
                    .oauth2Login(oauth2 -> oauth2
                            .loginPage("/login")
                            .userInfoEndpoint(userInfo -> userInfo
                                    .userService(oAuth2UserService))
                            .successHandler(oAuth2LoginSuccessHandler)
                            .failureHandler(customAuthenticationFailureHandler));

            return http.build();
        }
    }
}