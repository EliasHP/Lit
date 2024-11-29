package com.example.litlistener.service;

import org.springframework.stereotype.Service;

import com.example.litlistener.request.AudioProcessingRequest;

import java.io.File;
import java.io.IOException;

@Service
public class AudioProcessingService {

    public String processAudio(AudioProcessingRequest request) throws Exception {
        System.out.println("Processing audio: " + request.getFilePath());
        File file = new File(request.getFilePath());
        if (!file.exists()) {
            throw new IOException("File not found: " + request.getFilePath());
        }

        switch (request.getType()) {
            case "pitch":
                return adjustPitch(request.getFilePath(), request.getPitchFactor());
            case "amplification":
                return amplifyAudio(request.getFilePath(), request.getAmplificationFactor());
            case "compression":
                return compressAudio(request.getFilePath(), request.getCompressionThreshold(),
                        request.getCompressionRatio());
            case "filter":
                return filterAudio(request.getFilePath(), request.getFilterFrequency(), request.getFilterBandwidth());
            case "denoise":
                return denoiseAudio(request.getFilePath());
            default:
                throw new IllegalArgumentException("Unknown processing type: " + request.getType());
        }
    }

    private String adjustPitch(String filePath, double pitchFactor) {
        System.out.println("Adjusting pitch for: " + filePath + " with factor: " + pitchFactor);

        try {
            String tempFilePath = generateTempFilePath(filePath, "_temp_pitch.mp3");

            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-filter:a", "asetrate=" + (44100 * pitchFactor), tempFilePath);

            runProcess(pb, tempFilePath);

            // Replace original file if it's already _pitch.mp3
            if (filePath.endsWith("_pitch.mp3")) {
                replaceFile(tempFilePath, filePath);
                return filePath;
            }

            return tempFilePath.replace("_temp", ""); // For new _pitch files
        } catch (Exception e) {
            throw new RuntimeException("Error adjusting pitch: " + e.getMessage());
        }
    }

    private String amplifyAudio(String filePath, double amplificationFactor) {
        System.out.println("Amplifying audio for: " + filePath + " with factor: " + amplificationFactor);

        try {
            String tempFilePath = generateTempFilePath(filePath, "_temp_amplified.mp3");

            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-filter:a", "volume=" + amplificationFactor, tempFilePath);

            runProcess(pb, tempFilePath);

            if (filePath.endsWith("_amplified.mp3")) {
                replaceFile(tempFilePath, filePath);
                return filePath;
            }

            return tempFilePath.replace("_temp", "");
        } catch (Exception e) {
            throw new RuntimeException("Error amplifying audio: " + e.getMessage());
        }
    }

    private String compressAudio(String filePath, double threshold, double ratio) {
        System.out.println(
                "Compressing audio for: " + filePath + " with threshold: " + threshold + " and ratio: " + ratio);

        try {
            String tempFilePath = generateTempFilePath(filePath, "_temp_compressed.mp3");

            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-filter:a",
                    "acompressor=threshold=" + threshold + ":ratio=" + ratio, tempFilePath);

            runProcess(pb, tempFilePath);

            if (filePath.endsWith("_compressed.mp3")) {
                replaceFile(tempFilePath, filePath);
                return filePath;
            }

            return tempFilePath.replace("_temp", "");
        } catch (Exception e) {
            throw new RuntimeException("Error compressing audio: " + e.getMessage());
        }
    }

    private String filterAudio(String filePath, double frequency, double bandwidth) {
        System.out.println(
                "Filtering audio for: " + filePath + " with frequency: " + frequency + " and bandwidth: " + bandwidth);

        try {
            String tempFilePath = generateTempFilePath(filePath, "_temp_filtered.mp3");

            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-filter:a",
                    "bandpass=f=" + frequency + ":width_type=h:w=" + bandwidth, tempFilePath);

            runProcess(pb, tempFilePath);

            if (filePath.endsWith("_filtered.mp3")) {
                replaceFile(tempFilePath, filePath);
                return filePath;
            }

            return tempFilePath.replace("_temp", "");
        } catch (Exception e) {
            throw new RuntimeException("Error filtering audio: " + e.getMessage());
        }
    }

    private String denoiseAudio(String filePath) {
        System.out.println("Denoising audio for: " + filePath);

        try {
            String tempFilePath = generateTempFilePath(filePath, "_temp_denoised.mp3");

            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-af", "afftdn", tempFilePath);

            runProcess(pb, tempFilePath);

            if (filePath.endsWith("_denoised.mp3")) {
                replaceFile(tempFilePath, filePath);
                return filePath;
            }

            return tempFilePath.replace("_temp", "");
        } catch (Exception e) {
            throw new RuntimeException("Error denoising audio: " + e.getMessage());
        }
    }

    private void runProcess(ProcessBuilder pb, String outputFilePath) throws Exception {
        System.out.println("Executing command: " + String.join(" ", pb.command()));

        pb.redirectErrorStream(true);
        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            String errorOutput = new String(process.getErrorStream().readAllBytes());
            System.err.println("FFmpeg error: " + errorOutput);
            throw new RuntimeException("FFmpeg process failed with error: " + errorOutput);
        }
    }

    private String generateTempFilePath(String filePath, String suffix) {
        return filePath.replace(".mp3", suffix);
    }

    private void replaceFile(String sourceFilePath, String targetFilePath) {
        System.out.println("Replacing file: " + targetFilePath + " with: " + sourceFilePath);

        File sourceFile = new File(sourceFilePath);
        File targetFile = new File(targetFilePath);

        if (targetFile.exists() && !targetFile.delete()) {
            throw new RuntimeException("Failed to delete existing file: " + targetFilePath);
        }

        if (!sourceFile.renameTo(targetFile)) {
            throw new RuntimeException("Failed to replace file: " + targetFilePath);
        }
    }
}
