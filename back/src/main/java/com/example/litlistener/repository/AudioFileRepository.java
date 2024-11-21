package com.example.litlistener.repository;

import com.example.litlistener.entity.AudioFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AudioFileRepository extends JpaRepository<AudioFile, Long> {
    AudioFile findByName(String name);
}
