# Option 2: Use Debian-based OpenJDK image
FROM openjdk:23-jdk-slim
# Install ffmpeg on Debian/Ubuntu
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the JAR file into the container
COPY target/litlistener-0.0.1-SNAPSHOT.jar app.jar
COPY wait-for-mysql.sh /wait-for-mysql.sh
RUN chmod +x /wait-for-mysql.sh

# Expose the port that Spring Boot will run on
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]

