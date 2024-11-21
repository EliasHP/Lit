package com.example.litlistener;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.io.File;

@RestController
@RequestMapping("/api/audio")
public class AudioController {

    @Autowired
    private AudioFileRepository audioFileRepository;

    @Autowired
    private AudioProcessingService audioProcessingService;

    // Create a new audio file
    @PostMapping
    public AudioFile createAudioFile(@RequestBody AudioFile audioFile) {
        return audioFileRepository.save(audioFile);
    }

    // Get all audio files
    @GetMapping
    public List<AudioFile> getAllAudioFiles() {
        return audioFileRepository.findAll();
    }

    // Process an audio file
    @PostMapping("/process")
    public ResponseEntity<Map<String, String>> processAudioFile(@RequestBody AudioProcessingRequest request) {
        try {
            if (request.getFilePath() == null || request.getFilePath().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File path is missing in the request."));
            }

            // Convert URL to a local file path
            String filePath = convertUrlToFilePath(request.getFilePath());
            File file = new File(filePath);

            if (!file.exists()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File not found: " + filePath));
            }

            // Update request with the server path
            request.setFilePath(filePath);
            System.out.println("We got here" + filePath);
            // Process the file
            String processedFilePath = audioProcessingService.processAudio(request);
            System.out.println("We got here 2" + processedFilePath);
            // Convert the processed file path to a URL
            String processedFileName = new File(processedFilePath).getName();
            String processedFileUrl = "http://localhost:8080/" + processedFileName;

            // Return JSON with the URL
            System.out.println("returning url as: " + processedFileUrl);
            return ResponseEntity.ok(Map.of("url", processedFileUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error processing audio: " + e.getMessage()));
        }
    }

    // Helper method to convert URL to file path
    private String convertUrlToFilePath(String url) {
        if (url == null || url.isEmpty()) {
            throw new IllegalArgumentException("URL is null or empty");
        }

        System.out.println("Converting URL to file path: " + url);

        String fileName = url.substring(url.lastIndexOf("/") + 1);
        String filePath = "/app/audio/" + fileName;

        System.out.println("File path resolved to: " + filePath);

        return filePath;
    }

}
