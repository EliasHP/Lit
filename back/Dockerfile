# Use a base image with Java installed
FROM openjdk:23-jdk

# Set the working directory in the container
WORKDIR /app

# Copy the JAR file into the container
COPY target/litlistener-0.0.1-SNAPSHOT.jar app.jar
COPY wait-for-mysql.sh /wait-for-mysql.sh
RUN chmod +x /wait-for-mysql.sh
CMD ["./wait-for-mysql.sh", "java", "-jar", "app.jar"]

# Expose the port that Spring Boot will run on
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]