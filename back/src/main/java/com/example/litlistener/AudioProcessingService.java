package com.example.litlistener;

import com.example.litlistener.AudioProcessingRequest;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

@Service
public class AudioProcessingService {

    public String processAudio(AudioProcessingRequest request) throws Exception {
        System.out.println("Processing audio: " + request.getFilePath());
        File file = new File(request.getFilePath());
        if (!file.exists()) {
            throw new FileNotFoundException("File not found at path: " + request.getFilePath());
        }
        if (!file.canRead()) {
            throw new IOException("Cannot read file at path: " + request.getFilePath());
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
            // Generate the output file path for the "_pitch" file
            String outputFilePath;
            if (filePath.endsWith("_pitch.mp3")) {
                outputFilePath = filePath; // Use the same file if it already has _pitch
            } else {
                outputFilePath = filePath.replace(".mp3", "_pitch.mp3");
            }

            File outputFile = new File(outputFilePath);

            if (outputFile.exists()) {
                System.out.println("Overwriting existing file: " + outputFilePath);
            }
            // Use FFmpeg to process the file
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-filter:a", "asetrate=" + (44100 * pitchFactor), outputFilePath);
            runProcess(pb);

            System.out.println("Processed file path: " + outputFilePath);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error adjusting pitch: " + e.getMessage());
        }
    }

    private String amplifyAudio(String filePath, double amplificationFactor) {
        System.out.println("Adjusting amplificationFactor for: " + filePath + " with factor: " + amplificationFactor);
        try {
            String outputFilePath;
            if (filePath.endsWith("_pitch.mp3")) {
                outputFilePath = filePath; // Use the same file if it already has _pitch
            } else {
                outputFilePath = filePath.replace(".mp3", "_pitch.mp3");
            }

            File outputFile = new File(outputFilePath);

            if (outputFile.exists()) {
                System.out.println("Overwriting existing file: " + outputFilePath);
            }
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-filter:a", "volume=" + amplificationFactor, outputFilePath);
            runProcess(pb);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error amplifying audio: " + e.getMessage());
        }
    }

    private String compressAudio(String filePath, double threshold, double ratio) {
        System.out.println("Adjusting Compress audio for: " + filePath + " with factor: " + threshold + " & " + ratio);
        try {
            String outputFilePath;
            if (filePath.endsWith("_pitch.mp3")) {
                outputFilePath = filePath; // Use the same file if it already has _pitch
            } else {
                outputFilePath = filePath.replace(".mp3", "_pitch.mp3");
            }

            File outputFile = new File(outputFilePath);

            if (outputFile.exists()) {
                System.out.println("Overwriting existing file: " + outputFilePath);
            }
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-filter:a",
                    "acompressor=threshold=" + threshold + ":ratio=" + ratio,
                    outputFilePath);
            runProcess(pb);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error compressing audio: " + e.getMessage());
        }
    }

    private String filterAudio(String filePath, double frequency, double bandwidth) {
        System.out.println(
                "Adjusting frequency filter for: " + filePath + " with factor: " + frequency + " & " + bandwidth);
        try {
            String outputFilePath;
            if (filePath.endsWith("_pitch.mp3")) {
                outputFilePath = filePath; // Use the same file if it already has _pitch
            } else {
                outputFilePath = filePath.replace(".mp3", "_pitch.mp3");
            }

            File outputFile = new File(outputFilePath);

            if (outputFile.exists()) {
                System.out.println("Overwriting existing file: " + outputFilePath);
            }
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-filter:a",
                    "bandpass=f=" + frequency + ":width_type=h:w=" + bandwidth,
                    outputFilePath);
            runProcess(pb);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error filtering audio: " + e.getMessage());
        }
    }

    private String denoiseAudio(String filePath) {
        System.out.println("Adjusting Denoisingr for: " + filePath + " with factor Denoising");
        try {
            String outputFilePath;
            if (filePath.endsWith("_pitch.mp3")) {
                outputFilePath = filePath; // Use the same file if it already has _pitch
            } else {
                outputFilePath = filePath.replace(".mp3", "_pitch.mp3");
            }

            File outputFile = new File(outputFilePath);

            if (outputFile.exists()) {
                System.out.println("Overwriting existing file: " + outputFilePath);
            }
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-af", "afftdn", outputFilePath);
            runProcess(pb);
            return outputFilePath;
        } catch (Exception e) {
            throw new RuntimeException("Error denoising audio: " + e.getMessage());
        }
    }

    private void runProcess(ProcessBuilder pb) throws Exception {
        System.out.println("Run process");
        pb.redirectErrorStream(true);
        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            String error = new String(process.getErrorStream().readAllBytes());
            throw new RuntimeException("FFmpeg process failed with error: " + error);
        }
    }
}
