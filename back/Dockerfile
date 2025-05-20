FROM eclipse-temurin:17-jdk-alpine

ENV TZ=Asia/Seoul

# (선택) 작업 디렉토리 설정
WORKDIR /app

# JAR 복사
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# Cloud Run이 내부적으로 8080 포트를 헬스 체크 대상으로 사용하므로 반드시 명시
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-Dspring.output.ansi.enabled=ALWAYS", "-jar", "app.jar"]
