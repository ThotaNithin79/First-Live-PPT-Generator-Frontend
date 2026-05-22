# SBA Bulk PPT Generator

## Overview

SBA Bulk PPT Generator is a full-stack media presentation automation platform developed for internal business operations at Sri Balaji Ads.

The application was designed to automate bulk PowerPoint generation for advertising media assets and significantly reduce manual effort involved in client presentation preparation.

The system manages a large media asset database containing 10,000+ assets and enables efficient filtering, media management, and automated presentation generation.

---

# Key Features

## Media Asset Management

* Manage and organize 10,000+ advertising media assets.
* Search and filter media based on:

  * Media type
  * Location
  * Client requirements
  * Availability
  * Categories
* Optimized asset retrieval for faster response times.

## Bulk PPT Generation

* Automated PowerPoint generation using Apache POI.
* Generate multiple client presentations within minutes.
* Reduced manual PPT creation effort significantly.
* Dynamic slide population with media details and images.

## Performance Optimization

* Reduced API response time by ~60% using:

  * Query optimization
  * Indexed database lookups
  * DTO-based lightweight responses
  * Efficient filtering strategies

## Role-Based Access Control (RBAC)

* Secure access management based on user roles.
* Controlled operations and feature visibility.

## File & Image Handling

* Upload and manage media-related images and files.
* Integrated asset preview functionality.

---

# Tech Stack

## Frontend

* React.js
* HTML5
* CSS3
* JavaScript

## Backend

* Java
* Spring Boot
* REST APIs
* Hibernate / JPA

## Database

* MySQL

## Tools & Libraries

* Apache POI
* Git
* Postman
* IntelliJ IDEA
* VS Code

---

# Architecture Overview

The application follows a layered architecture:

Frontend (React.js)
↓
REST API Layer
↓
Spring Boot Backend
↓
Hibernate / JPA
↓
MySQL Database

---

# Core Functionalities

## PPT Generation Workflow

1. User selects required media assets.
2. System fetches optimized media data.
3. Media details and images are processed dynamically.
4. Apache POI generates PowerPoint slides automatically.
5. Final presentations are exported in bulk.

---

# API Optimization Highlights

The project involved optimizing APIs handling large asset datasets.

Optimization strategies included:

* Database indexing
* Reduced unnecessary entity loading
* DTO projections
* Pagination support
* SQL-level filtering
* Optimized query structures

Result:

* Improved overall API response performance by approximately 60%.

---

# Apache POI Integration

Apache POI was used to automate PowerPoint presentation generation.

Features implemented:

* Dynamic slide creation
* Automated image insertion
* Text formatting
* Bulk PPT export
* Template-based presentation generation

Business Impact:

* Eliminated repetitive manual PPT creation.
* Reduced turnaround time from days to minutes.

---

# Screenshots

## Media Asset Listing
<img width="1600" height="828" alt="image" src="https://github.com/user-attachments/assets/91bf7a9a-3d7a-40bb-b7e7-029e7ee87b06" />

## Quotation Creation

*Add quotation creation screenshot here*

## PPT Generation

*Add PPT generation screenshot here*

## Generated Presentation

*Add generated PPT screenshot here*

---

# Installation & Setup

## Clone Repository

```bash
git clone <your-repository-url>
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

## Backend Setup

```bash
cd backend
```

Configure database properties in:

```text
application.properties
```

Run Spring Boot application.

Backend runs on:

```text
http://localhost:8080
```

---

# Database Configuration

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/database_name
spring.datasource.username=root
spring.datasource.password=your_password
```

---

# Future Improvements

* JWT Authentication
* Cloud Storage Integration
* Export to PDF
* Advanced Analytics Dashboard
* Media Availability Calendar
* Docker Deployment
* Caching Layer Integration

---

# Business Impact

* Automated bulk presentation generation.
* Reduced repetitive manual PPT creation effort.
* Improved operational efficiency.
* Faster client deliverable preparation.
* Simplified large-scale media presentation workflows.

---

# Author

## Nithin Thota

Java Full Stack Developer

* GitHub: (https://github.com/ThotaNithin79)
* LinkedIn: (https://www.linkedin.com/in/nithin-thota-359811289/)

---

# License

This project is intended for educational and portfolio demonstration purposes.
