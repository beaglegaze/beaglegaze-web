package com.beaglegaze.web.repository;

import com.beaglegaze.web.entity.LibraryUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryUsageRepository extends JpaRepository<LibraryUsage, Long> {

    List<LibraryUsage> findByLibraryName(String libraryName);
    
    List<LibraryUsage> findByProjectName(String projectName);
    
    @Query("SELECT l FROM LibraryUsage l WHERE l.libraryName = :libraryName AND l.version = :version")
    List<LibraryUsage> findByLibraryNameAndVersion(@Param("libraryName") String libraryName, 
                                                   @Param("version") String version);
    
    @Query("SELECT l FROM LibraryUsage l ORDER BY l.usageCount DESC")
    List<LibraryUsage> findTopUsedMethods();
    
    @Query("SELECT l FROM LibraryUsage l ORDER BY l.lastUsed DESC")
    List<LibraryUsage> findRecentlyUsed();
}