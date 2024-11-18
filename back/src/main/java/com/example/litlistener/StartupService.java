package com.example.litlistener;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StartupService {

    @Autowired
    private AudioFileRepository audioFileRepository;

    public void synchronizeAudioFolder(String audioFolderPath) {
        File audioFolder = new File(audioFolderPath);

        if (!audioFolder.exists() || !audioFolder.isDirectory()) {
            System.err.println("Audio folder not found: " + audioFolderPath);
            return;
        }

        // List all files in the audio folder
        File[] audioFiles = audioFolder.listFiles();
        if (audioFiles == null) {
            System.out.println("No files found in the audio folder.");
            return;
        }

        // Get all existing file paths from the database
        List<String> databasePaths = audioFileRepository.findAll().stream()
                .map(AudioFile::getPath)
                .collect(Collectors.toList());

        // Check for new files to add to the database
        for (File file : audioFiles) {
            if (!databasePaths.contains(file.getAbsolutePath())) {
                // Add new file to database
                AudioFile newAudioFile = new AudioFile(file.getName(), file.getAbsolutePath());
                audioFileRepository.save(newAudioFile);
                System.out.println("New file added to the database: " + file.getName());

                // Queue file for Whisper processing (placeholder for actual logic)
                queueFileForProcessing(file);
            }
        }

        // Check for missing files in the folder
        List<String> folderPaths = List.of(audioFiles).stream()
                .map(File::getAbsolutePath)
                .collect(Collectors.toList());

        List<AudioFile> missingFiles = audioFileRepository.findAll().stream()
                .filter(audioFile -> !folderPaths.contains(audioFile.getPath()))
                .collect(Collectors.toList());

        if (!missingFiles.isEmpty()) {
            System.out.println("Missing files detected in the folder:");
            for (AudioFile missingFile : missingFiles) {
                System.out.println("- " + missingFile.getName());
                // Logic to notify frontend or handle deletion can be added later
            }
        }
    }

    private void queueFileForProcessing(File file) {
        // Placeholder: Implement logic to queue the file for Whisper transcription
        System.out.println("Queued for Whisper processing: " + file.getName());
    }
}
