package com.beaglegaze.web.controller;

import com.beaglegaze.web.entity.LibraryUsage;
import com.beaglegaze.web.service.LibraryUsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/library-usage")
@CrossOrigin(origins = "*")
public class LibraryUsageController {

    @Autowired
    private LibraryUsageService libraryUsageService;

    @GetMapping
    public ResponseEntity<List<LibraryUsage>> getAllUsages() {
        List<LibraryUsage> usages = libraryUsageService.getAllUsages();
        return ResponseEntity.ok(usages);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibraryUsage> getUsageById(@PathVariable Long id) {
        Optional<LibraryUsage> usage = libraryUsageService.getUsageById(id);
        return usage.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/library/{libraryName}")
    public ResponseEntity<List<LibraryUsage>> getUsagesByLibrary(@PathVariable String libraryName) {
        List<LibraryUsage> usages = libraryUsageService.getUsagesByLibrary(libraryName);
        return ResponseEntity.ok(usages);
    }

    @GetMapping("/project/{projectName}")
    public ResponseEntity<List<LibraryUsage>> getUsagesByProject(@PathVariable String projectName) {
        List<LibraryUsage> usages = libraryUsageService.getUsagesByProject(projectName);
        return ResponseEntity.ok(usages);
    }

    @GetMapping("/top-used")
    public ResponseEntity<List<LibraryUsage>> getTopUsedMethods() {
        List<LibraryUsage> usages = libraryUsageService.getTopUsedMethods();
        return ResponseEntity.ok(usages);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<LibraryUsage>> getRecentlyUsed() {
        List<LibraryUsage> usages = libraryUsageService.getRecentlyUsed();
        return ResponseEntity.ok(usages);
    }

    @PostMapping
    public ResponseEntity<LibraryUsage> createUsage(@RequestBody LibraryUsage usage) {
        try {
            LibraryUsage savedUsage = libraryUsageService.saveUsage(usage);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUsage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibraryUsage> updateUsage(@PathVariable Long id, @RequestBody LibraryUsage usage) {
        try {
            LibraryUsage updatedUsage = libraryUsageService.updateUsage(id, usage);
            return ResponseEntity.ok(updatedUsage);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsage(@PathVariable Long id) {
        try {
            libraryUsageService.deleteUsage(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}