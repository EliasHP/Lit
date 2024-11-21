package com.example.litlistener;

import java.io.File;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.example.litlistener.service.StartupService;

@SpringBootApplication
public class LitListenerApplication implements CommandLineRunner {

	@Autowired
	private StartupService startupService;

	private static final Logger logger = LoggerFactory.getLogger(LitListenerApplication.class);

	public static void main(String[] args) {
		System.out.println("CommandLineRunner.run() has been invoked! in static void");
		logger.info("Starting LitListenerApplication main method...");
		SpringApplication.run(LitListenerApplication.class, args);
		logger.info("LitListenerApplication main method has completed.");
	}

	@Override
	public void run(String... args) throws Exception {
		System.out.println("CommandLineRunner.run() has been invoked!");
		logger.info("CommandLineRunner.run() method is starting...");
		String audioFolderPath = "/app/audio"; // Path inside the container
		logger.info("Audio folder path: {}", new File(audioFolderPath).getAbsolutePath());
		startupService.synchronizeAudioFolder(audioFolderPath);
		logger.info("CommandLineRunner.run() method has completed.");
	}
}
