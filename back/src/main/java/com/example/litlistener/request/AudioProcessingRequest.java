package com.example.litlistener.request;

public class AudioProcessingRequest {
    private String filePath;
    private String type;
    private double pitchFactor;
    private double amplificationFactor;
    private double compressionThreshold;
    private double compressionRatio;
    private double filterFrequency;
    private double filterBandwidth;

    // Getters and Setters
    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getType() { // Add getter for the type
        return type;
    }

    public void setType(String type) { // Add setter for the type
        this.type = type;
    }

    public double getPitchFactor() {
        return pitchFactor;
    }

    public void setPitchFactor(double pitchFactor) {
        this.pitchFactor = pitchFactor;
    }

    public double getAmplificationFactor() {
        return amplificationFactor;
    }

    public void setAmplificationFactor(double amplificationFactor) {
        this.amplificationFactor = amplificationFactor;
    }

    public double getCompressionThreshold() {
        return compressionThreshold;
    }

    public void setCompressionThreshold(double compressionThreshold) {
        this.compressionThreshold = compressionThreshold;
    }

    public double getCompressionRatio() {
        return compressionRatio;
    }

    public void setCompressionRatio(double compressionRatio) {
        this.compressionRatio = compressionRatio;
    }

    public double getFilterFrequency() {
        return filterFrequency;
    }

    public void setFilterFrequency(double filterFrequency) {
        this.filterFrequency = filterFrequency;
    }

    public double getFilterBandwidth() {
        return filterBandwidth;
    }

    public void setFilterBandwidth(double filterBandwidth) {
        this.filterBandwidth = filterBandwidth;
    }
}
