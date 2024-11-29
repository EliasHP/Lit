package com.example.litlistener;

public class AudioProcessingResponse {
    private String processedFilePath;

    public AudioProcessingResponse(String processedFilePath) {
        this.processedFilePath = processedFilePath;
    }

    public String getProcessedFilePath() {
        return processedFilePath;
    }

    public void setProcessedFilePath(String processedFilePath) {
        this.processedFilePath = processedFilePath;
    }
}
