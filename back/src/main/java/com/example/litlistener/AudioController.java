package com.example.litlistener;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audio")
public class AudioController {

    @Autowired
    private AudioFileRepository audioFileRepository;

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
}
