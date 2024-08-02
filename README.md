# Library Management System

## Overview
The Library Management System is a comprehensive solution designed for university libraries. It consists of a mobile application for students and staff, and an admin website for library management.

## Features
### Mobile Application (React Native)
- **User Authentication**: Secure login and registration for users.
- **Book Search**: Search for books by title, author, or category.
- **Reservation Management**: Reserve books and receive notifications for due dates.
- **Push Notifications**: Reminders for due dates and important announcements.

### Admin Website (Spring Boot)
- **User Management**: Manage student and staff accounts with role-based access control.
- **Book Inventory**: Perform CRUD operations on the library's book inventory.
- **Loan Management**: Oversee book loans, returns, and track overdue items.
- **Analytics Dashboard**: Visualize library usage statistics with interactive charts.
- **Security**: Implement JWT authentication and Spring Security for a secure application.

## Technologies Used
### Mobile Application
- **React Native**: For building cross-platform mobile applications.
- **JavaScript**: Programming language used with React Native.

### Admin Website
- **Spring Boot**: Framework for building the backend application.
- **Spring Data JPA**: For database interactions.
- **Spring Security**: For securing the application.
- **MySQL**: Database management system.

### Other Tools
- **Maven**: For project build and dependency management.
- **JUnit**: For testing the application.

## Installation

### Mobile Application
1. **Clone the repository:**
   ```sh
   git clone https://github.com/manhha5842/Library_System.git
   cd Library_System/Mobile
2. **Install dependencies:**
   ```sh
   npm install
4. **Run the application:**
   ```sh
   npx react-native run-android # for Android
   npx react-native run-ios # for iOS

### Admin Website 
1. **Clone the repository:**
   ```sh
   git clone https://github.com/manhha5842/Library_System.git
   cd Library_System/Server
2. **Setup the database:**
   Create a MySQL database named library_system.
   Update the src/main/resources/application.properties file with your database credentials.
4. **Build and run the application:**
      ```sh
   ./mvnw clean install
   ./mvnw spring-boot:run
