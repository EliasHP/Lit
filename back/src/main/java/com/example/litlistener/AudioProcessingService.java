package com.example.litlistener;

import com.example.litlistener.AudioProcessingRequest;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class AudioProcessingService {

    public String processAudio(AudioProcessingRequest request) throws Exception {
        if (request.getFilePath() == null || request.getFilePath().isEmpty()) {
            throw new IllegalArgumentException("File path cannot be null or empty.");
        }
        if (!isValidFile(request.getFilePath())) {
            throw new IllegalArgumentException("Invalid file: " + request.getFilePath());
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

    private boolean isValidFile(String filePath) {
        File file = new File(filePath);
        return file.exists() && file.isFile();
    }

    private String adjustPitch(String filePath, double pitchFactor) {
        try {
            String outputFilePath = filePath.replace(".mp3", "_pitch.mp3");
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-i", filePath, "-filter:a", "asetrate=" + (44100 * pitchFactor), outputFilePath);
            runProcess(pb);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error adjusting pitch: " + e.getMessage());
        }
    }

    private String amplifyAudio(String filePath, double amplificationFactor) {
        try {
            String outputFilePath = filePath.replace(".mp3", "_amplified.mp3");
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-i", filePath, "-filter:a", "volume=" + amplificationFactor, outputFilePath);
            runProcess(pb);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error amplifying audio: " + e.getMessage());
        }
    }

    private String compressAudio(String filePath, double threshold, double ratio) {
        try {
            String outputFilePath = filePath.replace(".mp3", "_compressed.mp3");
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-i", filePath, "-filter:a", "acompressor=threshold=" + threshold + ":ratio=" + ratio,
                    outputFilePath);
            runProcess(pb);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error compressing audio: " + e.getMessage());
        }
    }

    private String filterAudio(String filePath, double frequency, double bandwidth) {
        try {
            String outputFilePath = filePath.replace(".mp3", "_filtered.mp3");
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-i", filePath, "-filter:a", "bandpass=f=" + frequency + ":width_type=h:w=" + bandwidth,
                    outputFilePath);
            runProcess(pb);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error filtering audio: " + e.getMessage());
        }
    }

    private String denoiseAudio(String filePath) {
        try {
            String outputFilePath = filePath.replace(".mp3", "_denoised.mp3");
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-i", filePath, "-af", "afftdn", outputFilePath);
            runProcess(pb);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error denoising audio: " + e.getMessage());
        }
    }

    private void runProcess(ProcessBuilder pb) throws Exception {
        pb.redirectErrorStream(true);
        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            String error = new String(process.getErrorStream().readAllBytes());
            throw new RuntimeException("FFmpeg process failed with error: " + error);
        }
    }
}
