package com.beaglegaze.web.service;

import com.beaglegaze.web.entity.LibraryUsage;
import com.beaglegaze.web.repository.LibraryUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LibraryUsageService {

    @Autowired
    private LibraryUsageRepository libraryUsageRepository;

    public List<LibraryUsage> getAllUsages() {
        return libraryUsageRepository.findAll();
    }

    public Optional<LibraryUsage> getUsageById(Long id) {
        return libraryUsageRepository.findById(id);
    }

    public List<LibraryUsage> getUsagesByLibrary(String libraryName) {
        return libraryUsageRepository.findByLibraryName(libraryName);
    }

    public List<LibraryUsage> getUsagesByProject(String projectName) {
        return libraryUsageRepository.findByProjectName(projectName);
    }

    public List<LibraryUsage> getTopUsedMethods() {
        return libraryUsageRepository.findTopUsedMethods();
    }

    public List<LibraryUsage> getRecentlyUsed() {
        return libraryUsageRepository.findRecentlyUsed();
    }

    public LibraryUsage saveUsage(LibraryUsage usage) {
        if (usage.getLastUsed() == null) {
            usage.setLastUsed(LocalDateTime.now());
        }
        return libraryUsageRepository.save(usage);
    }

    public LibraryUsage updateUsage(Long id, LibraryUsage updatedUsage) {
        return libraryUsageRepository.findById(id)
                .map(usage -> {
                    usage.setLibraryName(updatedUsage.getLibraryName());
                    usage.setVersion(updatedUsage.getVersion());
                    usage.setProjectName(updatedUsage.getProjectName());
                    usage.setMethodName(updatedUsage.getMethodName());
                    usage.setUsageCount(updatedUsage.getUsageCount());
                    usage.setLastUsed(updatedUsage.getLastUsed());
                    usage.setMetadata(updatedUsage.getMetadata());
                    return libraryUsageRepository.save(usage);
                })
                .orElseThrow(() -> new RuntimeException("LibraryUsage not found with id " + id));
    }

    public void deleteUsage(Long id) {
        libraryUsageRepository.deleteById(id);
    }
}