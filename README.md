# Library Management System

## Overview
The Library Management System is a comprehensive solution for managing a university library. It includes a mobile application for students and a web-based admin portal for library staff. The system streamlines the process of searching for, reserving, and managing books.

## Features
### Mobile Application (React Native)
- **Search Books**: Allows students to search for books by title, author, or ISBN.
- **Check Availability**: Displays the availability status of each book.
- **Reserve Books**: Enables students to reserve books online.
- **Account Management**: Provides functionality for students to view and manage their library accounts.

### Admin Website (Spring Web)
- **Inventory Management**: Allows library staff to add, update, and delete book records.
- **Borrow and Return Tracking**: Tracks which books are borrowed, returned, and overdue.
- **User Management**: Manages student and staff accounts.
- **Reporting**: Generates reports on library usage, book circulation, and more.
- **Security**: Implements user authentication and authorization using JWT.

## Technologies Used
- **React Native**: For developing the cross-platform mobile application.
- **Spring Web**: For building the backend admin portal.
- **Java**: Core language for backend development.
- **MySQL**: Database management for storing and retrieving book and user information.
- **JWT**: For secure user authentication and session management.
- **RESTful APIs**: To enable communication between the mobile application and the backend server.

## Installation
### Prerequisites
- **Java 17**: Ensure Java is installed and the environment variable is set.
- **Node.js**: Required for React Native development.
- **MySQL**: Database for storing application data.

### Backend (Admin Website)
1. **Clone the repository:**
   ```sh
   git clone https://github.com/manhha5842/Library_System.git
   cd Library_System/Server
