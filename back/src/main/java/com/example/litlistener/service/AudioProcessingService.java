package com.example.litlistener.service;

import org.springframework.stereotype.Service;
import com.example.litlistener.request.AudioProcessingRequest;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class AudioProcessingService {
    private boolean isValidPitchFactor(double pitchFactor) {
        // Allow pitch factor between 0.5 and 2.0
        return pitchFactor > 0.5 && pitchFactor < 2.0;
    }

    private boolean isValidAmplificationFactor(double amplificationFactor) {
        // Allow amplification between 0.1 and 5.0
        return amplificationFactor > 0.1 && amplificationFactor < 5.0;
    }

    private boolean isValidCompression(double threshold, double ratio) {
        // Adjusted threshold range to match FFmpeg requirements
        return threshold >= 0.000976563 && threshold <= 0 && ratio >= 1 && ratio <= 20;
    }

    private boolean isValidFiltering(double frequency, double bandwidth) {
        // Allow frequency between 20 and 20000, bandwidth between 10 and 1000
        return frequency >= 20 && frequency <= 20000 && bandwidth >= 10 && bandwidth <= 1000;
    }

    public String processAudio(AudioProcessingRequest request) throws Exception {
        // Validate input file path
        String localFilePath = validateAndResolveFilePath(request.getFilePath());

        System.out.println("Processing audio: " + localFilePath);
        File file = new File(localFilePath);

        if (!file.exists()) {
            throw new IOException("File not found: " + localFilePath);
        }

        // Ensure the base file name
        String currentFilePath = cleanupName(localFilePath);

        // Apply pitch adjustment if specified
        if (isValidPitchFactor(request.getPitchFactor())) {
            System.out.println("Adjusting pitch for: " + currentFilePath);
            currentFilePath = processWithFFmpeg(currentFilePath,
                    Arrays.asList("-filter:a", "asetrate=" + (44100 * request.getPitchFactor())));
        }

        // Apply amplification if specified
        if (isValidAmplificationFactor(request.getAmplificationFactor())) {
            System.out.println("Amplifying audio for: " + currentFilePath);
            currentFilePath = processWithFFmpeg(currentFilePath,
                    Arrays.asList("-filter:a", "volume=" + request.getAmplificationFactor()));
        }

        // Apply compression if specified
        if (isValidCompression(request.getCompressionThreshold(), request.getCompressionRatio())) {
            System.out.println("Compressing audio for: " + currentFilePath);
            currentFilePath = processWithFFmpeg(currentFilePath,
                    Arrays.asList("-filter:a", "acompressor=threshold=" + request.getCompressionThreshold() +
                            ":ratio=" + request.getCompressionRatio()));
        }

        // Apply filtering if specified
        if (isValidFiltering(request.getFilterFrequency(), request.getFilterBandwidth())) {
            System.out.println("Filtering audio for: " + currentFilePath);
            currentFilePath = processWithFFmpeg(currentFilePath,
                    Arrays.asList("-filter:a", "bandpass=f=" + request.getFilterFrequency() +
                            ":width_type=h:w=" + request.getFilterBandwidth()));
        }

        // Rename the final output back to the original denoised file name
        return cleanupName(currentFilePath);
    }

    private String cleanupName(String filePath) {
        // If the file ends with "_denoised.mp3", strip and return the base name
        if (filePath.endsWith("_denoised.mp3")) {
            return filePath;
        }

        // Otherwise, add "_denoised.mp3" to the base name
        String cleanPath = filePath.replace(".mp3", "_denoised.mp3");

        File sourceFile = new File(filePath);
        File targetFile = new File(cleanPath);

        if (!sourceFile.renameTo(targetFile)) {
            throw new RuntimeException("Failed to rename file: " + filePath + " to: " + cleanPath);
        }

        System.out.println("File renamed to: " + cleanPath);
        return cleanPath;
    }

    private String processWithFFmpeg(String inputFilePath, List<String> filterArgs) throws Exception {
        String tempFilePath = inputFilePath.replace("_denoised.mp3", "_temp.mp3");

        List<String> command = new ArrayList<>(Arrays.asList("ffmpeg", "-y", "-i", inputFilePath));
        command.addAll(filterArgs);
        command.add(tempFilePath);

        System.out.println("Executing command: " + String.join(" ", command));

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg process failed with exit code: " + exitCode);
        }

        // Rename the temp file back to the denoised name for subsequent processing
        File tempFile = new File(tempFilePath);
        File finalFile = new File(inputFilePath);

        if (!tempFile.renameTo(finalFile)) {
            throw new RuntimeException("Failed to rename temp file: " + tempFilePath + " to: " + inputFilePath);
        }

        System.out.println("Processed file saved as: " + inputFilePath);
        return inputFilePath;
    }

    private String validateAndResolveFilePath(String filePath) {
        if (filePath == null || filePath.trim().isEmpty()) {
            throw new IllegalArgumentException("File path cannot be null or empty");
        }

        // If it's a URL, extract the filename
        if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
            try {
                @SuppressWarnings("deprecation")
                URL url = new URL(filePath);
                return "/app/audio/" + Paths.get(url.getPath()).getFileName();
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid URL: " + filePath);
            }
        }

        return filePath;
    }
}