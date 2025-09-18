package com.beaglegaze.web.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "library_usage")
public class LibraryUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String libraryName;

    @Column(nullable = false)
    private String version;

    @Column(nullable = false)
    private String projectName;

    @Column(nullable = false)
    private String methodName;

    @Column(nullable = false)
    private Long usageCount;

    @Column(nullable = false)
    private LocalDateTime lastUsed;

    @Column
    private String metadata;

    // Default constructor
    public LibraryUsage() {}

    // Constructor
    public LibraryUsage(String libraryName, String version, String projectName, 
                       String methodName, Long usageCount, LocalDateTime lastUsed) {
        this.libraryName = libraryName;
        this.version = version;
        this.projectName = projectName;
        this.methodName = methodName;
        this.usageCount = usageCount;
        this.lastUsed = lastUsed;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLibraryName() {
        return libraryName;
    }

    public void setLibraryName(String libraryName) {
        this.libraryName = libraryName;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getMethodName() {
        return methodName;
    }

    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }

    public Long getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Long usageCount) {
        this.usageCount = usageCount;
    }

    public LocalDateTime getLastUsed() {
        return lastUsed;
    }

    public void setLastUsed(LocalDateTime lastUsed) {
        this.lastUsed = lastUsed;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}