# beaglegaze-web
A Web Dashboard for viewing your usage and consumption of Beaglegaze-enabled Libraries.

## Overview

This is a Spring Boot web application that provides REST APIs for managing and viewing library usage data. The application is designed to track usage patterns and consumption metrics of Beaglegaze-enabled libraries.

## Features

- RESTful API for library usage data management
- PostgreSQL database integration
- Health and metrics endpoints via Spring Boot Actuator
- Docker support for easy development setup

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Docker and Docker Compose (for PostgreSQL)

## Quick Start

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will start a PostgreSQL database with the following credentials:
- Database: `beaglegaze`
- Username: `beaglegaze`
- Password: `beaglegaze`
- Port: `5432`

### 2. Run the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 3. Test the Application

Check if the application is running:
```bash
curl http://localhost:8080/api/health
```

## API Endpoints

### Health & Info
- `GET /api/health` - Application health check
- `GET /api/info` - Application information
- `GET /actuator/health` - Spring Boot health endpoint

### Library Usage Management
- `GET /api/library-usage` - Get all library usages
- `GET /api/library-usage/{id}` - Get usage by ID
- `GET /api/library-usage/library/{libraryName}` - Get usages by library name
- `GET /api/library-usage/project/{projectName}` - Get usages by project name
- `GET /api/library-usage/top-used` - Get most used methods
- `GET /api/library-usage/recent` - Get recently used methods
- `POST /api/library-usage` - Create new usage record
- `PUT /api/library-usage/{id}` - Update usage record
- `DELETE /api/library-usage/{id}` - Delete usage record

## Example Usage

### Create a new library usage record:
```bash
curl -X POST http://localhost:8080/api/library-usage \
  -H "Content-Type: application/json" \
  -d '{
    "libraryName": "spring-boot-starter-web",
    "version": "3.2.0",
    "projectName": "beaglegaze-web",
    "methodName": "SpringApplication.run",
    "usageCount": 1,
    "metadata": "Application startup"
  }'
```

### Get all library usages:
```bash
curl http://localhost:8080/api/library-usage
```

## Development

### Running Tests
```bash
mvn test
```

### Building the Application
```bash
mvn clean package
```

### Database Schema
The application automatically creates the following table:
- `library_usage` - Stores library usage data with fields for library name, version, project name, method name, usage count, and timestamps.

## Configuration

The application can be configured via `src/main/resources/application.yml`. Key configurations include:

- Database connection settings
- Server port (default: 8080)
- JPA/Hibernate settings
- Logging levels
