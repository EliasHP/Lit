package com.example.litlistener.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "audio_files")
public class AudioFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String path;

    @Column(nullable = true)
    private String toField; // Changed "To" to "toField" for Java compatibility

    @Column(nullable = true)
    private String fromField; // Changed "From" to "fromField"

    @Column(columnDefinition = "TEXT")
    private String transcript;

    @Column(columnDefinition = "TEXT")
    private String whisper;

    @Column(nullable = true)
    private String tag;

    @Column(nullable = true)
    private String field;

    // Default constructor (required by JPA)
    public AudioFile() {
    }

    // Constructor for initialization
    public AudioFile(String name, String path) {
        this.name = name;
        this.path = path;
    }

    // Constructor for all fields
    public AudioFile(String name, String path, String toField, String fromField, String transcript, String whisper,
            String tag, String field) {
        this.name = name;
        this.path = path;
        this.toField = toField;
        this.fromField = fromField;
        this.transcript = transcript;
        this.whisper = whisper;
        this.tag = tag;
        this.field = field;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getToField() {
        return toField;
    }

    public void setToField(String toField) {
        this.toField = toField;
    }

    public String getFromField() {
        return fromField;
    }

    public void setFromField(String fromField) {
        this.fromField = fromField;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }

    public String getWhisper() {
        return whisper;
    }

    public void setWhisper(String whisper) {
        this.whisper = whisper;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }
}
