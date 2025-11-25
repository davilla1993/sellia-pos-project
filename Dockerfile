# ========================================
# Stage 1: Build Frontend (Angular)
# ========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY sellia-app/package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend source
COPY sellia-app/ ./

# Build Angular app for production
RUN npm run build -- --configuration production

# ========================================
# Stage 2: Build Backend (Spring Boot)
# ========================================
FROM maven:3.9-eclipse-temurin-21 AS backend-builder

WORKDIR /app/backend

# Copy Maven files
COPY sellia-backend/pom.xml ./
COPY sellia-backend/mvnw ./
COPY sellia-backend/.mvn ./.mvn

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy backend source
COPY sellia-backend/src ./src

# Copy frontend build into Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist/sellia-app/browser ./src/main/resources/static

# Build Spring Boot application
RUN mvn clean package -DskipTests -B

# ========================================
# Stage 3: Runtime (Production)
# ========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create directories for uploads
RUN mkdir -p /app/uploads/qrcodes /app/uploads/products /app/uploads/receipts && \
    chown -R spring:spring /app/uploads

# Copy JAR from builder
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Change ownership
RUN chown -R spring:spring /app

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
