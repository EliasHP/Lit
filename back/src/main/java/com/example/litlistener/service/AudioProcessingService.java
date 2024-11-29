package com.example.litlistener.service;

import org.springframework.stereotype.Service;
import com.example.litlistener.request.AudioProcessingRequest;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class AudioProcessingService {

    public String processAudio(AudioProcessingRequest request) throws Exception {
        System.out.println("Processing audio: " + request.getFilePath());
        File file = new File(request.getFilePath());
        if (!file.exists()) {
            throw new IOException("File not found: " + request.getFilePath());
        }

        // Check if the file is already a "_denoised.mp3" version
        String currentFilePath = file.getAbsolutePath();
        if (!currentFilePath.endsWith("_denoised.mp3")) {
            currentFilePath = createDenoisedCopy(file.getAbsolutePath());
        }

        // Apply processing steps
        if (isValidPitchFactor(request.getPitchFactor())) {
            System.out.println("Adjusting pitch for: " + currentFilePath);
            currentFilePath = processWithFFmpeg(currentFilePath,
                    Arrays.asList("-filter:a", "asetrate=" + (44100 * request.getPitchFactor())));
        }

        if (isValidAmplificationFactor(request.getAmplificationFactor())) {
            System.out.println("Amplifying audio for: " + currentFilePath);
            currentFilePath = processWithFFmpeg(currentFilePath,
                    Arrays.asList("-filter:a", "volume=" + request.getAmplificationFactor()));
        }
        /*
         * if (isValidCompression(request.getCompressionThreshold(),
         * request.getCompressionRatio())) {
         * System.out.println("Compressing audio for: " + currentFilePath);
         * currentFilePath = processWithFFmpeg(currentFilePath,
         * Arrays.asList("-filter:a", "acompressor=threshold=" +
         * request.getCompressionThreshold() +
         * ":ratio=" + request.getCompressionRatio()));
         * }
         */
        if (isValidFiltering(request.getFilterFrequency(), request.getFilterBandwidth())) {
            System.out.println("Filtering audio for: " + currentFilePath);
            currentFilePath = processWithFFmpeg(currentFilePath,
                    Arrays.asList("-filter:a", "bandpass=f=" + request.getFilterFrequency() +
                            ":width_type=h:w=" + request.getFilterBandwidth()));
        }

        // Return the final processed file path
        return currentFilePath;
    }

    private String createDenoisedCopy(String originalFilePath) throws IOException {
        String denoisedFilePath = originalFilePath.replace(".mp3", "_denoised.mp3");
        File denoisedFile = new File(denoisedFilePath);

        if (!denoisedFile.exists()) {
            Files.copy(new File(originalFilePath).toPath(), denoisedFile.toPath());
            System.out.println("Created denoised copy: " + denoisedFilePath);
        }

        return denoisedFilePath;
    }

    private String processWithFFmpeg(String inputFilePath, List<String> filterArgs) throws Exception {
        // Generate a temporary file for processing
        String tempFilePath = inputFilePath.replace("_denoised.mp3", "_temp.mp3");

        // Build the FFmpeg command
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

        // Replace the original input file with the temp file
        File tempFile = new File(tempFilePath);
        File originalFile = new File(inputFilePath);

        if (!tempFile.renameTo(originalFile)) {
            throw new RuntimeException("Failed to replace original file with temp file: " + tempFilePath);
        }

        return inputFilePath; // Return the updated file path
    }

    private boolean isValidPitchFactor(double pitchFactor) {
        return pitchFactor > 0.5 && pitchFactor < 2.0;
    }

    private boolean isValidAmplificationFactor(double amplificationFactor) {
        return amplificationFactor > 0.1 && amplificationFactor < 5.0;
    }

    private boolean isValidCompression(double threshold, double ratio) {
        return threshold >= -60 && threshold <= 0 && ratio >= 1 && ratio <= 20;
    }

    private boolean isValidFiltering(double frequency, double bandwidth) {
        return frequency >= 20 && frequency <= 20000 && bandwidth >= 10 && bandwidth <= 1000;
    }
}
