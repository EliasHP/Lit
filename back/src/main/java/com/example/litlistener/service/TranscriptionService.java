package com.example.litlistener.service;

import com.example.litlistener.entity.AudioFile;
import com.example.litlistener.AudioFileRepository;
import com.example.litlistener.request.TranscriptionRequest;
import com.example.litlistener.response.TranscriptionResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Repository;
import com.example.litlistener.entity.AudioFile;

@Service
public class TranscriptionService {

    @Autowired
    private AudioFileRepository audioFileRepository;

    public void saveTranscription(TranscriptionRequest request) {
        AudioFile audioFile = audioFileRepository.findByName(request.getFileName());
        if (audioFile == null) {
            throw new IllegalArgumentException("Audio file not found: " + request.getFileName());
        }

        audioFile.setFromField(request.getFrom());
        audioFile.setToField(request.getTo());
        audioFile.setTranscript(request.getTranscription());
        audioFileRepository.save(audioFile);
    }

    public TranscriptionResponse getTranscription(String fileName) {
        AudioFile audioFile = audioFileRepository.findByName(fileName);
        if (audioFile == null) {
            return null;
        }
        return new TranscriptionResponse(
                audioFile.getFromField(),
                audioFile.getToField(),
                audioFile.getTranscript(),
                audioFile.getWhisper());
    }
}