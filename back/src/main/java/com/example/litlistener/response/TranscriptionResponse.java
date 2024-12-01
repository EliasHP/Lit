package com.example.litlistener.response;

public class TranscriptionResponse {
    private String from;
    private String to;
    private String transcription;
    private String whisper;
    private String tag;
    private String field;

    // Constructor
    public TranscriptionResponse(String from, String to, String transcription, String whisper, String tag,
            String field) {
        this.from = from;
        this.to = to;
        this.transcription = transcription;
        this.whisper = whisper;
        this.tag = tag;
        this.field = field;
    }

    // Getters and Setters
    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getTranscription() {
        return transcription;
    }

    public void setTranscription(String transcription) {
        this.transcription = transcription;
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
