FROM eclipse-temurin:17-jdk-alpine

ENV TZ=Asia/Seoul

COPY target/backend-0.0.1-SNAPSHOT.jar /app.jar

ENTRYPOINT ["java", "-Dspring.output.ansi.enabled=ALWAYS", "-jar", "/app.jar"]