package com.example.litlistener.controller;

import com.example.litlistener.request.TranscriptionRequest;
import com.example.litlistener.response.TranscriptionResponse;
import com.example.litlistener.service.TranscriptionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transcriptions")
public class TranscriptionController {

    @Autowired
    private TranscriptionService transcriptionService;

    @PostMapping
    public ResponseEntity<String> saveTranscription(@RequestBody TranscriptionRequest request) {
        try {
            transcriptionService.saveTranscription(request);
            return ResponseEntity.ok("Transcription saved successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving transcription: " + e.getMessage());
        }
    }

    @GetMapping("/{fileName}")
    public ResponseEntity<TranscriptionResponse> getTranscription(@PathVariable String fileName) {
        try {
            TranscriptionResponse transcription = transcriptionService.getTranscription(fileName);
            if (transcription == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.ok(transcription);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
