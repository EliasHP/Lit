package com.example.litlistener.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.io.FilenameUtils;

import com.example.litlistener.entity.AudioFile;
import com.example.litlistener.repository.AudioFileRepository;
import com.example.litlistener.service.StartupService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private AudioFileRepository audioFileRepository;

    @Autowired
    private StartupService startupService;

    private static final String AUDIO_FOLDER_PATH = "/app/audio";

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadAudioFiles(@RequestParam("files") MultipartFile[] files) {
        System.out.println("Upload endpoint hit");
        try {
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue; // Skip empty files
                }

                // Ensure filename is not null or empty
                String originalFileName = file.getOriginalFilename();
                if (originalFileName == null || originalFileName.isEmpty()) {
                    throw new IllegalArgumentException("Invalid file: no filename provided");
                }

                // Check filename length
                String sanitizedFileName;
                if (originalFileName.length() >= 1 && originalFileName.length() <= 30) {
                    sanitizedFileName = originalFileName; // Retain original name
                } else {
                    // Sanitize and normalize the filename for longer names
                    sanitizedFileName = FilenameUtils.getName(originalFileName);
                    // Generate a unique filename to avoid collisions
                    sanitizedFileName = UUID.randomUUID() + "-" + sanitizedFileName;
                }

                // Validate file extension
                String extension = FilenameUtils.getExtension(sanitizedFileName).toLowerCase();
                if (!extension.equals("mp3")) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Only MP3 files are allowed."));
                }

                // Save the file to the audio folder
                Path targetLocation = Paths.get(AUDIO_FOLDER_PATH).resolve(sanitizedFileName);
                Files.createDirectories(targetLocation.getParent());
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                // Check if the file is already in the database
                if (!audioFileRepository.existsByName(sanitizedFileName)) {
                    // Add new file to the database
                    AudioFile newAudioFile = new AudioFile(
                            sanitizedFileName,
                            targetLocation.toAbsolutePath().toString());
                    audioFileRepository.save(newAudioFile);
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error",
                            "A file with the name '" + sanitizedFileName + "' already exists in the database."));
                }
            }

            // Synchronize the folder with the database
            startupService.synchronizeAudioFolder(AUDIO_FOLDER_PATH);

            return ResponseEntity.ok(Map.of("message", "Files uploaded successfully."));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload files: " + e.getMessage()));
        }
    }
}
