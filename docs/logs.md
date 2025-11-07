Starting deployment of davilla1993/sellia-pos-project.git:master to localhost.
2025-Nov-07 15:42:34.302882
Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.11
2025-Nov-07 15:42:34.449460
[CMD]: docker stop --time=30 fsc8s8ww8ow0484s8sgkg00s
2025-Nov-07 15:42:34.449460
Error response from daemon: No such container: fsc8s8ww8ow0484s8sgkg00s
2025-Nov-07 15:42:34.558084
[CMD]: docker rm -f fsc8s8ww8ow0484s8sgkg00s
2025-Nov-07 15:42:34.558084
Error response from daemon: No such container: fsc8s8ww8ow0484s8sgkg00s
2025-Nov-07 15:42:34.702732
[CMD]: docker run -d --network coolify --name fsc8s8ww8ow0484s8sgkg00s  --rm -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/coollabsio/coolify-helper:1.0.11
2025-Nov-07 15:42:34.702732
67a290a46fc656f9a1e86d17429009658840c4e0822a5bcce7444e63d158b2f4
2025-Nov-07 15:42:35.509141
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git ls-remote https://github.com/davilla1993/sellia-pos-project.git refs/heads/master'
2025-Nov-07 15:42:35.509141
bd69b8c17ade674649948c0b4eb71ea1279a9fc6	refs/heads/master
2025-Nov-07 15:42:35.534572
----------------------------------------
2025-Nov-07 15:42:35.545251
Importing davilla1993/sellia-pos-project.git:master (commit sha bd69b8c17ade674649948c0b4eb71ea1279a9fc6) to /artifacts/fsc8s8ww8ow0484s8sgkg00s.
2025-Nov-07 15:42:35.738997
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'git clone --depth=1 --recurse-submodules --shallow-submodules -b 'master' 'https://github.com/davilla1993/sellia-pos-project.git' '/artifacts/fsc8s8ww8ow0484s8sgkg00s' && cd '/artifacts/fsc8s8ww8ow0484s8sgkg00s' && if [ -f .gitmodules ]; then sed -i "s#git@\(.*\):#https://\1/#g" '/artifacts/fsc8s8ww8ow0484s8sgkg00s'/.gitmodules || true && git submodule sync && GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git submodule update --init --recursive --depth=1; fi && cd '/artifacts/fsc8s8ww8ow0484s8sgkg00s' && GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git lfs pull'
2025-Nov-07 15:42:35.738997
Cloning into '/artifacts/fsc8s8ww8ow0484s8sgkg00s'...
2025-Nov-07 15:42:37.048912
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'cd /artifacts/fsc8s8ww8ow0484s8sgkg00s && git log -1 bd69b8c17ade674649948c0b4eb71ea1279a9fc6 --pretty=%B'
2025-Nov-07 15:42:37.048912
Préparation du projet pour déployement
2025-Nov-07 15:42:37.731389
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'cat /artifacts/fsc8s8ww8ow0484s8sgkg00s/Dockerfile'
2025-Nov-07 15:42:37.731389
# ========================================
2025-Nov-07 15:42:37.731389
# Stage 1: Build Frontend (Angular)
2025-Nov-07 15:42:37.731389
# ========================================
2025-Nov-07 15:42:37.731389
FROM node:20-alpine AS frontend-builder
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
WORKDIR /app/frontend
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Copy frontend package files
2025-Nov-07 15:42:37.731389
COPY sellia-app/package*.json ./
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Install dependencies
2025-Nov-07 15:42:37.731389
RUN npm ci
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Copy frontend source
2025-Nov-07 15:42:37.731389
COPY sellia-app/ ./
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Build Angular app for production
2025-Nov-07 15:42:37.731389
RUN npm run build -- --configuration production
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# ========================================
2025-Nov-07 15:42:37.731389
# Stage 2: Build Backend (Spring Boot)
2025-Nov-07 15:42:37.731389
# ========================================
2025-Nov-07 15:42:37.731389
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
WORKDIR /app/backend
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Copy Maven files
2025-Nov-07 15:42:37.731389
COPY sellia-backend/pom.xml ./
2025-Nov-07 15:42:37.731389
COPY sellia-backend/mvnw ./
2025-Nov-07 15:42:37.731389
COPY sellia-backend/.mvn ./.mvn
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Download dependencies (cached layer)
2025-Nov-07 15:42:37.731389
RUN mvn dependency:go-offline -B
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Copy backend source
2025-Nov-07 15:42:37.731389
COPY sellia-backend/src ./src
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Copy frontend build into Spring Boot static resources
2025-Nov-07 15:42:37.731389
COPY --from=frontend-builder /app/frontend/dist/sellia-app/browser ./src/main/resources/static
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Build Spring Boot application
2025-Nov-07 15:42:37.731389
RUN mvn clean package -DskipTests -B
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# ========================================
2025-Nov-07 15:42:37.731389
# Stage 3: Runtime (Production)
2025-Nov-07 15:42:37.731389
# ========================================
2025-Nov-07 15:42:37.731389
FROM eclipse-temurin:21-jre-alpine
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
WORKDIR /app
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Create non-root user for security
2025-Nov-07 15:42:37.731389
RUN addgroup -S spring && adduser -S spring -G spring
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Create directories for uploads
2025-Nov-07 15:42:37.731389
RUN mkdir -p /app/uploads/qrcodes /app/uploads/products /app/uploads/receipts && \
2025-Nov-07 15:42:37.731389
chown -R spring:spring /app/uploads
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Copy JAR from builder
2025-Nov-07 15:42:37.731389
COPY --from=backend-builder /app/backend/target/*.jar app.jar
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Change ownership
2025-Nov-07 15:42:37.731389
RUN chown -R spring:spring /app
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Switch to non-root user
2025-Nov-07 15:42:37.731389
USER spring
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Expose port
2025-Nov-07 15:42:37.731389
EXPOSE 8080
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Health check
2025-Nov-07 15:42:37.731389
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
2025-Nov-07 15:42:37.731389
CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
2025-Nov-07 15:42:37.731389
2025-Nov-07 15:42:37.731389
# Run application
2025-Nov-07 15:42:37.731389
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
2025-Nov-07 15:42:37.952352
Creating build-time .env file in /artifacts (outside Docker context).
2025-Nov-07 15:42:38.287591
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'cat /artifacts/build-time.env'
2025-Nov-07 15:42:38.287591
SOURCE_COMMIT='bd69b8c17ade674649948c0b4eb71ea1279a9fc6'
2025-Nov-07 15:42:38.287591
COOLIFY_URL='http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io'
2025-Nov-07 15:42:38.287591
COOLIFY_FQDN='t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io'
2025-Nov-07 15:42:38.287591
COOLIFY_BRANCH='master'
2025-Nov-07 15:42:38.287591
COOLIFY_RESOURCE_UUID='t8c04oo8g8sggwoos8w080kk'
2025-Nov-07 15:42:38.287591
COOLIFY_CONTAINER_NAME='t8c04oo8g8sggwoos8w080kk-154231487214'
2025-Nov-07 15:42:38.287591
APP_BASE_URL="http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io"
2025-Nov-07 15:42:38.287591
APP_SERVER_URL="http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io"
2025-Nov-07 15:42:38.287591
DATABASE_NAME="sellia_db"
2025-Nov-07 15:42:38.287591
DATABASE_PASSWORD="6zYWYZ3Uvu8OtcA1sok2iwQyRf1YiaZYPJwXLcicggRxF3oDz8kgB8q3IIfLJA2h"
2025-Nov-07 15:42:38.287591
DATABASE_PORT="5432"
2025-Nov-07 15:42:38.287591
DATABASE_URL="jdbc:postgresql://ooscow04gkw0cgssskso0440:5432/sellia_db"
2025-Nov-07 15:42:38.287591
DATABASE_USERNAME="postgres"
2025-Nov-07 15:42:38.287591
DOCKER_BUILDKIT_NO_CACHE="1"
2025-Nov-07 15:42:38.287591
HIBERNATE_DDL_AUTO="update"
2025-Nov-07 15:42:38.287591
JAVA_OPTS="-Xms512m -Xmx1024m"
2025-Nov-07 15:42:38.287591
JWT_ACCESS_TOKEN_EXPIRATION="3600000"
2025-Nov-07 15:42:38.287591
JWT_REFRESH_TOKEN_EXPIRATION="432000000"
2025-Nov-07 15:42:38.287591
JWT_SECRET="LqLWpbUj3rjLLBXe+ju6ebB9fPQKwCOCreNg31EK06Yj+52XyBBBXZKva5eUQtqFVH0S3IgVls7aBkdMeJ1C3g"
2025-Nov-07 15:42:38.466441
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'cat /artifacts/fsc8s8ww8ow0484s8sgkg00s/Dockerfile'
2025-Nov-07 15:42:38.466441
# ========================================
2025-Nov-07 15:42:38.466441
# Stage 1: Build Frontend (Angular)
2025-Nov-07 15:42:38.466441
# ========================================
2025-Nov-07 15:42:38.466441
FROM node:20-alpine AS frontend-builder
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
WORKDIR /app/frontend
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Copy frontend package files
2025-Nov-07 15:42:38.466441
COPY sellia-app/package*.json ./
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Install dependencies
2025-Nov-07 15:42:38.466441
RUN npm ci
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Copy frontend source
2025-Nov-07 15:42:38.466441
COPY sellia-app/ ./
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Build Angular app for production
2025-Nov-07 15:42:38.466441
RUN npm run build -- --configuration production
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# ========================================
2025-Nov-07 15:42:38.466441
# Stage 2: Build Backend (Spring Boot)
2025-Nov-07 15:42:38.466441
# ========================================
2025-Nov-07 15:42:38.466441
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
WORKDIR /app/backend
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Copy Maven files
2025-Nov-07 15:42:38.466441
COPY sellia-backend/pom.xml ./
2025-Nov-07 15:42:38.466441
COPY sellia-backend/mvnw ./
2025-Nov-07 15:42:38.466441
COPY sellia-backend/.mvn ./.mvn
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Download dependencies (cached layer)
2025-Nov-07 15:42:38.466441
RUN mvn dependency:go-offline -B
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Copy backend source
2025-Nov-07 15:42:38.466441
COPY sellia-backend/src ./src
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Copy frontend build into Spring Boot static resources
2025-Nov-07 15:42:38.466441
COPY --from=frontend-builder /app/frontend/dist/sellia-app/browser ./src/main/resources/static
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Build Spring Boot application
2025-Nov-07 15:42:38.466441
RUN mvn clean package -DskipTests -B
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# ========================================
2025-Nov-07 15:42:38.466441
# Stage 3: Runtime (Production)
2025-Nov-07 15:42:38.466441
# ========================================
2025-Nov-07 15:42:38.466441
FROM eclipse-temurin:21-jre-alpine
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
WORKDIR /app
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Create non-root user for security
2025-Nov-07 15:42:38.466441
RUN addgroup -S spring && adduser -S spring -G spring
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Create directories for uploads
2025-Nov-07 15:42:38.466441
RUN mkdir -p /app/uploads/qrcodes /app/uploads/products /app/uploads/receipts && \
2025-Nov-07 15:42:38.466441
chown -R spring:spring /app/uploads
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Copy JAR from builder
2025-Nov-07 15:42:38.466441
COPY --from=backend-builder /app/backend/target/*.jar app.jar
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Change ownership
2025-Nov-07 15:42:38.466441
RUN chown -R spring:spring /app
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Switch to non-root user
2025-Nov-07 15:42:38.466441
USER spring
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Expose port
2025-Nov-07 15:42:38.466441
EXPOSE 8080
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Health check
2025-Nov-07 15:42:38.466441
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
2025-Nov-07 15:42:38.466441
CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
2025-Nov-07 15:42:38.466441
2025-Nov-07 15:42:38.466441
# Run application
2025-Nov-07 15:42:38.466441
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
2025-Nov-07 15:42:38.543222
Final Dockerfile:
2025-Nov-07 15:42:38.893694
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'cat /artifacts/fsc8s8ww8ow0484s8sgkg00s/Dockerfile'
2025-Nov-07 15:42:38.893694
# ========================================
2025-Nov-07 15:42:38.893694
ARG COOLIFY_BUILD_SECRETS_HASH=4175393688bfcbb2e8b143dbc1cf4936c3bc50f1d9b60dce8be1345dac5c06a7
2025-Nov-07 15:42:38.893694
ARG COOLIFY_CONTAINER_NAME=t8c04oo8g8sggwoos8w080kk-154231487214
2025-Nov-07 15:42:38.893694
ARG COOLIFY_RESOURCE_UUID=t8c04oo8g8sggwoos8w080kk
2025-Nov-07 15:42:38.893694
ARG COOLIFY_BRANCH=master
2025-Nov-07 15:42:38.893694
ARG COOLIFY_FQDN=t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io
2025-Nov-07 15:42:38.893694
ARG COOLIFY_URL=http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io
2025-Nov-07 15:42:38.893694
ARG SOURCE_COMMIT=bd69b8c17ade674649948c0b4eb71ea1279a9fc6
2025-Nov-07 15:42:38.893694
ARG JWT_SECRET=LqLWpbUj3rjLLBXe+ju6ebB9fPQKwCOCreNg31EK06Yj+52XyBBBXZKva5eUQtqFVH0S3IgVls7aBkdMeJ1C3g
2025-Nov-07 15:42:38.893694
ARG JWT_REFRESH_TOKEN_EXPIRATION=432000000
2025-Nov-07 15:42:38.893694
ARG JWT_ACCESS_TOKEN_EXPIRATION=3600000
2025-Nov-07 15:42:38.893694
ARG JAVA_OPTS=-Xms512m -Xmx1024m
2025-Nov-07 15:42:38.893694
ARG HIBERNATE_DDL_AUTO=update
2025-Nov-07 15:42:38.893694
ARG DOCKER_BUILDKIT_NO_CACHE=1
2025-Nov-07 15:42:38.893694
ARG DATABASE_USERNAME=postgres
2025-Nov-07 15:42:38.893694
ARG DATABASE_URL=jdbc:postgresql://ooscow04gkw0cgssskso0440:5432/sellia_db
2025-Nov-07 15:42:38.893694
ARG DATABASE_PORT=5432
2025-Nov-07 15:42:38.893694
ARG DATABASE_PASSWORD=6zYWYZ3Uvu8OtcA1sok2iwQyRf1YiaZYPJwXLcicggRxF3oDz8kgB8q3IIfLJA2h
2025-Nov-07 15:42:38.893694
ARG DATABASE_NAME=sellia_db
2025-Nov-07 15:42:38.893694
ARG APP_SERVER_URL=http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io
2025-Nov-07 15:42:38.893694
ARG APP_BASE_URL=http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io
2025-Nov-07 15:42:38.893694
# Stage 1: Build Frontend (Angular)
2025-Nov-07 15:42:38.893694
# ========================================
2025-Nov-07 15:42:38.893694
FROM node:20-alpine AS frontend-builder
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
WORKDIR /app/frontend
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Copy frontend package files
2025-Nov-07 15:42:38.893694
COPY sellia-app/package*.json ./
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Install dependencies
2025-Nov-07 15:42:38.893694
RUN npm ci
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Copy frontend source
2025-Nov-07 15:42:38.893694
COPY sellia-app/ ./
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Build Angular app for production
2025-Nov-07 15:42:38.893694
RUN npm run build -- --configuration production
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# ========================================
2025-Nov-07 15:42:38.893694
# Stage 2: Build Backend (Spring Boot)
2025-Nov-07 15:42:38.893694
# ========================================
2025-Nov-07 15:42:38.893694
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
WORKDIR /app/backend
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Copy Maven files
2025-Nov-07 15:42:38.893694
COPY sellia-backend/pom.xml ./
2025-Nov-07 15:42:38.893694
COPY sellia-backend/mvnw ./
2025-Nov-07 15:42:38.893694
COPY sellia-backend/.mvn ./.mvn
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Download dependencies (cached layer)
2025-Nov-07 15:42:38.893694
RUN mvn dependency:go-offline -B
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Copy backend source
2025-Nov-07 15:42:38.893694
COPY sellia-backend/src ./src
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Copy frontend build into Spring Boot static resources
2025-Nov-07 15:42:38.893694
COPY --from=frontend-builder /app/frontend/dist/sellia-app/browser ./src/main/resources/static
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Build Spring Boot application
2025-Nov-07 15:42:38.893694
RUN mvn clean package -DskipTests -B
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# ========================================
2025-Nov-07 15:42:38.893694
# Stage 3: Runtime (Production)
2025-Nov-07 15:42:38.893694
# ========================================
2025-Nov-07 15:42:38.893694
FROM eclipse-temurin:21-jre-alpine
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
WORKDIR /app
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Create non-root user for security
2025-Nov-07 15:42:38.893694
RUN addgroup -S spring && adduser -S spring -G spring
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Create directories for uploads
2025-Nov-07 15:42:38.893694
RUN mkdir -p /app/uploads/qrcodes /app/uploads/products /app/uploads/receipts && \
2025-Nov-07 15:42:38.893694
chown -R spring:spring /app/uploads
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Copy JAR from builder
2025-Nov-07 15:42:38.893694
COPY --from=backend-builder /app/backend/target/*.jar app.jar
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Change ownership
2025-Nov-07 15:42:38.893694
RUN chown -R spring:spring /app
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Switch to non-root user
2025-Nov-07 15:42:38.893694
USER spring
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Expose port
2025-Nov-07 15:42:38.893694
EXPOSE 8080
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Health check
2025-Nov-07 15:42:38.893694
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
2025-Nov-07 15:42:38.893694
CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
2025-Nov-07 15:42:38.893694
2025-Nov-07 15:42:38.893694
# Run application
2025-Nov-07 15:42:38.893694
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
2025-Nov-07 15:42:38.907875
----------------------------------------
2025-Nov-07 15:42:38.917229
Building docker image started.
2025-Nov-07 15:42:38.926031
To check the current progress, click on Show Debug Logs.
2025-Nov-07 15:42:39.292247
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'cat /artifacts/build.sh'
2025-Nov-07 15:42:39.292247
cd /artifacts/fsc8s8ww8ow0484s8sgkg00s && set -a && source /artifacts/build-time.env && set +a && docker build --no-cache  --add-host coolify:10.0.1.5 --add-host coolify-db:10.0.1.2 --add-host coolify-realtime:10.0.1.3 --add-host coolify-redis:10.0.1.4 --add-host ooscow04gkw0cgssskso0440:10.0.1.7 --add-host ooscow04gkw0cgssskso0440-proxy:10.0.1.8 --network host -f /artifacts/fsc8s8ww8ow0484s8sgkg00s/Dockerfile --build-arg SOURCE_COMMIT --build-arg COOLIFY_URL --build-arg COOLIFY_FQDN --build-arg COOLIFY_BRANCH --build-arg COOLIFY_RESOURCE_UUID --build-arg COOLIFY_CONTAINER_NAME --build-arg APP_BASE_URL --build-arg APP_SERVER_URL --build-arg DATABASE_NAME --build-arg DATABASE_PASSWORD --build-arg DATABASE_PORT --build-arg DATABASE_URL --build-arg DATABASE_USERNAME --build-arg DOCKER_BUILDKIT_NO_CACHE --build-arg HIBERNATE_DDL_AUTO --build-arg JAVA_OPTS --build-arg JWT_ACCESS_TOKEN_EXPIRATION --build-arg JWT_REFRESH_TOKEN_EXPIRATION --build-arg JWT_SECRET --build-arg COOLIFY_BUILD_SECRETS_HASH=6575cbcd1d8788d6efc554e0c2fd778e24ee96a3671953035a985a065672714b --build-arg 'SOURCE_COMMIT' --build-arg 'COOLIFY_URL' --build-arg 'COOLIFY_FQDN' --build-arg 'COOLIFY_BRANCH' --build-arg 'COOLIFY_RESOURCE_UUID' --build-arg 'COOLIFY_CONTAINER_NAME' --progress plain -t t8c04oo8g8sggwoos8w080kk:bd69b8c17ade674649948c0b4eb71ea1279a9fc6 /artifacts/fsc8s8ww8ow0484s8sgkg00s
2025-Nov-07 15:42:39.926648
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'bash /artifacts/build.sh'
2025-Nov-07 15:42:39.926648
#0 building with "default" instance using docker driver
2025-Nov-07 15:42:39.926648
2025-Nov-07 15:42:39.926648
#1 [internal] load build definition from Dockerfile
2025-Nov-07 15:42:39.926648
#1 transferring dockerfile: 3.11kB done
2025-Nov-07 15:42:39.926648
#1 DONE 0.0s
2025-Nov-07 15:42:39.931387
#2 [internal] load metadata for docker.io/library/maven:3.9-eclipse-temurin-21
2025-Nov-07 15:42:40.519350
#2 DONE 0.7s
2025-Nov-07 15:42:40.519350
2025-Nov-07 15:42:40.519350
#3 [internal] load metadata for docker.io/library/eclipse-temurin:21-jre-alpine
2025-Nov-07 15:42:40.628564
#3 DONE 0.9s
2025-Nov-07 15:42:40.628564
2025-Nov-07 15:42:40.628564
#4 [internal] load metadata for docker.io/library/node:20-alpine
2025-Nov-07 15:42:40.628564
#4 DONE 0.8s
2025-Nov-07 15:42:40.775395
#5 [internal] load .dockerignore
2025-Nov-07 15:42:40.775395
#5 transferring context: 825B done
2025-Nov-07 15:42:40.775395
#5 DONE 0.0s
2025-Nov-07 15:42:40.775395
2025-Nov-07 15:42:40.775395
#6 [backend-builder 1/9] FROM docker.io/library/maven:3.9-eclipse-temurin-21@sha256:db5e420aadc186ac18c549a31043c31d2795d61f8a97eb50b4831fd155f0e7d6
2025-Nov-07 15:42:40.775395
#6 DONE 0.0s
2025-Nov-07 15:42:40.775395
2025-Nov-07 15:42:40.775395
#7 [stage-2 1/6] FROM docker.io/library/eclipse-temurin:21-jre-alpine@sha256:990397e0495ac088ab6ee3d949a2e97b715a134d8b96c561c5d130b3786a489d
2025-Nov-07 15:42:40.775395
#7 DONE 0.0s
2025-Nov-07 15:42:40.775395
2025-Nov-07 15:42:40.775395
#8 [frontend-builder 1/6] FROM docker.io/library/node:20-alpine@sha256:6178e78b972f79c335df281f4b7674a2d85071aae2af020ffa39f0a770265435
2025-Nov-07 15:42:40.775395
#8 DONE 0.0s
2025-Nov-07 15:42:40.775395
2025-Nov-07 15:42:40.775395
#9 [backend-builder 2/9] WORKDIR /app/backend
2025-Nov-07 15:42:40.775395
#9 CACHED
2025-Nov-07 15:42:40.775395
2025-Nov-07 15:42:40.775395
#10 [stage-2 2/6] WORKDIR /app
2025-Nov-07 15:42:40.775395
#10 CACHED
2025-Nov-07 15:42:40.775395
2025-Nov-07 15:42:40.775395
#11 [frontend-builder 2/6] WORKDIR /app/frontend
2025-Nov-07 15:42:40.775395
#11 CACHED
2025-Nov-07 15:42:40.775395
2025-Nov-07 15:42:40.775395
#12 [internal] load build context
2025-Nov-07 15:42:40.893342
#12 transferring context: 1.82MB 0.2s done
2025-Nov-07 15:42:40.893342
#12 DONE 0.2s
2025-Nov-07 15:42:40.893342
2025-Nov-07 15:42:40.893342
#13 [stage-2 3/6] RUN addgroup -S spring && adduser -S spring -G spring
2025-Nov-07 15:42:40.893342
#13 DONE 0.2s
2025-Nov-07 15:42:40.893342
2025-Nov-07 15:42:40.893342
#14 [frontend-builder 3/6] COPY sellia-app/package*.json ./
2025-Nov-07 15:42:40.893342
#14 DONE 0.0s
2025-Nov-07 15:42:40.893342
2025-Nov-07 15:42:40.893342
#15 [backend-builder 3/9] COPY sellia-backend/pom.xml ./
2025-Nov-07 15:42:40.893342
#15 DONE 0.0s
2025-Nov-07 15:42:40.893342
2025-Nov-07 15:42:40.893342
#16 [backend-builder 4/9] COPY sellia-backend/mvnw ./
2025-Nov-07 15:42:40.893342
#16 DONE 0.0s
2025-Nov-07 15:42:40.893342
2025-Nov-07 15:42:40.893342
#17 [frontend-builder 4/6] RUN npm ci
2025-Nov-07 15:42:41.074242
#17 ...
2025-Nov-07 15:42:41.074242
2025-Nov-07 15:42:41.074242
#18 [stage-2 4/6] RUN mkdir -p /app/uploads/qrcodes /app/uploads/products /app/uploads/receipts &&     chown -R spring:spring /app/uploads
2025-Nov-07 15:42:41.074242
#18 DONE 0.1s
2025-Nov-07 15:42:41.074242
2025-Nov-07 15:42:41.074242
#19 [backend-builder 5/9] COPY sellia-backend/.mvn ./.mvn
2025-Nov-07 15:42:41.074242
#19 DONE 0.0s
2025-Nov-07 15:42:41.225392
#20 [backend-builder 6/9] RUN mvn dependency:go-offline -B
2025-Nov-07 15:42:44.042043
#20 3.118 [INFO] Scanning for projects...
2025-Nov-07 15:42:44.645763
#20 3.721 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-parent/3.5.6/spring-boot-starter-parent-3.5.6.pom
2025-Nov-07 15:42:44.796431
2025-Nov-07 15:42:45.385932
#20 4.462 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-parent/3.5.6/spring-boot-starter-parent-3.5.6.pom (13 kB at 18 kB/s)
2025-Nov-07 15:42:45.614353
#20 4.539 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/3.5.6/spring-boot-dependencies-3.5.6.pom
2025-Nov-07 15:42:45.640163
#20 4.716 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/3.5.6/spring-boot-dependencies-3.5.6.pom (96 kB at 550 kB/s)
2025-Nov-07 15:42:45.740184
#20 4.816 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/activemq/activemq-bom/6.1.7/activemq-bom-6.1.7.pom
2025-Nov-07 15:42:45.848249
#20 4.866 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/activemq/activemq-bom/6.1.7/activemq-bom-6.1.7.pom (7.9 kB at 161 kB/s)
2025-Nov-07 15:42:45.848249
#20 4.881 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/activemq/artemis-bom/2.40.0/artemis-bom-2.40.0.pom
2025-Nov-07 15:42:45.848249
#20 4.923 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/activemq/artemis-bom/2.40.0/artemis-bom-2.40.0.pom (9.6 kB at 240 kB/s)
2025-Nov-07 15:42:45.952593
#20 4.933 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/activemq/artemis-project/2.40.0/artemis-project-2.40.0.pom
2025-Nov-07 15:42:45.952593
#20 4.975 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/activemq/artemis-project/2.40.0/artemis-project-2.40.0.pom (56 kB at 1.3 MB/s)
2025-Nov-07 15:42:45.952593
#20 4.983 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/33/apache-33.pom
2025-Nov-07 15:42:45.952593
#20 5.029 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/33/apache-33.pom (24 kB at 526 kB/s)
2025-Nov-07 15:42:46.089632
#20 5.048 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/assertj/assertj-bom/3.27.4/assertj-bom-3.27.4.pom
2025-Nov-07 15:42:46.089632
#20 5.092 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/assertj/assertj-bom/3.27.4/assertj-bom-3.27.4.pom (3.3 kB at 79 kB/s)
2025-Nov-07 15:42:46.089632
#20 5.105 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/zipkin/reporter2/zipkin-reporter-bom/3.5.1/zipkin-reporter-bom-3.5.1.pom
2025-Nov-07 15:42:46.089632
#20 5.164 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/zipkin/reporter2/zipkin-reporter-bom/3.5.1/zipkin-reporter-bom-3.5.1.pom (6.3 kB at 106 kB/s)
2025-Nov-07 15:42:46.230144
#20 5.190 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/zipkin/brave/brave-bom/6.1.0/brave-bom-6.1.0.pom
2025-Nov-07 15:42:46.230144
#20 5.230 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/zipkin/brave/brave-bom/6.1.0/brave-bom-6.1.0.pom (11 kB at 239 kB/s)
2025-Nov-07 15:42:46.230144
#20 5.247 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/cassandra/java-driver-bom/4.19.0/java-driver-bom-4.19.0.pom
2025-Nov-07 15:42:46.230144
#20 5.306 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/cassandra/java-driver-bom/4.19.0/java-driver-bom-4.19.0.pom (5.5 kB at 92 kB/s)
2025-Nov-07 15:42:46.374506
#20 5.324 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-bom/4.0.5/jaxb-bom-4.0.5.pom
2025-Nov-07 15:42:46.374506
#20 5.390 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-bom/4.0.5/jaxb-bom-4.0.5.pom (12 kB at 176 kB/s)
2025-Nov-07 15:42:46.374506
#20 5.401 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/ee4j/project/1.0.9/project-1.0.9.pom
2025-Nov-07 15:42:46.374506
#20 5.450 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/ee4j/project/1.0.9/project-1.0.9.pom (16 kB at 329 kB/s)
2025-Nov-07 15:42:46.507162
2025-Nov-07 15:42:46.510218
#20 5.465 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/groovy/groovy-bom/4.0.28/groovy-bom-4.0.28.pom
2025-Nov-07 15:42:46.510218
#20 5.528 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/groovy/groovy-bom/4.0.28/groovy-bom-4.0.28.pom (27 kB at 440 kB/s)
2025-Nov-07 15:42:46.510218
#20 5.545 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/infinispan/infinispan-bom/15.2.6.Final/infinispan-bom-15.2.6.Final.pom
2025-Nov-07 15:42:46.510218
#20 5.581 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/infinispan/infinispan-bom/15.2.6.Final/infinispan-bom-15.2.6.Final.pom (17 kB at 484 kB/s)
2025-Nov-07 15:42:46.621147
#20 5.593 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/infinispan/infinispan-build-configuration-parent/15.2.6.Final/infinispan-build-configuration-parent-15.2.6.Final.pom
2025-Nov-07 15:42:46.621147
#20 5.632 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/infinispan/infinispan-build-configuration-parent/15.2.6.Final/infinispan-build-configuration-parent-15.2.6.Final.pom (17 kB at 440 kB/s)
2025-Nov-07 15:42:46.621147
#20 5.641 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-bom/2.19.2/jackson-bom-2.19.2.pom
2025-Nov-07 15:42:46.621147
#20 5.695 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-bom/2.19.2/jackson-bom-2.19.2.pom (20 kB at 375 kB/s)
2025-Nov-07 15:42:46.719397
#20 5.701 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-parent/2.19.3/jackson-parent-2.19.3.pom
2025-Nov-07 15:42:46.719397
#20 5.748 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-parent/2.19.3/jackson-parent-2.19.3.pom (7.2 kB at 153 kB/s)
2025-Nov-07 15:42:46.719397
#20 5.755 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/69/oss-parent-69.pom
2025-Nov-07 15:42:46.719397
#20 5.795 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/69/oss-parent-69.pom (24 kB at 577 kB/s)
2025-Nov-07 15:42:46.842221
#20 5.818 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jersey/jersey-bom/3.1.11/jersey-bom-3.1.11.pom
2025-Nov-07 15:42:46.842221
#20 5.863 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jersey/jersey-bom/3.1.11/jersey-bom-3.1.11.pom (21 kB at 483 kB/s)
2025-Nov-07 15:42:46.842221
#20 5.881 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/ee10/jetty-ee10-bom/12.0.27/jetty-ee10-bom-12.0.27.pom
2025-Nov-07 15:42:46.842221
#20 5.917 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/ee10/jetty-ee10-bom/12.0.27/jetty-ee10-bom-12.0.27.pom (9.6 kB at 273 kB/s)
2025-Nov-07 15:42:46.978284
#20 5.936 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-bom/12.0.27/jetty-bom-12.0.27.pom
2025-Nov-07 15:42:46.978284
#20 5.977 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-bom/12.0.27/jetty-bom-12.0.27.pom (15 kB at 356 kB/s)
2025-Nov-07 15:42:46.978284
#20 5.989 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.12.2/junit-bom-5.12.2.pom
2025-Nov-07 15:42:46.978284
#20 6.053 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.12.2/junit-bom-5.12.2.pom (5.6 kB at 88 kB/s)
2025-Nov-07 15:42:47.085985
#20 6.062 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-bom/1.9.25/kotlin-bom-1.9.25.pom
2025-Nov-07 15:42:47.085985
#20 6.106 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-bom/1.9.25/kotlin-bom-1.9.25.pom (9.1 kB at 198 kB/s)
2025-Nov-07 15:42:47.085985
#20 6.116 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlinx/kotlinx-coroutines-bom/1.8.1/kotlinx-coroutines-bom-1.8.1.pom
2025-Nov-07 15:42:47.085985
#20 6.162 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlinx/kotlinx-coroutines-bom/1.8.1/kotlinx-coroutines-bom-1.8.1.pom (4.3 kB at 89 kB/s)
2025-Nov-07 15:42:47.189141
#20 6.169 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlinx/kotlinx-serialization-bom/1.6.3/kotlinx-serialization-bom-1.6.3.pom
2025-Nov-07 15:42:47.189141
#20 6.207 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlinx/kotlinx-serialization-bom/1.6.3/kotlinx-serialization-bom-1.6.3.pom (3.7 kB at 99 kB/s)
2025-Nov-07 15:42:47.189141
#20 6.213 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-bom/2.24.3/log4j-bom-2.24.3.pom
2025-Nov-07 15:42:47.189141
#20 6.254 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-bom/2.24.3/log4j-bom-2.24.3.pom (12 kB at 299 kB/s)
2025-Nov-07 15:42:47.189141
#20 6.265 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/logging/logging-parent/11.3.0/logging-parent-11.3.0.pom
2025-Nov-07 15:42:47.327886
#20 6.299 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/logging/logging-parent/11.3.0/logging-parent-11.3.0.pom (53 kB at 1.4 MB/s)
2025-Nov-07 15:42:47.327886
#20 6.308 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-bom/1.15.4/micrometer-bom-1.15.4.pom
2025-Nov-07 15:42:47.327886
#20 6.345 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-bom/1.15.4/micrometer-bom-1.15.4.pom (8.6 kB at 245 kB/s)
2025-Nov-07 15:42:47.327886
#20 6.355 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-tracing-bom/1.5.4/micrometer-tracing-bom-1.5.4.pom
2025-Nov-07 15:42:47.327886
#20 6.404 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-tracing-bom/1.5.4/micrometer-tracing-bom-1.5.4.pom (4.5 kB at 92 kB/s)
2025-Nov-07 15:42:47.444059
#20 6.420 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-bom/5.17.0/mockito-bom-5.17.0.pom
2025-Nov-07 15:42:47.444059
#20 6.457 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-bom/5.17.0/mockito-bom-5.17.0.pom (3.0 kB at 80 kB/s)
2025-Nov-07 15:42:47.444059
#20 6.487 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/mongodb/mongodb-driver-bom/5.5.1/mongodb-driver-bom-5.5.1.pom
2025-Nov-07 15:42:47.444059
#20 6.520 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/mongodb/mongodb-driver-bom/5.5.1/mongodb-driver-bom-5.5.1.pom (4.2 kB at 123 kB/s)
2025-Nov-07 15:42:47.549651
#20 6.534 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/netty/netty-bom/4.1.127.Final/netty-bom-4.1.127.Final.pom
2025-Nov-07 15:42:47.549651
#20 6.577 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/netty/netty-bom/4.1.127.Final/netty-bom-4.1.127.Final.pom (15 kB at 360 kB/s)
2025-Nov-07 15:42:47.549651
#20 6.591 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/oss/oss-parent/7/oss-parent-7.pom
2025-Nov-07 15:42:47.549651
#20 6.626 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/oss/oss-parent/7/oss-parent-7.pom (4.8 kB at 124 kB/s)
2025-Nov-07 15:42:47.654174
#20 6.634 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/opentelemetry/opentelemetry-bom/1.49.0/opentelemetry-bom-1.49.0.pom
2025-Nov-07 15:42:47.654174
#20 6.671 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/opentelemetry/opentelemetry-bom/1.49.0/opentelemetry-bom-1.49.0.pom (5.9 kB at 163 kB/s)
2025-Nov-07 15:42:47.654174
#20 6.687 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/prometheus/prometheus-metrics-bom/1.3.10/prometheus-metrics-bom-1.3.10.pom
2025-Nov-07 15:42:47.654174
#20 6.719 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/prometheus/prometheus-metrics-bom/1.3.10/prometheus-metrics-bom-1.3.10.pom (5.8 kB at 188 kB/s)
2025-Nov-07 15:42:47.654174
#20 6.730 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/prometheus/client_java_parent/1.3.10/client_java_parent-1.3.10.pom
2025-Nov-07 15:42:47.783045
#20 6.772 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/prometheus/client_java_parent/1.3.10/client_java_parent-1.3.10.pom (4.4 kB at 109 kB/s)
2025-Nov-07 15:42:47.783045
#20 6.779 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/prometheus/simpleclient_bom/0.16.0/simpleclient_bom-0.16.0.pom
2025-Nov-07 15:42:47.783045
#20 6.809 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/prometheus/simpleclient_bom/0.16.0/simpleclient_bom-0.16.0.pom (6.0 kB at 200 kB/s)
2025-Nov-07 15:42:47.783045
#20 6.815 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/prometheus/parent/0.16.0/parent-0.16.0.pom
2025-Nov-07 15:42:47.783045
#20 6.859 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/prometheus/parent/0.16.0/parent-0.16.0.pom (13 kB at 284 kB/s)
2025-Nov-07 15:42:47.887373
#20 6.867 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/pulsar/pulsar-bom/4.0.6/pulsar-bom-4.0.6.pom
2025-Nov-07 15:42:47.887373
#20 6.919 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/pulsar/pulsar-bom/4.0.6/pulsar-bom-4.0.6.pom (25 kB at 504 kB/s)
2025-Nov-07 15:42:47.887373
#20 6.931 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/29/apache-29.pom
2025-Nov-07 15:42:47.887373
#20 6.963 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/29/apache-29.pom (21 kB at 609 kB/s)
2025-Nov-07 15:42:48.013080
#20 6.973 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/pulsar/pulsar-client-reactive-bom/0.6.0/pulsar-client-reactive-bom-0.6.0.pom
2025-Nov-07 15:42:48.013080
#20 7.037 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/pulsar/pulsar-client-reactive-bom/0.6.0/pulsar-client-reactive-bom-0.6.0.pom (2.8 kB at 44 kB/s)
2025-Nov-07 15:42:48.013080
#20 7.046 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/querydsl/querydsl-bom/5.1.0/querydsl-bom-5.1.0.pom
2025-Nov-07 15:42:48.013080
#20 7.086 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/querydsl/querydsl-bom/5.1.0/querydsl-bom-5.1.0.pom (7.2 kB at 179 kB/s)
2025-Nov-07 15:42:48.121134
#20 7.104 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/projectreactor/reactor-bom/2024.0.10/reactor-bom-2024.0.10.pom
2025-Nov-07 15:42:48.121134
#20 7.141 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/projectreactor/reactor-bom/2024.0.10/reactor-bom-2024.0.10.pom (4.8 kB at 129 kB/s)
2025-Nov-07 15:42:48.121134
#20 7.145 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/rest-assured/rest-assured-bom/5.5.6/rest-assured-bom-5.5.6.pom
2025-Nov-07 15:42:48.121134
#20 7.180 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/rest-assured/rest-assured-bom/5.5.6/rest-assured-bom-5.5.6.pom (4.7 kB at 138 kB/s)
2025-Nov-07 15:42:48.121134
#20 7.197 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/rsocket/rsocket-bom/1.1.5/rsocket-bom-1.1.5.pom
2025-Nov-07 15:42:48.244637
#20 7.234 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/rsocket/rsocket-bom/1.1.5/rsocket-bom-1.1.5.pom (2.4 kB at 55 kB/s)
2025-Nov-07 15:42:48.244637
#20 7.245 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/seleniumhq/selenium/selenium-bom/4.31.0/selenium-bom-4.31.0.pom
2025-Nov-07 15:42:48.244637
#20 7.283 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/seleniumhq/selenium/selenium-bom/4.31.0/selenium-bom-4.31.0.pom (5.8 kB at 158 kB/s)
2025-Nov-07 15:42:48.244637
#20 7.291 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/amqp/spring-amqp-bom/3.2.7/spring-amqp-bom-3.2.7.pom
2025-Nov-07 15:42:48.244637
#20 7.320 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/amqp/spring-amqp-bom/3.2.7/spring-amqp-bom-3.2.7.pom (3.9 kB at 129 kB/s)
2025-Nov-07 15:42:48.371147
#20 7.330 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/batch/spring-batch-bom/5.2.3/spring-batch-bom-5.2.3.pom
2025-Nov-07 15:42:48.371147
#20 7.362 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/batch/spring-batch-bom/5.2.3/spring-batch-bom-5.2.3.pom (3.2 kB at 90 kB/s)
2025-Nov-07 15:42:48.371147
#20 7.367 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-bom/2025.0.4/spring-data-bom-2025.0.4.pom
2025-Nov-07 15:42:48.371147
#20 7.402 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-bom/2025.0.4/spring-data-bom-2025.0.4.pom (5.5 kB at 157 kB/s)
2025-Nov-07 15:42:48.371147
#20 7.408 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-framework-bom/6.2.11/spring-framework-bom-6.2.11.pom
2025-Nov-07 15:42:48.371147
#20 7.445 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-framework-bom/6.2.11/spring-framework-bom-6.2.11.pom (5.8 kB at 162 kB/s)
2025-Nov-07 15:42:48.494121
#20 7.449 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/integration/spring-integration-bom/6.5.2/spring-integration-bom-6.5.2.pom
2025-Nov-07 15:42:48.494121
#20 7.479 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/integration/spring-integration-bom/6.5.2/spring-integration-bom-6.5.2.pom (10 kB at 343 kB/s)
2025-Nov-07 15:42:48.494121
#20 7.487 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/pulsar/spring-pulsar-bom/1.2.10/spring-pulsar-bom-1.2.10.pom
2025-Nov-07 15:42:48.494121
#20 7.519 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/pulsar/spring-pulsar-bom/1.2.10/spring-pulsar-bom-1.2.10.pom (2.9 kB at 91 kB/s)
2025-Nov-07 15:42:48.494121
#20 7.528 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/restdocs/spring-restdocs-bom/3.0.5/spring-restdocs-bom-3.0.5.pom
2025-Nov-07 15:42:48.494121
#20 7.570 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/restdocs/spring-restdocs-bom/3.0.5/spring-restdocs-bom-3.0.5.pom (2.6 kB at 61 kB/s)
2025-Nov-07 15:42:48.607253
#20 7.575 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-bom/6.5.5/spring-security-bom-6.5.5.pom
2025-Nov-07 15:42:48.607253
#20 7.607 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-bom/6.5.5/spring-security-bom-6.5.5.pom (5.3 kB at 172 kB/s)
2025-Nov-07 15:42:48.607253
#20 7.612 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/session/spring-session-bom/3.5.2/spring-session-bom-3.5.2.pom
2025-Nov-07 15:42:48.607253
#20 7.645 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/session/spring-session-bom/3.5.2/spring-session-bom-3.5.2.pom (2.9 kB at 85 kB/s)
2025-Nov-07 15:42:48.607253
#20 7.650 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/ws/spring-ws-bom/4.1.1/spring-ws-bom-4.1.1.pom
2025-Nov-07 15:42:48.607253
#20 7.683 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/ws/spring-ws-bom/4.1.1/spring-ws-bom-4.1.1.pom (2.3 kB at 70 kB/s)
2025-Nov-07 15:42:48.743157
#20 7.692 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/testcontainers/testcontainers-bom/1.21.3/testcontainers-bom-1.21.3.pom
2025-Nov-07 15:42:48.743157
#20 7.746 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/testcontainers/testcontainers-bom/1.21.3/testcontainers-bom-1.21.3.pom (12 kB at 214 kB/s)
2025-Nov-07 15:42:48.743157
#20 7.816 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-compiler-plugin/3.14.0/maven-compiler-plugin-3.14.0.pom
2025-Nov-07 15:42:48.875255
#20 7.859 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-compiler-plugin/3.14.0/maven-compiler-plugin-3.14.0.pom (9.5 kB at 207 kB/s)
2025-Nov-07 15:42:48.875255
#20 7.892 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/43/maven-plugins-43.pom
2025-Nov-07 15:42:48.875255
#20 7.951 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/43/maven-plugins-43.pom (7.5 kB at 127 kB/s)
2025-Nov-07 15:42:49.008580
#20 7.966 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/43/maven-parent-43.pom
2025-Nov-07 15:42:49.008580
#20 8.000 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/43/maven-parent-43.pom (50 kB at 1.4 MB/s)
2025-Nov-07 15:42:49.008580
#20 8.035 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.10.3/junit-bom-5.10.3.pom
2025-Nov-07 15:42:49.008580
#20 8.084 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.10.3/junit-bom-5.10.3.pom (5.6 kB at 113 kB/s)
2025-Nov-07 15:42:49.174141
#20 8.125 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-compiler-plugin/3.14.0/maven-compiler-plugin-3.14.0.jar
2025-Nov-07 15:42:49.174141
#20 8.184 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-compiler-plugin/3.14.0/maven-compiler-plugin-3.14.0.jar (83 kB at 1.4 MB/s)
2025-Nov-07 15:42:49.174141
#20 8.242 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-maven-plugin/3.5.6/spring-boot-maven-plugin-3.5.6.pom
2025-Nov-07 15:42:49.291634
#20 8.285 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-maven-plugin/3.5.6/spring-boot-maven-plugin-3.5.6.pom (4.0 kB at 93 kB/s)
2025-Nov-07 15:42:49.291634
#20 8.297 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-maven-plugin/3.5.6/spring-boot-maven-plugin-3.5.6.jar
2025-Nov-07 15:42:49.291634
#20 8.367 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-maven-plugin/3.5.6/spring-boot-maven-plugin-3.5.6.jar (137 kB at 1.9 MB/s)
2025-Nov-07 15:42:49.418730
#20 8.375 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-clean-plugin/3.4.1/maven-clean-plugin-3.4.1.pom
2025-Nov-07 15:42:49.418730
#20 8.430 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-clean-plugin/3.4.1/maven-clean-plugin-3.4.1.pom (5.6 kB at 100 kB/s)
2025-Nov-07 15:42:49.418730
#20 8.452 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-clean-plugin/3.4.1/maven-clean-plugin-3.4.1.jar
2025-Nov-07 15:42:49.418730
#20 8.494 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-clean-plugin/3.4.1/maven-clean-plugin-3.4.1.jar (36 kB at 808 kB/s)
2025-Nov-07 15:42:49.543744
#20 8.497 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-resources-plugin/3.3.1/maven-resources-plugin-3.3.1.pom
2025-Nov-07 15:42:49.543744
#20 8.528 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-resources-plugin/3.3.1/maven-resources-plugin-3.3.1.pom (8.2 kB at 255 kB/s)
2025-Nov-07 15:42:49.543744
#20 8.538 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/39/maven-plugins-39.pom
2025-Nov-07 15:42:49.543744
#20 8.573 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/39/maven-plugins-39.pom (8.1 kB at 225 kB/s)
2025-Nov-07 15:42:49.543744
#20 8.577 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/39/maven-parent-39.pom
2025-Nov-07 15:42:49.543744
#20 8.619 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/39/maven-parent-39.pom (48 kB at 1.1 MB/s)
2025-Nov-07 15:42:49.673557
#20 8.638 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-resources-plugin/3.3.1/maven-resources-plugin-3.3.1.jar
2025-Nov-07 15:42:49.673557
#20 8.675 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-resources-plugin/3.3.1/maven-resources-plugin-3.3.1.jar (31 kB at 837 kB/s)
2025-Nov-07 15:42:49.673557
#20 8.679 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-jar-plugin/3.4.2/maven-jar-plugin-3.4.2.pom
2025-Nov-07 15:42:49.673557
#20 8.711 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-jar-plugin/3.4.2/maven-jar-plugin-3.4.2.pom (7.7 kB at 240 kB/s)
2025-Nov-07 15:42:49.673557
#20 8.716 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/42/maven-plugins-42.pom
2025-Nov-07 15:42:49.673557
#20 8.749 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/42/maven-plugins-42.pom (7.7 kB at 233 kB/s)
2025-Nov-07 15:42:49.816444
#20 8.758 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/42/maven-parent-42.pom
2025-Nov-07 15:42:49.816444
#20 8.789 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/42/maven-parent-42.pom (50 kB at 1.6 MB/s)
2025-Nov-07 15:42:49.816444
#20 8.794 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/32/apache-32.pom
2025-Nov-07 15:42:49.816444
#20 8.831 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/32/apache-32.pom (24 kB at 654 kB/s)
2025-Nov-07 15:42:49.816444
#20 8.843 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.10.2/junit-bom-5.10.2.pom
2025-Nov-07 15:42:49.816444
#20 8.889 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.10.2/junit-bom-5.10.2.pom (5.6 kB at 123 kB/s)
2025-Nov-07 15:42:49.916926
#20 8.907 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-jar-plugin/3.4.2/maven-jar-plugin-3.4.2.jar
2025-Nov-07 15:42:49.916926
#20 8.944 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-jar-plugin/3.4.2/maven-jar-plugin-3.4.2.jar (34 kB at 920 kB/s)
2025-Nov-07 15:42:49.916926
#20 8.952 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-surefire-plugin/3.5.4/maven-surefire-plugin-3.5.4.pom
2025-Nov-07 15:42:49.916926
#20 8.988 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-surefire-plugin/3.5.4/maven-surefire-plugin-3.5.4.pom (4.9 kB at 122 kB/s)
2025-Nov-07 15:42:50.049321
#20 9.001 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire/3.5.4/surefire-3.5.4.pom
2025-Nov-07 15:42:50.049321
#20 9.036 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire/3.5.4/surefire-3.5.4.pom (19 kB at 547 kB/s)
2025-Nov-07 15:42:50.049321
#20 9.040 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/44/maven-parent-44.pom
2025-Nov-07 15:42:50.049321
#20 9.080 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/44/maven-parent-44.pom (52 kB at 1.3 MB/s)
2025-Nov-07 15:42:50.049321
#20 9.087 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/34/apache-34.pom
2025-Nov-07 15:42:50.049321
#20 9.123 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/34/apache-34.pom (24 kB at 674 kB/s)
2025-Nov-07 15:42:50.158996
#20 9.135 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.12.1/junit-bom-5.12.1.pom
2025-Nov-07 15:42:50.158996
#20 9.170 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.12.1/junit-bom-5.12.1.pom (5.6 kB at 161 kB/s)
2025-Nov-07 15:42:50.158996
#20 9.177 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-surefire-plugin/3.5.4/maven-surefire-plugin-3.5.4.jar
2025-Nov-07 15:42:50.158996
#20 9.214 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-surefire-plugin/3.5.4/maven-surefire-plugin-3.5.4.jar (46 kB at 1.2 MB/s)
2025-Nov-07 15:42:50.158996
#20 9.233 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-install-plugin/3.1.4/maven-install-plugin-3.1.4.pom
2025-Nov-07 15:42:50.296680
#20 9.274 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-install-plugin/3.1.4/maven-install-plugin-3.1.4.pom (8.1 kB at 197 kB/s)
2025-Nov-07 15:42:50.296680
#20 9.286 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-install-plugin/3.1.4/maven-install-plugin-3.1.4.jar
2025-Nov-07 15:42:50.296680
#20 9.325 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-install-plugin/3.1.4/maven-install-plugin-3.1.4.jar (33 kB at 881 kB/s)
2025-Nov-07 15:42:50.296680
#20 9.330 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-deploy-plugin/3.1.4/maven-deploy-plugin-3.1.4.pom
2025-Nov-07 15:42:50.296680
#20 9.372 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-deploy-plugin/3.1.4/maven-deploy-plugin-3.1.4.pom (9.2 kB at 205 kB/s)
2025-Nov-07 15:42:50.398157
#20 9.384 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-deploy-plugin/3.1.4/maven-deploy-plugin-3.1.4.jar
2025-Nov-07 15:42:50.398157
#20 9.422 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-deploy-plugin/3.1.4/maven-deploy-plugin-3.1.4.jar (40 kB at 1.0 MB/s)
2025-Nov-07 15:42:50.398157
#20 9.427 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-site-plugin/3.12.1/maven-site-plugin-3.12.1.pom
2025-Nov-07 15:42:50.398157
#20 9.474 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-site-plugin/3.12.1/maven-site-plugin-3.12.1.pom (20 kB at 423 kB/s)
2025-Nov-07 15:42:50.521251
#20 9.482 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/36/maven-plugins-36.pom
2025-Nov-07 15:42:50.529215
#20 9.512 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/36/maven-plugins-36.pom (9.9 kB at 330 kB/s)
2025-Nov-07 15:42:50.529215
#20 9.516 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/36/maven-parent-36.pom
2025-Nov-07 15:42:50.529215
#20 9.549 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/36/maven-parent-36.pom (45 kB at 1.4 MB/s)
2025-Nov-07 15:42:50.529215
#20 9.554 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/26/apache-26.pom
2025-Nov-07 15:42:50.529215
#20 9.597 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/26/apache-26.pom (21 kB at 489 kB/s)
2025-Nov-07 15:42:50.632935
#20 9.619 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-site-plugin/3.12.1/maven-site-plugin-3.12.1.jar
2025-Nov-07 15:42:50.632935
#20 9.657 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-site-plugin/3.12.1/maven-site-plugin-3.12.1.jar (119 kB at 3.1 MB/s)
2025-Nov-07 15:42:50.632935
#20 9.671 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/mojo/build-helper-maven-plugin/3.6.1/build-helper-maven-plugin-3.6.1.pom
2025-Nov-07 15:42:50.632935
#20 9.709 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/mojo/build-helper-maven-plugin/3.6.1/build-helper-maven-plugin-3.6.1.pom (8.1 kB at 214 kB/s)
2025-Nov-07 15:42:50.741437
#20 9.717 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/mojo/mojo-parent/91/mojo-parent-91.pom
2025-Nov-07 15:42:50.741437
#20 9.765 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/mojo/mojo-parent/91/mojo-parent-91.pom (38 kB at 839 kB/s)
2025-Nov-07 15:42:50.741437
#20 9.777 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.13.0/junit-bom-5.13.0.pom
2025-Nov-07 15:42:50.741437
#20 9.816 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.13.0/junit-bom-5.13.0.pom (5.6 kB at 145 kB/s)
2025-Nov-07 15:42:50.843223
#20 9.824 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/mojo/build-helper-maven-plugin/3.6.1/build-helper-maven-plugin-3.6.1.jar
2025-Nov-07 15:42:50.843223
#20 9.867 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/mojo/build-helper-maven-plugin/3.6.1/build-helper-maven-plugin-3.6.1.jar (72 kB at 1.7 MB/s)
2025-Nov-07 15:42:50.843223
#20 9.881 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/cyclonedx/cyclonedx-maven-plugin/2.9.1/cyclonedx-maven-plugin-2.9.1.pom
2025-Nov-07 15:42:50.843223
#20 9.919 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/cyclonedx/cyclonedx-maven-plugin/2.9.1/cyclonedx-maven-plugin-2.9.1.pom (19 kB at 488 kB/s)
2025-Nov-07 15:42:50.963075
#20 9.934 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.2/junit-bom-5.11.2.pom
2025-Nov-07 15:42:50.963075
#20 9.986 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.2/junit-bom-5.11.2.pom (5.6 kB at 111 kB/s)
2025-Nov-07 15:42:50.963075
#20 9.997 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/cyclonedx/cyclonedx-maven-plugin/2.9.1/cyclonedx-maven-plugin-2.9.1.jar
2025-Nov-07 15:42:50.963075
#20 10.04 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/cyclonedx/cyclonedx-maven-plugin/2.9.1/cyclonedx-maven-plugin-2.9.1.jar (52 kB at 1.3 MB/s)
2025-Nov-07 15:42:51.108263
#20 10.05 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/flywaydb/flyway-maven-plugin/11.7.2/flyway-maven-plugin-11.7.2.pom
2025-Nov-07 15:42:51.108263
#20 10.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/flywaydb/flyway-maven-plugin/11.7.2/flyway-maven-plugin-11.7.2.pom (3.8 kB at 108 kB/s)
2025-Nov-07 15:42:51.108263
#20 10.09 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/flywaydb/flyway-parent/11.7.2/flyway-parent-11.7.2.pom
2025-Nov-07 15:42:51.108263
#20 10.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/flywaydb/flyway-parent/11.7.2/flyway-parent-11.7.2.pom (36 kB at 888 kB/s)
2025-Nov-07 15:42:51.108263
#20 10.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/flywaydb/flyway-maven-plugin/11.7.2/flyway-maven-plugin-11.7.2.jar
2025-Nov-07 15:42:51.108263
#20 10.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/flywaydb/flyway-maven-plugin/11.7.2/flyway-maven-plugin-11.7.2.jar (110 kB at 2.4 MB/s)
2025-Nov-07 15:42:51.217275
#20 10.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/github/git-commit-id/git-commit-id-maven-plugin/9.0.2/git-commit-id-maven-plugin-9.0.2.pom
2025-Nov-07 15:42:51.217275
#20 10.24 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/github/git-commit-id/git-commit-id-maven-plugin/9.0.2/git-commit-id-maven-plugin-9.0.2.pom (28 kB at 688 kB/s)
2025-Nov-07 15:42:51.217275
#20 10.25 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/oss/oss-parent/9/oss-parent-9.pom
2025-Nov-07 15:42:51.217275
#20 10.29 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/oss/oss-parent/9/oss-parent-9.pom (6.6 kB at 173 kB/s)
2025-Nov-07 15:42:51.351153
#20 10.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/github/git-commit-id/git-commit-id-maven-plugin/9.0.2/git-commit-id-maven-plugin-9.0.2.jar
2025-Nov-07 15:42:51.351153
#20 10.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/github/git-commit-id/git-commit-id-maven-plugin/9.0.2/git-commit-id-maven-plugin-9.0.2.jar (55 kB at 1.5 MB/s)
2025-Nov-07 15:42:51.351153
#20 10.35 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jooq/jooq-codegen-maven/3.19.26/jooq-codegen-maven-3.19.26.pom
2025-Nov-07 15:42:51.351153
#20 10.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jooq/jooq-codegen-maven/3.19.26/jooq-codegen-maven-3.19.26.pom (3.8 kB at 100 kB/s)
2025-Nov-07 15:42:51.351153
#20 10.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jooq/jooq-parent/3.19.26/jooq-parent-3.19.26.pom
2025-Nov-07 15:42:51.351153
#20 10.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jooq/jooq-parent/3.19.26/jooq-parent-3.19.26.pom (41 kB at 1.1 MB/s)
2025-Nov-07 15:42:51.461140
#20 10.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jooq/jooq-codegen-maven/3.19.26/jooq-codegen-maven-3.19.26.jar
2025-Nov-07 15:42:51.461140
#20 10.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jooq/jooq-codegen-maven/3.19.26/jooq-codegen-maven-3.19.26.jar (18 kB at 482 kB/s)
2025-Nov-07 15:42:51.461140
#20 10.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-maven-plugin/1.9.25/kotlin-maven-plugin-1.9.25.pom
2025-Nov-07 15:42:51.461140
#20 10.54 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-maven-plugin/1.9.25/kotlin-maven-plugin-1.9.25.pom (6.7 kB at 209 kB/s)
2025-Nov-07 15:42:51.588878
#20 10.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-project/1.9.25/kotlin-project-1.9.25.pom
2025-Nov-07 15:42:51.588878
#20 10.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-project/1.9.25/kotlin-project-1.9.25.pom (16 kB at 279 kB/s)
2025-Nov-07 15:42:51.588878
#20 10.62 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-maven-plugin/1.9.25/kotlin-maven-plugin-1.9.25.jar
2025-Nov-07 15:42:51.588878
#20 10.66 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-maven-plugin/1.9.25/kotlin-maven-plugin-1.9.25.jar (82 kB at 1.8 MB/s)
2025-Nov-07 15:42:51.703936
#20 10.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/liquibase/liquibase-maven-plugin/4.31.1/liquibase-maven-plugin-4.31.1.pom
2025-Nov-07 15:42:51.703936
#20 10.72 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/liquibase/liquibase-maven-plugin/4.31.1/liquibase-maven-plugin-4.31.1.pom (2.0 kB at 50 kB/s)
2025-Nov-07 15:42:51.703936
#20 10.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/liquibase/liquibase-maven-plugin/4.31.1/liquibase-maven-plugin-4.31.1.jar
2025-Nov-07 15:42:51.703936
#20 10.78 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/liquibase/liquibase-maven-plugin/4.31.1/liquibase-maven-plugin-4.31.1.jar (352 kB at 7.7 MB/s)
2025-Nov-07 15:42:51.837126
#20 10.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-antrun-plugin/3.1.0/maven-antrun-plugin-3.1.0.pom
2025-Nov-07 15:42:51.837126
#20 10.87 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-antrun-plugin/3.1.0/maven-antrun-plugin-3.1.0.pom (9.1 kB at 253 kB/s)
2025-Nov-07 15:42:51.837126
#20 10.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/34/maven-plugins-34.pom
2025-Nov-07 15:42:51.837126
#20 10.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/34/maven-plugins-34.pom (11 kB at 324 kB/s)
2025-Nov-07 15:42:51.948152
#20 10.93 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/34/maven-parent-34.pom
2025-Nov-07 15:42:51.948152
#20 10.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/34/maven-parent-34.pom (43 kB at 808 kB/s)
2025-Nov-07 15:42:51.948152
#20 10.99 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/23/apache-23.pom
2025-Nov-07 15:42:51.948152
#20 11.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/23/apache-23.pom (18 kB at 594 kB/s)
2025-Nov-07 15:42:52.051185
#20 11.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-antrun-plugin/3.1.0/maven-antrun-plugin-3.1.0.jar
2025-Nov-07 15:42:52.051185
#20 11.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-antrun-plugin/3.1.0/maven-antrun-plugin-3.1.0.jar (41 kB at 981 kB/s)
2025-Nov-07 15:42:52.051185
#20 11.09 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-assembly-plugin/3.7.1/maven-assembly-plugin-3.7.1.pom
2025-Nov-07 15:42:52.051185
#20 11.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-assembly-plugin/3.7.1/maven-assembly-plugin-3.7.1.pom (15 kB at 400 kB/s)
2025-Nov-07 15:42:52.160184
#20 11.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/41/maven-plugins-41.pom
2025-Nov-07 15:42:52.160184
#20 11.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-plugins/41/maven-plugins-41.pom (7.4 kB at 153 kB/s)
2025-Nov-07 15:42:52.160184
#20 11.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/41/maven-parent-41.pom
2025-Nov-07 15:42:52.160184
#20 11.24 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/41/maven-parent-41.pom (50 kB at 1.1 MB/s)
2025-Nov-07 15:42:52.292754
#20 11.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/31/apache-31.pom
2025-Nov-07 15:42:52.292754
#20 11.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/31/apache-31.pom (24 kB at 523 kB/s)
2025-Nov-07 15:42:52.292754
#20 11.32 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-assembly-plugin/3.7.1/maven-assembly-plugin-3.7.1.jar
2025-Nov-07 15:42:52.292754
#20 11.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-assembly-plugin/3.7.1/maven-assembly-plugin-3.7.1.jar (240 kB at 4.8 MB/s)
2025-Nov-07 15:42:52.394041
#20 11.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-dependency-plugin/3.8.1/maven-dependency-plugin-3.8.1.pom
2025-Nov-07 15:42:52.394041
#20 11.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-dependency-plugin/3.8.1/maven-dependency-plugin-3.8.1.pom (18 kB at 581 kB/s)
2025-Nov-07 15:42:52.394041
#20 11.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-dependency-plugin/3.8.1/maven-dependency-plugin-3.8.1.jar
2025-Nov-07 15:42:52.394041
#20 11.47 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-dependency-plugin/3.8.1/maven-dependency-plugin-3.8.1.jar (208 kB at 4.6 MB/s)
2025-Nov-07 15:42:52.520112
#20 11.51 [INFO]
2025-Nov-07 15:42:52.520112
#20 11.51 [INFO] -------------------< com.follysitou:sellia-backend >--------------------
2025-Nov-07 15:42:52.520112
#20 11.51 [INFO] Building sellia-backend 0.0.1-SNAPSHOT
2025-Nov-07 15:42:52.520112
#20 11.51 [INFO]   from pom.xml
2025-Nov-07 15:42:52.520112
#20 11.51 [INFO] --------------------------------[ jar ]---------------------------------
2025-Nov-07 15:42:52.520112
#20 11.53 [INFO]
2025-Nov-07 15:42:52.520112
#20 11.53 [INFO] --- dependency:3.8.1:go-offline (default-cli) @ sellia-backend ---
2025-Nov-07 15:42:52.520112
#20 11.56 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/2.0.0/doxia-sink-api-2.0.0.pom
2025-Nov-07 15:42:52.520112
#20 11.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/2.0.0/doxia-sink-api-2.0.0.pom (1.4 kB at 42 kB/s)
2025-Nov-07 15:42:52.650450
#20 11.60 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia/2.0.0/doxia-2.0.0.pom
2025-Nov-07 15:42:52.650450
#20 11.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia/2.0.0/doxia-2.0.0.pom (17 kB at 430 kB/s)
2025-Nov-07 15:42:52.650450
#20 11.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.1/junit-bom-5.11.1.pom
2025-Nov-07 15:42:52.650450
#20 11.68 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.1/junit-bom-5.11.1.pom (5.6 kB at 209 kB/s)
2025-Nov-07 15:42:52.650450
#20 11.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/4.0.0/maven-reporting-api-4.0.0.pom
2025-Nov-07 15:42:52.650450
#20 11.73 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/4.0.0/maven-reporting-api-4.0.0.pom (2.8 kB at 72 kB/s)
2025-Nov-07 15:42:52.758438
#20 11.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/43/maven-shared-components-43.pom
2025-Nov-07 15:42:52.758438
#20 11.77 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/43/maven-shared-components-43.pom (3.8 kB at 92 kB/s)
2025-Nov-07 15:42:52.758438
#20 11.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-impl/4.0.0/maven-reporting-impl-4.0.0.pom
2025-Nov-07 15:42:52.758438
#20 11.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-impl/4.0.0/maven-reporting-impl-4.0.0.pom (8.8 kB at 214 kB/s)
2025-Nov-07 15:42:52.864852
#20 11.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.4.2/maven-shared-utils-3.4.2.pom
2025-Nov-07 15:42:52.864852
#20 11.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.4.2/maven-shared-utils-3.4.2.pom (5.9 kB at 144 kB/s)
2025-Nov-07 15:42:52.864852
#20 11.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/39/maven-shared-components-39.pom
2025-Nov-07 15:42:52.864852
#20 11.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/39/maven-shared-components-39.pom (3.2 kB at 129 kB/s)
2025-Nov-07 15:42:52.978558
#20 11.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.36/slf4j-api-1.7.36.pom
2025-Nov-07 15:42:52.978558
#20 11.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.36/slf4j-api-1.7.36.pom (2.7 kB at 91 kB/s)
2025-Nov-07 15:42:52.978558
#20 11.98 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/1.7.36/slf4j-parent-1.7.36.pom
2025-Nov-07 15:42:52.978558
#20 12.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/1.7.36/slf4j-parent-1.7.36.pom (14 kB at 486 kB/s)
2025-Nov-07 15:42:52.978558
#20 12.02 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.11.0/commons-io-2.11.0.pom
2025-Nov-07 15:42:52.978558
#20 12.05 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.11.0/commons-io-2.11.0.pom (20 kB at 564 kB/s)
2025-Nov-07 15:42:53.117188
#20 12.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/52/commons-parent-52.pom
2025-Nov-07 15:42:53.117188
#20 12.10 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/52/commons-parent-52.pom (79 kB at 1.9 MB/s)
2025-Nov-07 15:42:53.117188
#20 12.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.7.2/junit-bom-5.7.2.pom
2025-Nov-07 15:42:53.117188
#20 12.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.7.2/junit-bom-5.7.2.pom (5.1 kB at 164 kB/s)
2025-Nov-07 15:42:53.117188
#20 12.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-model/2.0.0/doxia-site-model-2.0.0.pom
2025-Nov-07 15:42:53.117188
#20 12.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-model/2.0.0/doxia-site-model-2.0.0.pom (5.8 kB at 139 kB/s)
2025-Nov-07 15:42:53.238919
#20 12.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sitetools/2.0.0/doxia-sitetools-2.0.0.pom
2025-Nov-07 15:42:53.238919
#20 12.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sitetools/2.0.0/doxia-sitetools-2.0.0.pom (12 kB at 363 kB/s)
2025-Nov-07 15:42:53.238919
#20 12.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.plexus/0.9.0.M3/org.eclipse.sisu.plexus-0.9.0.M3.pom
2025-Nov-07 15:42:53.238919
#20 12.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.plexus/0.9.0.M3/org.eclipse.sisu.plexus-0.9.0.M3.pom (17 kB at 460 kB/s)
2025-Nov-07 15:42:53.238919
#20 12.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/sisu-inject/0.9.0.M3/sisu-inject-0.9.0.M3.pom
2025-Nov-07 15:42:53.238919
#20 12.31 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/sisu-inject/0.9.0.M3/sisu-inject-0.9.0.M3.pom (24 kB at 735 kB/s)
2025-Nov-07 15:42:53.352966
#20 12.32 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.inject/0.9.0.M3/org.eclipse.sisu.inject-0.9.0.M3.pom
2025-Nov-07 15:42:53.352966
#20 12.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.inject/0.9.0.M3/org.eclipse.sisu.inject-0.9.0.M3.pom (20 kB at 478 kB/s)
2025-Nov-07 15:42:53.352966
#20 12.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.1.0/plexus-component-annotations-2.1.0.pom
2025-Nov-07 15:42:53.352966
#20 12.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.1.0/plexus-component-annotations-2.1.0.pom (750 B at 15 kB/s)
2025-Nov-07 15:42:53.464521
#20 12.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/2.1.0/plexus-containers-2.1.0.pom
2025-Nov-07 15:42:53.464521
#20 12.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/2.1.0/plexus-containers-2.1.0.pom (4.8 kB at 87 kB/s)
2025-Nov-07 15:42:53.464521
#20 12.51 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/5.1/plexus-5.1.pom
2025-Nov-07 15:42:53.464521
#20 12.54 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/5.1/plexus-5.1.pom (23 kB at 776 kB/s)
2025-Nov-07 15:42:53.594314
#20 12.55 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.6.0/plexus-classworlds-2.6.0.pom
2025-Nov-07 15:42:53.594314
#20 12.59 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.6.0/plexus-classworlds-2.6.0.pom (7.9 kB at 203 kB/s)
2025-Nov-07 15:42:53.594314
#20 12.60 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/4.0.1/plexus-utils-4.0.1.pom
2025-Nov-07 15:42:53.594314
#20 12.63 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/4.0.1/plexus-utils-4.0.1.pom (7.8 kB at 224 kB/s)
2025-Nov-07 15:42:53.594314
#20 12.64 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/17/plexus-17.pom
2025-Nov-07 15:42:53.594314
#20 12.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/17/plexus-17.pom (28 kB at 972 kB/s)
2025-Nov-07 15:42:53.704328
#20 12.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-xml/3.0.1/plexus-xml-3.0.1.pom
2025-Nov-07 15:42:53.712049
#20 12.72 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-xml/3.0.1/plexus-xml-3.0.1.pom (3.7 kB at 92 kB/s)
2025-Nov-07 15:42:53.712049
#20 12.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/18/plexus-18.pom
2025-Nov-07 15:42:53.712049
#20 12.78 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/18/plexus-18.pom (29 kB at 552 kB/s)
2025-Nov-07 15:42:53.831141
#20 12.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/javax/inject/javax.inject/1/javax.inject-1.pom
2025-Nov-07 15:42:53.831141
#20 12.82 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/javax/inject/javax.inject/1/javax.inject-1.pom (612 B at 22 kB/s)
2025-Nov-07 15:42:53.831141
#20 12.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-core/2.0.0/doxia-core-2.0.0.pom
2025-Nov-07 15:42:53.831141
#20 12.87 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-core/2.0.0/doxia-core-2.0.0.pom (3.9 kB at 93 kB/s)
2025-Nov-07 15:42:53.831141
#20 12.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.17.0/commons-io-2.17.0.pom
2025-Nov-07 15:42:53.942371
2025-Nov-07 15:42:53.954756
#20 12.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.17.0/commons-io-2.17.0.pom (20 kB at 409 kB/s)
2025-Nov-07 15:42:53.954756
#20 12.98 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/74/commons-parent-74.pom
2025-Nov-07 15:42:53.954756
#20 13.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/74/commons-parent-74.pom (78 kB at 1.9 MB/s)
2025-Nov-07 15:42:54.074688
#20 13.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.0/junit-bom-5.11.0.pom
2025-Nov-07 15:42:54.074688
#20 13.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.0/junit-bom-5.11.0.pom (5.6 kB at 188 kB/s)
2025-Nov-07 15:42:54.074688
#20 13.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-text/1.12.0/commons-text-1.12.0.pom
2025-Nov-07 15:42:54.074688
#20 13.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-text/1.12.0/commons-text-1.12.0.pom (20 kB at 620 kB/s)
2025-Nov-07 15:42:54.074688
#20 13.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/69/commons-parent-69.pom
2025-Nov-07 15:42:54.074688
#20 13.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/69/commons-parent-69.pom (77 kB at 2.4 MB/s)
2025-Nov-07 15:42:54.202505
#20 13.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.14.0/commons-lang3-3.14.0.pom
2025-Nov-07 15:42:54.202505
#20 13.24 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.14.0/commons-lang3-3.14.0.pom (31 kB at 772 kB/s)
2025-Nov-07 15:42:54.202505
#20 13.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/64/commons-parent-64.pom
2025-Nov-07 15:42:54.202505
#20 13.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/64/commons-parent-64.pom (78 kB at 2.2 MB/s)
2025-Nov-07 15:42:54.313808
#20 13.29 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/30/apache-30.pom
2025-Nov-07 15:42:54.313808
#20 13.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/30/apache-30.pom (23 kB at 516 kB/s)
2025-Nov-07 15:42:54.313808
#20 13.35 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.10.0/junit-bom-5.10.0.pom
2025-Nov-07 15:42:54.313808
#20 13.39 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.10.0/junit-bom-5.10.0.pom (5.6 kB at 171 kB/s)
2025-Nov-07 15:42:54.444541
#20 13.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.17.0/commons-lang3-3.17.0.pom
2025-Nov-07 15:42:54.444541
#20 13.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.17.0/commons-lang3-3.17.0.pom (31 kB at 845 kB/s)
2025-Nov-07 15:42:54.444541
#20 13.44 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/73/commons-parent-73.pom
2025-Nov-07 15:42:54.444541
#20 13.47 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/73/commons-parent-73.pom (78 kB at 2.2 MB/s)
2025-Nov-07 15:42:54.444541
#20 13.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-integration-tools/2.0.0/doxia-integration-tools-2.0.0.pom
2025-Nov-07 15:42:54.444541
#20 13.52 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-integration-tools/2.0.0/doxia-integration-tools-2.0.0.pom (7.8 kB at 221 kB/s)
2025-Nov-07 15:42:54.565028
#20 13.53 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-i18n/1.0-beta-10/plexus-i18n-1.0-beta-10.pom
2025-Nov-07 15:42:54.565028
#20 13.57 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-i18n/1.0-beta-10/plexus-i18n-1.0-beta-10.pom (2.1 kB at 52 kB/s)
2025-Nov-07 15:42:54.565028
#20 13.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-components/1.1.12/plexus-components-1.1.12.pom
2025-Nov-07 15:42:54.565028
#20 13.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-components/1.1.12/plexus-components-1.1.12.pom (3.0 kB at 94 kB/s)
2025-Nov-07 15:42:54.565028
#20 13.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/1.0.10/plexus-1.0.10.pom
2025-Nov-07 15:42:54.565028
#20 13.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/1.0.10/plexus-1.0.10.pom (8.2 kB at 295 kB/s)
2025-Nov-07 15:42:54.683743
#20 13.66 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.27/plexus-interpolation-1.27.pom
2025-Nov-07 15:42:54.683743
#20 13.69 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.27/plexus-interpolation-1.27.pom (3.0 kB at 94 kB/s)
2025-Nov-07 15:42:54.683743
#20 13.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/16/plexus-16.pom
2025-Nov-07 15:42:54.683743
#20 13.73 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/16/plexus-16.pom (28 kB at 768 kB/s)
2025-Nov-07 15:42:54.683743
#20 13.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.10.1/junit-bom-5.10.1.pom
2025-Nov-07 15:42:54.683743
#20 13.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.10.1/junit-bom-5.10.1.pom (5.6 kB at 202 kB/s)
2025-Nov-07 15:42:54.785977
#20 13.77 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-renderer/2.0.0/doxia-site-renderer-2.0.0.pom
2025-Nov-07 15:42:54.785977
#20 13.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-renderer/2.0.0/doxia-site-renderer-2.0.0.pom (7.4 kB at 246 kB/s)
2025-Nov-07 15:42:54.785977
#20 13.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-skin-model/2.0.0/doxia-skin-model-2.0.0.pom
2025-Nov-07 15:42:54.785977
#20 13.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-skin-model/2.0.0/doxia-skin-model-2.0.0.pom (3.0 kB at 82 kB/s)
2025-Nov-07 15:42:54.785977
#20 13.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml5/2.0.0/doxia-module-xhtml5-2.0.0.pom
2025-Nov-07 15:42:54.941329
#20 13.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml5/2.0.0/doxia-module-xhtml5-2.0.0.pom (2.9 kB at 91 kB/s)
2025-Nov-07 15:42:54.941329
#20 13.90 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-modules/2.0.0/doxia-modules-2.0.0.pom
2025-Nov-07 15:42:54.941329
#20 13.93 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-modules/2.0.0/doxia-modules-2.0.0.pom (2.5 kB at 70 kB/s)
2025-Nov-07 15:42:54.941329
#20 13.94 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-velocity/2.2.0/plexus-velocity-2.2.0.pom
2025-Nov-07 15:42:54.941329
#20 14.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-velocity/2.2.0/plexus-velocity-2.2.0.pom (4.1 kB at 55 kB/s)
2025-Nov-07 15:42:55.054124
#20 14.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/19/plexus-19.pom
2025-Nov-07 15:42:55.054124
#20 14.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/19/plexus-19.pom (25 kB at 668 kB/s)
2025-Nov-07 15:42:55.054124
#20 14.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-core/2.4/velocity-engine-core-2.4.pom
2025-Nov-07 15:42:55.054124
#20 14.12 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-core/2.4/velocity-engine-core-2.4.pom (12 kB at 307 kB/s)
2025-Nov-07 15:42:55.160411
#20 14.13 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-parent/2.4/velocity-engine-parent-2.4.pom
2025-Nov-07 15:42:55.160411
#20 14.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-parent/2.4/velocity-engine-parent-2.4.pom (9.5 kB at 250 kB/s)
2025-Nov-07 15:42:55.160411
#20 14.18 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-master/7/velocity-master-7.pom
2025-Nov-07 15:42:55.160411
#20 14.21 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-master/7/velocity-master-7.pom (7.9 kB at 226 kB/s)
2025-Nov-07 15:42:55.160411
#20 14.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/tools/velocity-tools-generic/3.1/velocity-tools-generic-3.1.pom
2025-Nov-07 15:42:55.280765
#20 14.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/tools/velocity-tools-generic/3.1/velocity-tools-generic-3.1.pom (2.6 kB at 75 kB/s)
2025-Nov-07 15:42:55.280765
#20 14.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/tools/velocity-tools-parent/3.1/velocity-tools-parent-3.1.pom
2025-Nov-07 15:42:55.280765
#20 14.31 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/tools/velocity-tools-parent/3.1/velocity-tools-parent-3.1.pom (8.0 kB at 236 kB/s)
2025-Nov-07 15:42:55.280765
#20 14.32 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-master/4/velocity-master-4.pom
2025-Nov-07 15:42:55.280765
#20 14.35 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-master/4/velocity-master-4.pom (7.8 kB at 243 kB/s)
2025-Nov-07 15:42:55.377327
#20 14.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-core/2.3/velocity-engine-core-2.3.pom
2025-Nov-07 15:42:55.377327
#20 14.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-core/2.3/velocity-engine-core-2.3.pom (10 kB at 308 kB/s)
2025-Nov-07 15:42:55.377327
#20 14.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-parent/2.3/velocity-engine-parent-2.3.pom
2025-Nov-07 15:42:55.377327
#20 14.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-parent/2.3/velocity-engine-parent-2.3.pom (14 kB at 461 kB/s)
2025-Nov-07 15:42:55.377327
#20 14.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.11/commons-lang3-3.11.pom
2025-Nov-07 15:42:55.489214
#20 14.49 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.11/commons-lang3-3.11.pom (30 kB at 883 kB/s)
2025-Nov-07 15:42:55.489214
#20 14.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/51/commons-parent-51.pom
2025-Nov-07 15:42:55.489214
#20 14.55 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/51/commons-parent-51.pom (78 kB at 1.8 MB/s)
2025-Nov-07 15:42:55.489214
#20 14.56 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.30/slf4j-api-1.7.30.pom
2025-Nov-07 15:42:55.613764
#20 14.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.30/slf4j-api-1.7.30.pom (3.8 kB at 101 kB/s)
2025-Nov-07 15:42:55.613764
#20 14.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/1.7.30/slf4j-parent-1.7.30.pom
2025-Nov-07 15:42:55.613764
#20 14.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/1.7.30/slf4j-parent-1.7.30.pom (14 kB at 445 kB/s)
2025-Nov-07 15:42:55.613764
#20 14.66 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.9.4/commons-beanutils-1.9.4.pom
2025-Nov-07 15:42:55.613764
#20 14.69 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.9.4/commons-beanutils-1.9.4.pom (18 kB at 581 kB/s)
2025-Nov-07 15:42:55.736883
#20 14.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/47/commons-parent-47.pom
2025-Nov-07 15:42:55.736883
#20 14.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/47/commons-parent-47.pom (78 kB at 1.7 MB/s)
2025-Nov-07 15:42:55.736883
#20 14.77 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/19/apache-19.pom
2025-Nov-07 15:42:55.736883
#20 14.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/19/apache-19.pom (15 kB at 408 kB/s)
2025-Nov-07 15:42:55.885218
#20 14.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.2/commons-logging-1.2.pom
2025-Nov-07 15:42:55.885218
#20 14.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.2/commons-logging-1.2.pom (19 kB at 519 kB/s)
2025-Nov-07 15:42:55.885218
#20 14.89 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/34/commons-parent-34.pom
2025-Nov-07 15:42:55.885218
#20 14.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/34/commons-parent-34.pom (56 kB at 848 kB/s)
2025-Nov-07 15:42:56.008728
#20 14.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/13/apache-13.pom
2025-Nov-07 15:42:56.008728
#20 15.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/13/apache-13.pom (14 kB at 399 kB/s)
2025-Nov-07 15:42:56.008728
#20 15.02 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.2/commons-collections-3.2.2.pom
2025-Nov-07 15:42:56.008728
#20 15.05 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.2/commons-collections-3.2.2.pom (12 kB at 443 kB/s)
2025-Nov-07 15:42:56.008728
#20 15.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/39/commons-parent-39.pom
2025-Nov-07 15:42:56.008728
#20 15.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/39/commons-parent-39.pom (62 kB at 2.2 MB/s)
2025-Nov-07 15:42:56.129723
#20 15.10 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/16/apache-16.pom
2025-Nov-07 15:42:56.129723
#20 15.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/16/apache-16.pom (15 kB at 367 kB/s)
2025-Nov-07 15:42:56.129723
#20 15.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-digester3/3.2/commons-digester3-3.2.pom
2025-Nov-07 15:42:56.129723
#20 15.20 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-digester3/3.2/commons-digester3-3.2.pom (18 kB at 345 kB/s)
2025-Nov-07 15:42:56.233134
#20 15.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/22/commons-parent-22.pom
2025-Nov-07 15:42:56.233134
#20 15.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/22/commons-parent-22.pom (42 kB at 1.1 MB/s)
2025-Nov-07 15:42:56.233134
#20 15.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/9/apache-9.pom
2025-Nov-07 15:42:56.233134
#20 15.31 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/9/apache-9.pom (15 kB at 421 kB/s)
2025-Nov-07 15:42:56.337885
#20 15.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.8.3/commons-beanutils-1.8.3.pom
2025-Nov-07 15:42:56.337885
#20 15.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.8.3/commons-beanutils-1.8.3.pom (11 kB at 215 kB/s)
2025-Nov-07 15:42:56.337885
#20 15.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/14/commons-parent-14.pom
2025-Nov-07 15:42:56.337885
#20 15.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/14/commons-parent-14.pom (31 kB at 1.0 MB/s)
2025-Nov-07 15:42:56.337885
#20 15.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/7/apache-7.pom
2025-Nov-07 15:42:56.445135
#20 15.44 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/7/apache-7.pom (14 kB at 401 kB/s)
2025-Nov-07 15:42:56.445135
#20 15.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.1.1/commons-logging-1.1.1.pom
2025-Nov-07 15:42:56.445135
#20 15.52 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.1.1/commons-logging-1.1.1.pom (18 kB at 274 kB/s)
2025-Nov-07 15:42:56.445135
#20 ...
2025-Nov-07 15:42:56.445135
2025-Nov-07 15:42:56.445135
#17 [frontend-builder 4/6] RUN npm ci
2025-Nov-07 15:42:56.445135
#17 5.559 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
2025-Nov-07 15:42:56.445135
#17 6.630 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
2025-Nov-07 15:42:56.445135
#17 6.632 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
2025-Nov-07 15:42:56.445135
#17 15.45
2025-Nov-07 15:42:56.445135
#17 15.45 added 653 packages, and audited 654 packages in 15s
2025-Nov-07 15:42:56.445135
#17 15.45
2025-Nov-07 15:42:56.445135
#17 15.45 118 packages are looking for funding
2025-Nov-07 15:42:56.445135
#17 15.45   run `npm fund` for details
2025-Nov-07 15:42:56.445135
#17 15.48
2025-Nov-07 15:42:56.445135
#17 15.48 3 moderate severity vulnerabilities
2025-Nov-07 15:42:56.445135
#17 15.48
2025-Nov-07 15:42:56.445135
#17 15.48 To address all issues, run:
2025-Nov-07 15:42:56.445135
#17 15.48   npm audit fix
2025-Nov-07 15:42:56.445135
#17 15.48
2025-Nov-07 15:42:56.445135
#17 15.48 Run `npm audit` for details.
2025-Nov-07 15:42:56.445135
#17 15.48 npm notice
2025-Nov-07 15:42:56.445135
#17 15.48 npm notice New major version of npm available! 10.8.2 -> 11.6.2
2025-Nov-07 15:42:56.445135
#17 15.48 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.6.2
2025-Nov-07 15:42:56.445135
#17 15.48 npm notice To update run: npm install -g npm@11.6.2
2025-Nov-07 15:42:56.445135
#17 15.48 npm notice
2025-Nov-07 15:42:56.559523
#17 ...
2025-Nov-07 15:42:56.559523
2025-Nov-07 15:42:56.559523
#20 [backend-builder 6/9] RUN mvn dependency:go-offline -B
2025-Nov-07 15:42:56.559523
#20 15.53 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/5/commons-parent-5.pom
2025-Nov-07 15:42:56.559523
#20 15.56 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/5/commons-parent-5.pom (16 kB at 472 kB/s)
2025-Nov-07 15:42:56.559523
#20 15.56 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/4/apache-4.pom
2025-Nov-07 15:42:56.559523
#20 15.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/4/apache-4.pom (4.5 kB at 132 kB/s)
2025-Nov-07 15:42:56.559523
#20 15.60 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.10/commons-lang3-3.10.pom
2025-Nov-07 15:42:56.559523
#20 15.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.10/commons-lang3-3.10.pom (31 kB at 898 kB/s)
2025-Nov-07 15:42:56.678989
2025-Nov-07 15:42:56.687176
#20 ...
2025-Nov-07 15:42:56.687176
2025-Nov-07 15:42:56.687176
#17 [frontend-builder 4/6] RUN npm ci
2025-Nov-07 15:42:56.687176
#17 DONE 15.7s
2025-Nov-07 15:42:56.687176
2025-Nov-07 15:42:56.687176
#21 [frontend-builder 5/6] COPY sellia-app/ ./
2025-Nov-07 15:42:56.687176
#21 DONE 0.1s
2025-Nov-07 15:42:56.687176
2025-Nov-07 15:42:56.687176
#20 [backend-builder 6/9] RUN mvn dependency:go-offline -B
2025-Nov-07 15:42:56.687176
#20 15.64 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/50/commons-parent-50.pom
2025-Nov-07 15:42:56.687176
#20 15.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/50/commons-parent-50.pom (76 kB at 2.2 MB/s)
2025-Nov-07 15:42:56.687176
#20 15.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/21/apache-21.pom
2025-Nov-07 15:42:56.687176
#20 15.72 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/21/apache-21.pom (17 kB at 417 kB/s)
2025-Nov-07 15:42:56.687176
#20 15.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/cliftonlabs/json-simple/3.0.2/json-simple-3.0.2.pom
2025-Nov-07 15:42:56.687176
#20 15.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/cliftonlabs/json-simple/3.0.2/json-simple-3.0.2.pom (7.5 kB at 249 kB/s)
2025-Nov-07 15:42:56.780177
#20 15.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-apt/2.0.0/doxia-module-apt-2.0.0.pom
2025-Nov-07 15:42:56.780177
#20 15.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-apt/2.0.0/doxia-module-apt-2.0.0.pom (2.9 kB at 95 kB/s)
2025-Nov-07 15:42:56.780177
#20 15.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xdoc/2.0.0/doxia-module-xdoc-2.0.0.pom
2025-Nov-07 15:42:56.780177
#20 15.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xdoc/2.0.0/doxia-module-xdoc-2.0.0.pom (5.4 kB at 115 kB/s)
2025-Nov-07 15:42:56.882550
#20 15.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-archiver/3.6.2/maven-archiver-3.6.2.pom
2025-Nov-07 15:42:56.882550
#20 15.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-archiver/3.6.2/maven-archiver-3.6.2.pom (4.4 kB at 122 kB/s)
2025-Nov-07 15:42:56.882550
#20 15.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/41/maven-shared-components-41.pom
2025-Nov-07 15:42:56.882550
#20 15.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/41/maven-shared-components-41.pom (3.2 kB at 65 kB/s)
2025-Nov-07 15:42:56.985155
#20 15.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.9.2/plexus-archiver-4.9.2.pom
2025-Nov-07 15:42:56.985155
#20 16.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.9.2/plexus-archiver-4.9.2.pom (6.0 kB at 154 kB/s)
2025-Nov-07 15:42:56.985155
#20 16.01 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.4.2/plexus-io-3.4.2.pom
2025-Nov-07 15:42:56.985155
#20 16.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.4.2/plexus-io-3.4.2.pom (3.9 kB at 76 kB/s)
2025-Nov-07 15:42:57.107294
#20 16.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.15.1/commons-io-2.15.1.pom
2025-Nov-07 15:42:57.107294
#20 16.10 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.15.1/commons-io-2.15.1.pom (20 kB at 512 kB/s)
2025-Nov-07 15:42:57.107294
#20 16.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/65/commons-parent-65.pom
2025-Nov-07 15:42:57.107294
#20 16.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/65/commons-parent-65.pom (78 kB at 2.4 MB/s)
2025-Nov-07 15:42:57.107294
#20 16.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.26.1/commons-compress-1.26.1.pom
2025-Nov-07 15:42:57.107294
#20 16.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.26.1/commons-compress-1.26.1.pom (22 kB at 658 kB/s)
2025-Nov-07 15:42:57.227162
#20 16.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/66/commons-parent-66.pom
2025-Nov-07 15:42:57.227162
#20 16.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/66/commons-parent-66.pom (77 kB at 2.5 MB/s)
2025-Nov-07 15:42:57.227162
#20 16.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.16.1/commons-codec-1.16.1.pom
2025-Nov-07 15:42:57.227162
#20 16.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.16.1/commons-codec-1.16.1.pom (16 kB at 603 kB/s)
2025-Nov-07 15:42:57.227162
#20 16.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/iq80/snappy/snappy/0.4/snappy-0.4.pom
2025-Nov-07 15:42:57.227162
#20 16.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/iq80/snappy/snappy/0.4/snappy-0.4.pom (15 kB at 363 kB/s)
2025-Nov-07 15:42:57.336879
#20 16.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/tukaani/xz/1.9/xz-1.9.pom
2025-Nov-07 15:42:57.336879
#20 16.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/tukaani/xz/1.9/xz-1.9.pom (2.0 kB at 68 kB/s)
2025-Nov-07 15:42:57.336879
#20 16.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/luben/zstd-jni/1.5.5-11/zstd-jni-1.5.5-11.pom
2025-Nov-07 15:42:57.336879
#20 16.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/luben/zstd-jni/1.5.5-11/zstd-jni-1.5.5-11.pom (2.0 kB at 72 kB/s)
2025-Nov-07 15:42:57.336879
#20 16.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-api/1.4.1/maven-resolver-api-1.4.1.pom
2025-Nov-07 15:42:57.336879
#20 16.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-api/1.4.1/maven-resolver-api-1.4.1.pom (2.6 kB at 73 kB/s)
2025-Nov-07 15:42:57.336879
#20 16.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver/1.4.1/maven-resolver-1.4.1.pom
2025-Nov-07 15:42:57.441106
#20 16.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver/1.4.1/maven-resolver-1.4.1.pom (18 kB at 551 kB/s)
2025-Nov-07 15:42:57.441106
#20 16.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/33/maven-parent-33.pom
2025-Nov-07 15:42:57.441106
#20 16.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/33/maven-parent-33.pom (44 kB at 1.6 MB/s)
2025-Nov-07 15:42:57.441106
#20 16.49 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.10.0/plexus-archiver-4.10.0.pom
2025-Nov-07 15:42:57.441106
#20 16.52 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.10.0/plexus-archiver-4.10.0.pom (5.8 kB at 194 kB/s)
2025-Nov-07 15:42:57.556159
#20 16.52 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.5.0/plexus-io-3.5.0.pom
2025-Nov-07 15:42:57.556159
#20 16.56 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.5.0/plexus-io-3.5.0.pom (4.3 kB at 136 kB/s)
2025-Nov-07 15:42:57.556159
#20 16.56 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.16.1/commons-io-2.16.1.pom
2025-Nov-07 15:42:57.556159
#20 16.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.16.1/commons-io-2.16.1.pom (20 kB at 530 kB/s)
2025-Nov-07 15:42:57.556159
#20 16.62 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.26.2/commons-compress-1.26.2.pom
2025-Nov-07 15:42:57.658720
#20 16.66 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.26.2/commons-compress-1.26.2.pom (23 kB at 546 kB/s)
2025-Nov-07 15:42:57.658720
#20 16.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.17.0/commons-codec-1.17.0.pom
2025-Nov-07 15:42:57.658720
#20 16.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.17.0/commons-codec-1.17.0.pom (18 kB at 616 kB/s)
2025-Nov-07 15:42:57.658720
#20 16.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/airlift/aircompressor/0.27/aircompressor-0.27.pom
2025-Nov-07 15:42:57.770553
#20 16.77 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/airlift/aircompressor/0.27/aircompressor-0.27.pom (5.8 kB at 169 kB/s)
2025-Nov-07 15:42:57.770553
#20 16.77 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/airlift/airbase/112/airbase-112.pom
2025-Nov-07 15:42:57.770553
#20 16.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/airlift/airbase/112/airbase-112.pom (69 kB at 2.1 MB/s)
2025-Nov-07 15:42:57.770553
#20 16.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.8.0-M1/junit-bom-5.8.0-M1.pom
2025-Nov-07 15:42:57.770553
#20 16.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.8.0-M1/junit-bom-5.8.0-M1.pom (5.7 kB at 162 kB/s)
2025-Nov-07 15:42:57.881690
#20 16.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/luben/zstd-jni/1.5.6-3/zstd-jni-1.5.6-3.pom
2025-Nov-07 15:42:57.881690
#20 16.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/luben/zstd-jni/1.5.6-3/zstd-jni-1.5.6-3.pom (2.0 kB at 50 kB/s)
2025-Nov-07 15:42:57.881690
#20 16.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.5.1/plexus-io-3.5.1.pom
2025-Nov-07 15:42:57.881690
#20 16.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.5.1/plexus-io-3.5.1.pom (4.3 kB at 140 kB/s)
2025-Nov-07 15:42:57.881690
#20 16.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-dependency-analyzer/1.15.0/maven-dependency-analyzer-1.15.0.pom
2025-Nov-07 15:42:57.989696
#20 16.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-dependency-analyzer/1.15.0/maven-dependency-analyzer-1.15.0.pom (32 kB at 973 kB/s)
2025-Nov-07 15:42:57.989696
#20 17.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.7/asm-9.7.pom
2025-Nov-07 15:42:57.989696
#20 17.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.7/asm-9.7.pom (2.4 kB at 82 kB/s)
2025-Nov-07 15:42:57.989696
#20 17.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/ow2/1.5.1/ow2-1.5.1.pom
2025-Nov-07 15:42:57.989696
#20 17.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/ow2/1.5.1/ow2-1.5.1.pom (11 kB at 305 kB/s)
2025-Nov-07 15:42:58.109276
#20 17.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-dependency-tree/3.3.0/maven-dependency-tree-3.3.0.pom
2025-Nov-07 15:42:58.109276
#20 17.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-dependency-tree/3.3.0/maven-dependency-tree-3.3.0.pom (7.0 kB at 87 kB/s)
2025-Nov-07 15:42:58.109276
#20 17.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/42/maven-shared-components-42.pom
2025-Nov-07 15:42:58.109276
#20 17.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/42/maven-shared-components-42.pom (3.8 kB at 114 kB/s)
2025-Nov-07 15:42:58.235139
#20 17.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-util/1.4.1/maven-resolver-util-1.4.1.pom
2025-Nov-07 15:42:58.235139
#20 17.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-util/1.4.1/maven-resolver-util-1.4.1.pom (2.8 kB at 76 kB/s)
2025-Nov-07 15:42:58.235139
#20 17.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-common-artifact-filters/3.4.0/maven-common-artifact-filters-3.4.0.pom
2025-Nov-07 15:42:58.235139
#20 17.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-common-artifact-filters/3.4.0/maven-common-artifact-filters-3.4.0.pom (5.4 kB at 114 kB/s)
2025-Nov-07 15:42:58.235139
#20 17.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-artifact-transfer/0.13.1/maven-artifact-transfer-0.13.1.pom
2025-Nov-07 15:42:58.334313
#20 17.35 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-artifact-transfer/0.13.1/maven-artifact-transfer-0.13.1.pom (11 kB at 274 kB/s)
2025-Nov-07 15:42:58.334313
#20 17.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/34/maven-shared-components-34.pom
2025-Nov-07 15:42:58.334313
#20 17.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/34/maven-shared-components-34.pom (5.1 kB at 106 kB/s)
2025-Nov-07 15:42:58.442233
#20 17.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.0.0/plexus-component-annotations-2.0.0.pom
2025-Nov-07 15:42:58.442233
#20 17.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.0.0/plexus-component-annotations-2.0.0.pom (750 B at 28 kB/s)
2025-Nov-07 15:42:58.442233
#20 17.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/2.0.0/plexus-containers-2.0.0.pom
2025-Nov-07 15:42:58.442233
#20 17.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/2.0.0/plexus-containers-2.0.0.pom (4.8 kB at 185 kB/s)
2025-Nov-07 15:42:58.442233
#20 17.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-common-artifact-filters/3.1.0/maven-common-artifact-filters-3.1.0.pom
2025-Nov-07 15:42:58.442233
#20 17.52 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-common-artifact-filters/3.1.0/maven-common-artifact-filters-3.1.0.pom (5.3 kB at 155 kB/s)
2025-Nov-07 15:42:58.573098
#20 17.52 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/33/maven-shared-components-33.pom
2025-Nov-07 15:42:58.573098
#20 17.56 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/33/maven-shared-components-33.pom (5.1 kB at 124 kB/s)
2025-Nov-07 15:42:58.573098
#20 17.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/3.0/maven-model-3.0.pom
2025-Nov-07 15:42:58.573098
#20 17.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/3.0/maven-model-3.0.pom (3.9 kB at 108 kB/s)
2025-Nov-07 15:42:58.573098
#20 17.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven/3.0/maven-3.0.pom
2025-Nov-07 15:42:58.573098
#20 17.65 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven/3.0/maven-3.0.pom (22 kB at 576 kB/s)
2025-Nov-07 15:42:58.698760
#20 17.66 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/15/maven-parent-15.pom
2025-Nov-07 15:42:58.698760
#20 17.70 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/15/maven-parent-15.pom (24 kB at 667 kB/s)
2025-Nov-07 15:42:58.698760
#20 17.70 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/6/apache-6.pom
2025-Nov-07 15:42:58.698760
#20 17.73 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/6/apache-6.pom (13 kB at 400 kB/s)
2025-Nov-07 15:42:58.698760
#20 17.74 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/3.0/maven-plugin-api-3.0.pom
2025-Nov-07 15:42:58.698760
#20 17.77 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/3.0/maven-plugin-api-3.0.pom (2.3 kB at 72 kB/s)
2025-Nov-07 15:42:58.814023
#20 17.78 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-inject-plexus/1.4.2/sisu-inject-plexus-1.4.2.pom
2025-Nov-07 15:42:58.814023
#20 17.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-inject-plexus/1.4.2/sisu-inject-plexus-1.4.2.pom (5.4 kB at 179 kB/s)
2025-Nov-07 15:42:58.814023
#20 17.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/inject/guice-plexus/1.4.2/guice-plexus-1.4.2.pom
2025-Nov-07 15:42:58.814023
#20 17.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/inject/guice-plexus/1.4.2/guice-plexus-1.4.2.pom (3.1 kB at 82 kB/s)
2025-Nov-07 15:42:58.814023
#20 17.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/inject/guice-bean/1.4.2/guice-bean-1.4.2.pom
2025-Nov-07 15:42:58.814023
#20 17.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/inject/guice-bean/1.4.2/guice-bean-1.4.2.pom (2.6 kB at 79 kB/s)
2025-Nov-07 15:42:58.915762
#20 17.90 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-inject/1.4.2/sisu-inject-1.4.2.pom
2025-Nov-07 15:42:58.915762
#20 17.92 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-inject/1.4.2/sisu-inject-1.4.2.pom (1.2 kB at 43 kB/s)
2025-Nov-07 15:42:58.915762
#20 17.93 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-parent/1.4.2/sisu-parent-1.4.2.pom
2025-Nov-07 15:42:58.915762
#20 17.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-parent/1.4.2/sisu-parent-1.4.2.pom (7.8 kB at 278 kB/s)
2025-Nov-07 15:42:58.915762
#20 17.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/6/forge-parent-6.pom
2025-Nov-07 15:42:58.915762
#20 17.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/6/forge-parent-6.pom (11 kB at 384 kB/s)
2025-Nov-07 15:42:58.915762
#20 17.99 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/1.5.4/plexus-component-annotations-1.5.4.pom
2025-Nov-07 15:42:59.026333
#20 18.03 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/1.5.4/plexus-component-annotations-1.5.4.pom (815 B at 23 kB/s)
2025-Nov-07 15:42:59.026333
#20 18.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/1.5.4/plexus-containers-1.5.4.pom
2025-Nov-07 15:42:59.026333
#20 18.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/1.5.4/plexus-containers-1.5.4.pom (4.2 kB at 170 kB/s)
2025-Nov-07 15:42:59.026333
#20 18.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/2.0.5/plexus-2.0.5.pom
2025-Nov-07 15:42:59.026333
#20 18.10 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/2.0.5/plexus-2.0.5.pom (17 kB at 482 kB/s)
2025-Nov-07 15:42:59.144806
#20 18.10 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.2.3/plexus-classworlds-2.2.3.pom
2025-Nov-07 15:42:59.144806
#20 18.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.2.3/plexus-classworlds-2.2.3.pom (4.0 kB at 105 kB/s)
2025-Nov-07 15:42:59.144806
#20 18.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/2.0.6/plexus-2.0.6.pom
2025-Nov-07 15:42:59.144806
#20 18.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/2.0.6/plexus-2.0.6.pom (17 kB at 541 kB/s)
2025-Nov-07 15:42:59.144806
#20 18.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-inject-bean/1.4.2/sisu-inject-bean-1.4.2.pom
2025-Nov-07 15:42:59.144806
#20 18.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-inject-bean/1.4.2/sisu-inject-bean-1.4.2.pom (5.5 kB at 176 kB/s)
2025-Nov-07 15:42:59.252456
#20 18.23 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-guice/2.1.7/sisu-guice-2.1.7.pom
2025-Nov-07 15:42:59.252456
#20 18.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-guice/2.1.7/sisu-guice-2.1.7.pom (11 kB at 357 kB/s)
2025-Nov-07 15:42:59.252456
#20 18.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.1.0/maven-shared-utils-3.1.0.pom
2025-Nov-07 15:42:59.252456
#20 18.29 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.1.0/maven-shared-utils-3.1.0.pom (5.0 kB at 172 kB/s)
2025-Nov-07 15:42:59.252456
#20 18.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/30/maven-shared-components-30.pom
2025-Nov-07 15:42:59.252456
#20 18.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/30/maven-shared-components-30.pom (4.6 kB at 148 kB/s)
2025-Nov-07 15:42:59.393502
#20 18.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/30/maven-parent-30.pom
2025-Nov-07 15:42:59.393502
#20 18.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/30/maven-parent-30.pom (41 kB at 1.2 MB/s)
2025-Nov-07 15:42:59.393502
#20 18.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/18/apache-18.pom
2025-Nov-07 15:42:59.393502
#20 18.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/18/apache-18.pom (16 kB at 326 kB/s)
2025-Nov-07 15:42:59.393502
#20 18.43 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.5/commons-io-2.5.pom
2025-Nov-07 15:42:59.393502
#20 18.46 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.5/commons-io-2.5.pom (13 kB at 391 kB/s)
2025-Nov-07 15:42:59.491481
#20 18.47 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.5/slf4j-api-1.7.5.pom
2025-Nov-07 15:42:59.491481
#20 18.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.5/slf4j-api-1.7.5.pom (2.7 kB at 90 kB/s)
2025-Nov-07 15:42:59.491481
#20 18.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/1.7.5/slf4j-parent-1.7.5.pom
2025-Nov-07 15:42:59.491481
#20 18.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/1.7.5/slf4j-parent-1.7.5.pom (12 kB at 369 kB/s)
2025-Nov-07 15:42:59.491481
#20 18.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-build-api/0.0.7/plexus-build-api-0.0.7.pom
2025-Nov-07 15:42:59.491481
#20 18.56 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-build-api/0.0.7/plexus-build-api-0.0.7.pom (3.2 kB at 114 kB/s)
2025-Nov-07 15:42:59.597878
#20 18.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/spice/spice-parent/15/spice-parent-15.pom
2025-Nov-07 15:42:59.597878
#20 18.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/spice/spice-parent/15/spice-parent-15.pom (8.4 kB at 226 kB/s)
2025-Nov-07 15:42:59.597878
#20 18.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/5/forge-parent-5.pom
2025-Nov-07 15:42:59.597878
#20 18.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/5/forge-parent-5.pom (8.4 kB at 310 kB/s)
2025-Nov-07 15:42:59.597878
#20 18.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/2.0.0/doxia-sink-api-2.0.0.jar
2025-Nov-07 15:42:59.701584
#20 18.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/2.0.0/doxia-sink-api-2.0.0.jar (11 kB at 333 kB/s)
2025-Nov-07 15:42:59.701584
#20 18.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/4.0.0/maven-reporting-api-4.0.0.jar
2025-Nov-07 15:42:59.701584
#20 18.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-impl/4.0.0/maven-reporting-impl-4.0.0.jar
2025-Nov-07 15:42:59.701584
#20 18.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-model/2.0.0/doxia-site-model-2.0.0.jar
2025-Nov-07 15:42:59.701584
#20 18.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-core/2.0.0/doxia-core-2.0.0.jar
2025-Nov-07 15:42:59.701584
#20 18.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-text/1.12.0/commons-text-1.12.0.jar
2025-Nov-07 15:42:59.701584
#20 18.74 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-impl/4.0.0/maven-reporting-impl-4.0.0.jar (21 kB at 699 kB/s)
2025-Nov-07 15:42:59.701584
#20 18.74 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-integration-tools/2.0.0/doxia-integration-tools-2.0.0.jar
2025-Nov-07 15:42:59.701584
#20 18.78 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-integration-tools/2.0.0/doxia-integration-tools-2.0.0.jar (50 kB at 910 kB/s)
2025-Nov-07 15:42:59.806295
#20 18.78 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.27/plexus-interpolation-1.27.jar
2025-Nov-07 15:42:59.806295
#20 18.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/4.0.0/maven-reporting-api-4.0.0.jar (9.8 kB at 98 kB/s)
2025-Nov-07 15:42:59.806295
#20 18.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-renderer/2.0.0/doxia-site-renderer-2.0.0.jar
2025-Nov-07 15:42:59.806295
#20 18.82 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-model/2.0.0/doxia-site-model-2.0.0.jar (86 kB at 818 kB/s)
2025-Nov-07 15:42:59.806295
#20 18.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-skin-model/2.0.0/doxia-skin-model-2.0.0.jar
2025-Nov-07 15:42:59.806295
#20 18.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.27/plexus-interpolation-1.27.jar (86 kB at 826 kB/s)
2025-Nov-07 15:42:59.806295
#20 18.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml5/2.0.0/doxia-module-xhtml5-2.0.0.jar
2025-Nov-07 15:42:59.806295
#20 18.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-core/2.0.0/doxia-core-2.0.0.jar (168 kB at 1.3 MB/s)
2025-Nov-07 15:42:59.806295
#20 18.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-velocity/2.2.0/plexus-velocity-2.2.0.jar
2025-Nov-07 15:42:59.806295
#20 18.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-renderer/2.0.0/doxia-site-renderer-2.0.0.jar (44 kB at 349 kB/s)
2025-Nov-07 15:42:59.806295
#20 18.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-core/2.4/velocity-engine-core-2.4.jar
2025-Nov-07 15:42:59.806295
#20 18.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-skin-model/2.0.0/doxia-skin-model-2.0.0.jar (16 kB at 127 kB/s)
2025-Nov-07 15:42:59.806295
#20 18.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/tools/velocity-tools-generic/3.1/velocity-tools-generic-3.1.jar
2025-Nov-07 15:42:59.806295
#20 18.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-text/1.12.0/commons-text-1.12.0.jar (251 kB at 1.7 MB/s)
2025-Nov-07 15:42:59.806295
#20 18.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.9.4/commons-beanutils-1.9.4.jar
2025-Nov-07 15:42:59.806295
#20 18.87 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml5/2.0.0/doxia-module-xhtml5-2.0.0.jar (17 kB at 119 kB/s)
2025-Nov-07 15:42:59.806295
#20 18.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.2/commons-logging-1.2.jar
2025-Nov-07 15:42:59.806295
#20 18.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-velocity/2.2.0/plexus-velocity-2.2.0.jar (5.7 kB at 36 kB/s)
2025-Nov-07 15:42:59.913832
#20 18.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.2/commons-collections-3.2.2.jar
2025-Nov-07 15:42:59.913832
#20 18.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-engine-core/2.4/velocity-engine-core-2.4.jar (510 kB at 2.9 MB/s)
2025-Nov-07 15:42:59.913832
#20 18.90 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-digester3/3.2/commons-digester3-3.2.jar
2025-Nov-07 15:42:59.913832
#20 18.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.2/commons-logging-1.2.jar (62 kB at 349 kB/s)
2025-Nov-07 15:42:59.913832
#20 18.90 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/cliftonlabs/json-simple/3.0.2/json-simple-3.0.2.jar
2025-Nov-07 15:42:59.913832
#20 18.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.9.4/commons-beanutils-1.9.4.jar (247 kB at 1.3 MB/s)
2025-Nov-07 15:42:59.913832
#20 18.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-apt/2.0.0/doxia-module-apt-2.0.0.jar
2025-Nov-07 15:42:59.913832
#20 18.92 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/tools/velocity-tools-generic/3.1/velocity-tools-generic-3.1.jar (217 kB at 1.1 MB/s)
2025-Nov-07 15:42:59.913832
#20 18.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xdoc/2.0.0/doxia-module-xdoc-2.0.0.jar
2025-Nov-07 15:42:59.913832
#20 18.93 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/cliftonlabs/json-simple/3.0.2/json-simple-3.0.2.jar (35 kB at 167 kB/s)
2025-Nov-07 15:42:59.913832
#20 18.93 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-archiver/3.6.2/maven-archiver-3.6.2.jar
2025-Nov-07 15:42:59.913832
#20 18.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.2/commons-collections-3.2.2.jar (588 kB at 2.7 MB/s)
2025-Nov-07 15:42:59.913832
#20 18.94 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-api/1.4.1/maven-resolver-api-1.4.1.jar
2025-Nov-07 15:42:59.913832
#20 18.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-apt/2.0.0/doxia-module-apt-2.0.0.jar (54 kB at 239 kB/s)
2025-Nov-07 15:42:59.913832
#20 18.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.plexus/0.9.0.M3/org.eclipse.sisu.plexus-0.9.0.M3.jar
2025-Nov-07 15:42:59.913832
#20 18.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-digester3/3.2/commons-digester3-3.2.jar (242 kB at 1.0 MB/s)
2025-Nov-07 15:42:59.913832
#20 18.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.inject/0.9.0.M3/org.eclipse.sisu.inject-0.9.0.M3.jar
2025-Nov-07 15:42:59.913832
#20 18.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xdoc/2.0.0/doxia-module-xdoc-2.0.0.jar (35 kB at 149 kB/s)
2025-Nov-07 15:42:59.913832
#20 18.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.6.0/plexus-classworlds-2.6.0.jar
2025-Nov-07 15:42:59.913832
#20 18.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-archiver/3.6.2/maven-archiver-3.6.2.jar (27 kB at 111 kB/s)
2025-Nov-07 15:42:59.913832
#20 18.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.10.0/plexus-archiver-4.10.0.jar
2025-Nov-07 15:42:59.913832
#20 18.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-api/1.4.1/maven-resolver-api-1.4.1.jar (149 kB at 589 kB/s)
2025-Nov-07 15:42:59.913832
#20 18.98 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/javax/inject/javax.inject/1/javax.inject-1.jar
2025-Nov-07 15:42:59.913832
#20 18.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.plexus/0.9.0.M3/org.eclipse.sisu.plexus-0.9.0.M3.jar (216 kB at 813 kB/s)
2025-Nov-07 15:43:00.045003
#20 18.99 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.16.1/commons-io-2.16.1.jar
2025-Nov-07 15:43:00.045003
#20 19.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.inject/0.9.0.M3/org.eclipse.sisu.inject-0.9.0.M3.jar (434 kB at 1.6 MB/s)
2025-Nov-07 15:43:00.045003
#20 19.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.26.2/commons-compress-1.26.2.jar
2025-Nov-07 15:43:00.045003
#20 19.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.10.0/plexus-archiver-4.10.0.jar (225 kB at 810 kB/s)
2025-Nov-07 15:43:00.045003
#20 19.01 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.17.0/commons-codec-1.17.0.jar
2025-Nov-07 15:43:00.045003
#20 19.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.6.0/plexus-classworlds-2.6.0.jar (53 kB at 185 kB/s)
2025-Nov-07 15:43:00.045003
#20 19.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/javax/inject/javax.inject/1/javax.inject-1.jar (2.5 kB at 8.7 kB/s)
2025-Nov-07 15:43:00.045003
#20 19.01 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/airlift/aircompressor/0.27/aircompressor-0.27.jar
2025-Nov-07 15:43:00.045003
#20 19.01 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/tukaani/xz/1.9/xz-1.9.jar
2025-Nov-07 15:43:00.045003
#20 19.05 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.16.1/commons-io-2.16.1.jar (509 kB at 1.6 MB/s)
2025-Nov-07 15:43:00.045003
#20 19.05 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/luben/zstd-jni/1.5.6-3/zstd-jni-1.5.6-3.jar
2025-Nov-07 15:43:00.045003
#20 19.05 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/tukaani/xz/1.9/xz-1.9.jar (116 kB at 355 kB/s)
2025-Nov-07 15:43:00.045003
#20 19.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.26.2/commons-compress-1.26.2.jar (1.1 MB at 3.3 MB/s)
2025-Nov-07 15:43:00.045003
#20 19.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.17.0/commons-lang3-3.17.0.jar
2025-Nov-07 15:43:00.045003
#20 19.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.17.0/commons-codec-1.17.0.jar (373 kB at 1.1 MB/s)
2025-Nov-07 15:43:00.045003
#20 19.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-xml/3.0.1/plexus-xml-3.0.1.jar
2025-Nov-07 15:43:00.045003
#20 19.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/airlift/aircompressor/0.27/aircompressor-0.27.jar (255 kB at 752 kB/s)
2025-Nov-07 15:43:00.045003
#20 19.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/4.0.1/plexus-utils-4.0.1.jar
2025-Nov-07 15:43:00.045003
#20 19.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.5.1/plexus-io-3.5.1.jar
2025-Nov-07 15:43:00.045003
#20 19.12 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.5.1/plexus-io-3.5.1.jar (80 kB at 206 kB/s)
2025-Nov-07 15:43:00.045003
#20 19.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-i18n/1.0-beta-10/plexus-i18n-1.0-beta-10.jar
2025-Nov-07 15:43:00.168113
#20 19.12 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/4.0.1/plexus-utils-4.0.1.jar (193 kB at 491 kB/s)
2025-Nov-07 15:43:00.168113
#20 19.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-dependency-analyzer/1.15.0/maven-dependency-analyzer-1.15.0.jar
2025-Nov-07 15:43:00.168113
#20 19.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-xml/3.0.1/plexus-xml-3.0.1.jar (94 kB at 235 kB/s)
2025-Nov-07 15:43:00.168113
#20 19.13 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.7/asm-9.7.jar
2025-Nov-07 15:43:00.168113
#20 19.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.17.0/commons-lang3-3.17.0.jar (674 kB at 1.6 MB/s)
2025-Nov-07 15:43:00.168113
#20 19.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-dependency-tree/3.3.0/maven-dependency-tree-3.3.0.jar
2025-Nov-07 15:43:00.168113
#20 19.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-i18n/1.0-beta-10/plexus-i18n-1.0-beta-10.jar (12 kB at 28 kB/s)
2025-Nov-07 15:43:00.168113
#20 19.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-common-artifact-filters/3.4.0/maven-common-artifact-filters-3.4.0.jar
2025-Nov-07 15:43:00.168113
#20 19.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.7/asm-9.7.jar (125 kB at 289 kB/s)
2025-Nov-07 15:43:00.168113
#20 19.17 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-artifact-transfer/0.13.1/maven-artifact-transfer-0.13.1.jar
2025-Nov-07 15:43:00.168113
#20 19.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-dependency-tree/3.3.0/maven-dependency-tree-3.3.0.jar (43 kB at 98 kB/s)
2025-Nov-07 15:43:00.168113
#20 19.18 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.0.0/plexus-component-annotations-2.0.0.jar
2025-Nov-07 15:43:00.168113
#20 19.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-common-artifact-filters/3.4.0/maven-common-artifact-filters-3.4.0.jar (58 kB at 130 kB/s)
2025-Nov-07 15:43:00.168113
#20 19.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.4.2/maven-shared-utils-3.4.2.jar
2025-Nov-07 15:43:00.168113
#20 19.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-artifact-transfer/0.13.1/maven-artifact-transfer-0.13.1.jar (159 kB at 322 kB/s)
2025-Nov-07 15:43:00.290108
#20 19.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-util/1.4.1/maven-resolver-util-1.4.1.jar
2025-Nov-07 15:43:00.290108
#20 19.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.4.2/maven-shared-utils-3.4.2.jar (151 kB at 297 kB/s)
2025-Nov-07 15:43:00.290108
#20 19.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-build-api/0.0.7/plexus-build-api-0.0.7.jar
2025-Nov-07 15:43:00.290108
#20 19.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-dependency-analyzer/1.15.0/maven-dependency-analyzer-1.15.0.jar (45 kB at 84 kB/s)
2025-Nov-07 15:43:00.290108
#20 19.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.36/slf4j-api-1.7.36.jar
2025-Nov-07 15:43:00.290108
#20 19.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.0.0/plexus-component-annotations-2.0.0.jar (4.2 kB at 8.3 kB/s)
2025-Nov-07 15:43:00.290108
#20 19.29 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-build-api/0.0.7/plexus-build-api-0.0.7.jar (8.5 kB at 15 kB/s)
2025-Nov-07 15:43:00.290108
#20 19.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-util/1.4.1/maven-resolver-util-1.4.1.jar (168 kB at 299 kB/s)
2025-Nov-07 15:43:00.290108
#20 19.32 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.36/slf4j-api-1.7.36.jar (41 kB at 71 kB/s)
2025-Nov-07 15:43:00.290108
#20 19.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/luben/zstd-jni/1.5.6-3/zstd-jni-1.5.6-3.jar (6.7 MB at 11 MB/s)
2025-Nov-07 15:43:01.577920
#20 20.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-util/1.9.22/maven-resolver-util-1.9.22.pom
2025-Nov-07 15:43:01.694038
#20 20.70 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-util/1.9.22/maven-resolver-util-1.9.22.pom (2.2 kB at 47 kB/s)
2025-Nov-07 15:43:01.694038
#20 20.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver/1.9.22/maven-resolver-1.9.22.pom
2025-Nov-07 15:43:01.694038
#20 20.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver/1.9.22/maven-resolver-1.9.22.pom (23 kB at 443 kB/s)
2025-Nov-07 15:43:01.816738
#20 20.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-api/1.9.22/maven-resolver-api-1.9.22.pom
2025-Nov-07 15:43:01.816738
#20 20.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-api/1.9.22/maven-resolver-api-1.9.22.pom (2.2 kB at 44 kB/s)
2025-Nov-07 15:43:01.816738
#20 20.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-util/1.9.22/maven-resolver-util-1.9.22.jar
2025-Nov-07 15:43:01.816738
#20 20.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-util/1.9.22/maven-resolver-util-1.9.22.jar (196 kB at 4.1 MB/s)
2025-Nov-07 15:43:01.946756
#20 20.90 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-api/1.9.22/maven-resolver-api-1.9.22.jar
2025-Nov-07 15:43:01.946756
#20 20.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/resolver/maven-resolver-api/1.9.22/maven-resolver-api-1.9.22.jar (157 kB at 3.5 MB/s)
2025-Nov-07 15:43:01.946756
#20 20.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/3.1.1/maven-reporting-api-3.1.1.pom
2025-Nov-07 15:43:01.946756
#20 21.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/3.1.1/maven-reporting-api-3.1.1.pom (3.8 kB at 64 kB/s)
2025-Nov-07 15:43:02.046609
#20 21.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/1.11.1/doxia-sink-api-1.11.1.pom
2025-Nov-07 15:43:02.046609
#20 21.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/1.11.1/doxia-sink-api-1.11.1.pom (1.6 kB at 39 kB/s)
2025-Nov-07 15:43:02.046609
#20 21.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia/1.11.1/doxia-1.11.1.pom
2025-Nov-07 15:43:02.046609
#20 21.12 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia/1.11.1/doxia-1.11.1.pom (18 kB at 429 kB/s)
2025-Nov-07 15:43:02.152437
#20 21.13 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-logging-api/1.11.1/doxia-logging-api-1.11.1.pom
2025-Nov-07 15:43:02.152437
#20 21.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-logging-api/1.11.1/doxia-logging-api-1.11.1.pom (1.6 kB at 32 kB/s)
2025-Nov-07 15:43:02.152437
#20 21.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-exec/1.6.0/maven-reporting-exec-1.6.0.pom
2025-Nov-07 15:43:02.152437
#20 21.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-exec/1.6.0/maven-reporting-exec-1.6.0.pom (14 kB at 386 kB/s)
2025-Nov-07 15:43:02.251353
#20 21.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/3.1.0/maven-reporting-api-3.1.0.pom
2025-Nov-07 15:43:02.251353
#20 21.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/3.1.0/maven-reporting-api-3.1.0.pom (3.8 kB at 111 kB/s)
2025-Nov-07 15:43:02.251353
#20 21.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/3.2.5/maven-artifact-3.2.5.pom
2025-Nov-07 15:43:02.251353
#20 21.32 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/3.2.5/maven-artifact-3.2.5.pom (2.3 kB at 59 kB/s)
2025-Nov-07 15:43:02.251353
#20 21.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven/3.2.5/maven-3.2.5.pom
2025-Nov-07 15:43:02.418203
#20 21.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven/3.2.5/maven-3.2.5.pom (22 kB at 639 kB/s)
2025-Nov-07 15:43:02.418203
#20 21.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/25/maven-parent-25.pom
2025-Nov-07 15:43:02.418203
#20 21.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/25/maven-parent-25.pom (37 kB at 851 kB/s)
2025-Nov-07 15:43:02.418203
#20 21.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/15/apache-15.pom
2025-Nov-07 15:43:02.418203
#20 21.49 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/15/apache-15.pom (15 kB at 203 kB/s)
2025-Nov-07 15:43:02.522609
#20 21.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.3.0/plexus-utils-3.3.0.pom
2025-Nov-07 15:43:02.522609
#20 21.55 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.3.0/plexus-utils-3.3.0.pom (5.2 kB at 118 kB/s)
2025-Nov-07 15:43:02.522609
#20 21.56 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-core/3.2.5/maven-core-3.2.5.pom
2025-Nov-07 15:43:02.522609
#20 21.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-core/3.2.5/maven-core-3.2.5.pom (8.1 kB at 212 kB/s)
2025-Nov-07 15:43:02.632931
#20 21.60 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/3.2.5/maven-model-3.2.5.pom
2025-Nov-07 15:43:02.632931
#20 21.65 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/3.2.5/maven-model-3.2.5.pom (4.2 kB at 101 kB/s)
2025-Nov-07 15:43:02.632931
#20 21.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings/3.2.5/maven-settings-3.2.5.pom
2025-Nov-07 15:43:02.632931
#20 21.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings/3.2.5/maven-settings-3.2.5.pom (2.2 kB at 41 kB/s)
2025-Nov-07 15:43:02.784997
#20 21.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings-builder/3.2.5/maven-settings-builder-3.2.5.pom
2025-Nov-07 15:43:02.784997
#20 21.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings-builder/3.2.5/maven-settings-builder-3.2.5.pom (2.6 kB at 79 kB/s)
2025-Nov-07 15:43:02.784997
#20 21.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.21/plexus-interpolation-1.21.pom
2025-Nov-07 15:43:02.784997
#20 21.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.21/plexus-interpolation-1.21.pom (1.5 kB at 41 kB/s)
2025-Nov-07 15:43:02.784997
#20 21.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-components/1.3.1/plexus-components-1.3.1.pom
2025-Nov-07 15:43:02.784997
#20 21.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-components/1.3.1/plexus-components-1.3.1.pom (3.1 kB at 58 kB/s)
2025-Nov-07 15:43:02.916625
#20 21.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/3.3.1/plexus-3.3.1.pom
2025-Nov-07 15:43:02.916625
#20 21.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/3.3.1/plexus-3.3.1.pom (20 kB at 538 kB/s)
2025-Nov-07 15:43:02.916625
#20 21.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/spice/spice-parent/17/spice-parent-17.pom
2025-Nov-07 15:43:02.916625
#20 21.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/spice/spice-parent/17/spice-parent-17.pom (6.8 kB at 233 kB/s)
2025-Nov-07 15:43:02.916625
#20 21.94 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/10/forge-parent-10.pom
2025-Nov-07 15:43:02.916625
#20 21.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/10/forge-parent-10.pom (14 kB at 295 kB/s)
2025-Nov-07 15:43:03.041017
#20 22.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.1.1/plexus-component-annotations-2.1.1.pom
2025-Nov-07 15:43:03.041017
#20 22.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.1.1/plexus-component-annotations-2.1.1.pom (770 B at 18 kB/s)
2025-Nov-07 15:43:03.167295
#20 22.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/2.1.1/plexus-containers-2.1.1.pom
2025-Nov-07 15:43:03.167295
#20 22.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/2.1.1/plexus-containers-2.1.1.pom (6.0 kB at 159 kB/s)
2025-Nov-07 15:43:03.167295
#20 22.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/6.5/plexus-6.5.pom
2025-Nov-07 15:43:03.167295
#20 22.20 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/6.5/plexus-6.5.pom (26 kB at 714 kB/s)
2025-Nov-07 15:43:03.167295
#20 22.21 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-sec-dispatcher/1.3/plexus-sec-dispatcher-1.3.pom
2025-Nov-07 15:43:03.167295
#20 22.24 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-sec-dispatcher/1.3/plexus-sec-dispatcher-1.3.pom (3.0 kB at 80 kB/s)
2025-Nov-07 15:43:03.303957
#20 22.25 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/spice/spice-parent/12/spice-parent-12.pom
2025-Nov-07 15:43:03.303957
#20 22.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/spice/spice-parent/12/spice-parent-12.pom (6.8 kB at 189 kB/s)
2025-Nov-07 15:43:03.303957
#20 22.29 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/4/forge-parent-4.pom
2025-Nov-07 15:43:03.303957
#20 22.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/4/forge-parent-4.pom (8.4 kB at 200 kB/s)
2025-Nov-07 15:43:03.303957
#20 22.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-cipher/1.4/plexus-cipher-1.4.pom
2025-Nov-07 15:43:03.303957
#20 22.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-cipher/1.4/plexus-cipher-1.4.pom (2.1 kB at 54 kB/s)
2025-Nov-07 15:43:03.402415
#20 22.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-repository-metadata/3.2.5/maven-repository-metadata-3.2.5.pom
2025-Nov-07 15:43:03.402415
#20 22.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-repository-metadata/3.2.5/maven-repository-metadata-3.2.5.pom (2.2 kB at 77 kB/s)
2025-Nov-07 15:43:03.402415
#20 22.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/3.2.5/maven-plugin-api-3.2.5.pom
2025-Nov-07 15:43:03.402415
#20 22.47 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/3.2.5/maven-plugin-api-3.2.5.pom (3.0 kB at 62 kB/s)
2025-Nov-07 15:43:03.402415
#20 22.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.plexus/0.3.5/org.eclipse.sisu.plexus-0.3.5.pom
2025-Nov-07 15:43:03.511606
#20 22.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.plexus/0.3.5/org.eclipse.sisu.plexus-0.3.5.pom (4.3 kB at 126 kB/s)
2025-Nov-07 15:43:03.511606
#20 22.52 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/sisu-plexus/0.3.5/sisu-plexus-0.3.5.pom
2025-Nov-07 15:43:03.511606
#20 22.55 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/sisu-plexus/0.3.5/sisu-plexus-0.3.5.pom (14 kB at 429 kB/s)
2025-Nov-07 15:43:03.511606
#20 22.55 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/javax/annotation/javax.annotation-api/1.2/javax.annotation-api-1.2.pom
2025-Nov-07 15:43:03.511606
#20 22.58 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/javax/annotation/javax.annotation-api/1.2/javax.annotation-api-1.2.pom (13 kB at 407 kB/s)
2025-Nov-07 15:43:03.625885
#20 22.59 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/java/jvnet-parent/3/jvnet-parent-3.pom
2025-Nov-07 15:43:03.625885
#20 22.63 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/java/jvnet-parent/3/jvnet-parent-3.pom (4.8 kB at 129 kB/s)
2025-Nov-07 15:43:03.625885
#20 22.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/javax/enterprise/cdi-api/1.2/cdi-api-1.2.pom
2025-Nov-07 15:43:03.625885
#20 22.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/javax/enterprise/cdi-api/1.2/cdi-api-1.2.pom (6.3 kB at 174 kB/s)
2025-Nov-07 15:43:03.625885
#20 22.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/weld/weld-parent/26/weld-parent-26.pom
2025-Nov-07 15:43:03.625885
#20 22.70 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/weld/weld-parent/26/weld-parent-26.pom (32 kB at 1.1 MB/s)
2025-Nov-07 15:43:03.727926
#20 22.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.inject/0.3.5/org.eclipse.sisu.inject-0.3.5.pom
2025-Nov-07 15:43:03.727926
#20 22.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.inject/0.3.5/org.eclipse.sisu.inject-0.3.5.pom (2.6 kB at 62 kB/s)
2025-Nov-07 15:43:03.727926
#20 22.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/sisu-inject/0.3.5/sisu-inject-0.3.5.pom
2025-Nov-07 15:43:03.727926
#20 22.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/sisu-inject/0.3.5/sisu-inject-0.3.5.pom (14 kB at 327 kB/s)
2025-Nov-07 15:43:03.832422
#20 22.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.5.2/plexus-classworlds-2.5.2.pom
2025-Nov-07 15:43:03.832422
#20 22.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.5.2/plexus-classworlds-2.5.2.pom (7.3 kB at 203 kB/s)
2025-Nov-07 15:43:03.832422
#20 22.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model-builder/3.2.5/maven-model-builder-3.2.5.pom
2025-Nov-07 15:43:03.832422
#20 22.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model-builder/3.2.5/maven-model-builder-3.2.5.pom (3.0 kB at 75 kB/s)
2025-Nov-07 15:43:03.832422
#20 22.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-aether-provider/3.2.5/maven-aether-provider-3.2.5.pom
2025-Nov-07 15:43:03.961985
#20 22.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-aether-provider/3.2.5/maven-aether-provider-3.2.5.pom (4.2 kB at 112 kB/s)
2025-Nov-07 15:43:03.973295
#20 22.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-api/1.0.0.v20140518/aether-api-1.0.0.v20140518.pom
2025-Nov-07 15:43:03.973295
#20 23.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-api/1.0.0.v20140518/aether-api-1.0.0.v20140518.pom (1.9 kB at 47 kB/s)
2025-Nov-07 15:43:03.973295
#20 23.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether/1.0.0.v20140518/aether-1.0.0.v20140518.pom
2025-Nov-07 15:43:03.973295
#20 23.04 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether/1.0.0.v20140518/aether-1.0.0.v20140518.pom (30 kB at 735 kB/s)
2025-Nov-07 15:43:04.100445
#20 23.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-spi/1.0.0.v20140518/aether-spi-1.0.0.v20140518.pom
2025-Nov-07 15:43:04.100445
#20 23.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-spi/1.0.0.v20140518/aether-spi-1.0.0.v20140518.pom (2.1 kB at 73 kB/s)
2025-Nov-07 15:43:04.100445
#20 23.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-util/1.0.0.v20140518/aether-util-1.0.0.v20140518.pom
2025-Nov-07 15:43:04.100445
#20 23.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-util/1.0.0.v20140518/aether-util-1.0.0.v20140518.pom (2.2 kB at 59 kB/s)
2025-Nov-07 15:43:04.100445
#20 23.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-impl/1.0.0.v20140518/aether-impl-1.0.0.v20140518.pom
2025-Nov-07 15:43:04.100445
#20 23.17 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-impl/1.0.0.v20140518/aether-impl-1.0.0.v20140518.pom (3.5 kB at 71 kB/s)
2025-Nov-07 15:43:04.203841
#20 23.18 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-guice/3.2.3/sisu-guice-3.2.3.pom
2025-Nov-07 15:43:04.203841
#20 23.21 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-guice/3.2.3/sisu-guice-3.2.3.pom (11 kB at 296 kB/s)
2025-Nov-07 15:43:04.203841
#20 23.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/inject/guice-parent/3.2.3/guice-parent-3.2.3.pom
2025-Nov-07 15:43:04.203841
#20 23.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/inject/guice-parent/3.2.3/guice-parent-3.2.3.pom (13 kB at 293 kB/s)
2025-Nov-07 15:43:04.203841
#20 23.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/38/forge-parent-38.pom
2025-Nov-07 15:43:04.314743
#20 23.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/forge/forge-parent/38/forge-parent-38.pom (19 kB at 354 kB/s)
2025-Nov-07 15:43:04.314743
#20 23.35 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/aopalliance/aopalliance/1.0/aopalliance-1.0.pom
2025-Nov-07 15:43:04.314743
#20 23.39 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/aopalliance/aopalliance/1.0/aopalliance-1.0.pom (363 B at 7.7 kB/s)
2025-Nov-07 15:43:04.446132
#20 23.40 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/guava/guava/16.0.1/guava-16.0.1.pom
2025-Nov-07 15:43:04.446132
#20 23.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/guava/guava/16.0.1/guava-16.0.1.pom (6.1 kB at 161 kB/s)
2025-Nov-07 15:43:04.446132
#20 23.44 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/guava/guava-parent/16.0.1/guava-parent-16.0.1.pom
2025-Nov-07 15:43:04.446132
#20 23.47 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/guava/guava-parent/16.0.1/guava-parent-16.0.1.pom (7.3 kB at 222 kB/s)
2025-Nov-07 15:43:04.446132
#20 23.49 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.3.4/maven-shared-utils-3.3.4.pom
2025-Nov-07 15:43:04.446132
#20 23.52 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.3.4/maven-shared-utils-3.3.4.pom (5.8 kB at 188 kB/s)
2025-Nov-07 15:43:04.547593
#20 23.53 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.6/commons-io-2.6.pom
2025-Nov-07 15:43:04.547593
#20 23.56 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.6/commons-io-2.6.pom (14 kB at 475 kB/s)
2025-Nov-07 15:43:04.547593
#20 23.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/42/commons-parent-42.pom
2025-Nov-07 15:43:04.547593
#20 23.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/42/commons-parent-42.pom (68 kB at 1.7 MB/s)
2025-Nov-07 15:43:04.547593
#20 23.62 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-archiver/3.5.2/maven-archiver-3.5.2.pom
2025-Nov-07 15:43:04.688674
#20 23.66 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-archiver/3.5.2/maven-archiver-3.5.2.pom (5.5 kB at 146 kB/s)
2025-Nov-07 15:43:04.688674
#20 23.70 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/3.1.1/maven-artifact-3.1.1.pom
2025-Nov-07 15:43:04.688674
#20 23.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/3.1.1/maven-artifact-3.1.1.pom (2.0 kB at 29 kB/s)
2025-Nov-07 15:43:04.790909
#20 23.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven/3.1.1/maven-3.1.1.pom
2025-Nov-07 15:43:04.790909
#20 23.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven/3.1.1/maven-3.1.1.pom (22 kB at 283 kB/s)
2025-Nov-07 15:43:04.790909
#20 23.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/23/maven-parent-23.pom
2025-Nov-07 15:43:04.899526
#20 23.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/23/maven-parent-23.pom (33 kB at 758 kB/s)
2025-Nov-07 15:43:04.899526
#20 23.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/3.1.1/maven-model-3.1.1.pom
2025-Nov-07 15:43:04.899526
#20 23.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/3.1.1/maven-model-3.1.1.pom (4.1 kB at 80 kB/s)
2025-Nov-07 15:43:05.003632
#20 23.99 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-core/3.1.1/maven-core-3.1.1.pom
2025-Nov-07 15:43:05.003632
#20 24.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-core/3.1.1/maven-core-3.1.1.pom (7.3 kB at 242 kB/s)
2025-Nov-07 15:43:05.003632
#20 24.02 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings/3.1.1/maven-settings-3.1.1.pom
2025-Nov-07 15:43:05.003632
#20 24.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings/3.1.1/maven-settings-3.1.1.pom (2.2 kB at 44 kB/s)
2025-Nov-07 15:43:05.003632
#20 24.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings-builder/3.1.1/maven-settings-builder-3.1.1.pom
2025-Nov-07 15:43:05.132999
#20 24.12 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings-builder/3.1.1/maven-settings-builder-3.1.1.pom (2.6 kB at 62 kB/s)
2025-Nov-07 15:43:05.132999
#20 24.13 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.19/plexus-interpolation-1.19.pom
2025-Nov-07 15:43:05.132999
#20 24.17 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.19/plexus-interpolation-1.19.pom (1.0 kB at 29 kB/s)
2025-Nov-07 15:43:05.132999
#20 24.17 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-repository-metadata/3.1.1/maven-repository-metadata-3.1.1.pom
2025-Nov-07 15:43:05.132999
#20 24.21 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-repository-metadata/3.1.1/maven-repository-metadata-3.1.1.pom (2.2 kB at 54 kB/s)
2025-Nov-07 15:43:05.278159
#20 24.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/3.1.1/maven-plugin-api-3.1.1.pom
2025-Nov-07 15:43:05.278159
#20 24.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/3.1.1/maven-plugin-api-3.1.1.pom (3.4 kB at 85 kB/s)
2025-Nov-07 15:43:05.278159
#20 24.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model-builder/3.1.1/maven-model-builder-3.1.1.pom
2025-Nov-07 15:43:05.278159
#20 24.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model-builder/3.1.1/maven-model-builder-3.1.1.pom (2.8 kB at 85 kB/s)
2025-Nov-07 15:43:05.278159
#20 24.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-aether-provider/3.1.1/maven-aether-provider-3.1.1.pom
2025-Nov-07 15:43:05.278159
#20 24.35 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-aether-provider/3.1.1/maven-aether-provider-3.1.1.pom (4.1 kB at 84 kB/s)
2025-Nov-07 15:43:05.399834
#20 24.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-api/0.9.0.M2/aether-api-0.9.0.M2.pom
2025-Nov-07 15:43:05.399834
#20 24.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-api/0.9.0.M2/aether-api-0.9.0.M2.pom (1.7 kB at 46 kB/s)
2025-Nov-07 15:43:05.399834
#20 24.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether/0.9.0.M2/aether-0.9.0.M2.pom
2025-Nov-07 15:43:05.399834
#20 24.44 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether/0.9.0.M2/aether-0.9.0.M2.pom (28 kB at 796 kB/s)
2025-Nov-07 15:43:05.399834
#20 24.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-spi/0.9.0.M2/aether-spi-0.9.0.M2.pom
2025-Nov-07 15:43:05.399834
#20 24.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-spi/0.9.0.M2/aether-spi-0.9.0.M2.pom (1.8 kB at 63 kB/s)
2025-Nov-07 15:43:05.531824
#20 24.49 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-util/0.9.0.M2/aether-util-0.9.0.M2.pom
2025-Nov-07 15:43:05.531824
#20 24.52 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-util/0.9.0.M2/aether-util-0.9.0.M2.pom (2.0 kB at 64 kB/s)
2025-Nov-07 15:43:05.531824
#20 24.52 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-impl/0.9.0.M2/aether-impl-0.9.0.M2.pom
2025-Nov-07 15:43:05.531824
#20 24.57 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-impl/0.9.0.M2/aether-impl-0.9.0.M2.pom (3.3 kB at 80 kB/s)
2025-Nov-07 15:43:05.531824
#20 24.58 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.5.1/plexus-classworlds-2.5.1.pom
2025-Nov-07 15:43:05.531824
#20 24.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.5.1/plexus-classworlds-2.5.1.pom (5.0 kB at 152 kB/s)
2025-Nov-07 15:43:05.631931
#20 24.62 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.3.3/maven-shared-utils-3.3.3.pom
2025-Nov-07 15:43:05.631931
#20 24.66 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.3.3/maven-shared-utils-3.3.3.pom (5.8 kB at 120 kB/s)
2025-Nov-07 15:43:05.631931
#20 24.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.20/commons-compress-1.20.pom
2025-Nov-07 15:43:05.631931
#20 24.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.20/commons-compress-1.20.pom (18 kB at 537 kB/s)
2025-Nov-07 15:43:05.784791
#20 24.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/48/commons-parent-48.pom
2025-Nov-07 15:43:05.784791
#20 24.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/48/commons-parent-48.pom (72 kB at 2.1 MB/s)
2025-Nov-07 15:43:05.784791
#20 24.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.2.7/plexus-archiver-4.2.7.pom
2025-Nov-07 15:43:05.784791
#20 24.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.2.7/plexus-archiver-4.2.7.pom (4.9 kB at 140 kB/s)
2025-Nov-07 15:43:05.784791
#20 24.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/8/plexus-8.pom
2025-Nov-07 15:43:05.784791
#20 24.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/8/plexus-8.pom (25 kB at 431 kB/s)
2025-Nov-07 15:43:05.884918
#20 24.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.2.0/plexus-io-3.2.0.pom
2025-Nov-07 15:43:05.884918
#20 24.92 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.2.0/plexus-io-3.2.0.pom (4.5 kB at 130 kB/s)
2025-Nov-07 15:43:05.884918
#20 24.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.21/commons-compress-1.21.pom
2025-Nov-07 15:43:05.884918
#20 24.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.21/commons-compress-1.21.pom (20 kB at 532 kB/s)
2025-Nov-07 15:43:06.005378
#20 24.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.26/plexus-interpolation-1.26.pom
2025-Nov-07 15:43:06.005378
#20 25.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.26/plexus-interpolation-1.26.pom (2.7 kB at 49 kB/s)
2025-Nov-07 15:43:06.005378
#20 25.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.4.2/plexus-utils-3.4.2.pom
2025-Nov-07 15:43:06.005378
#20 25.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.4.2/plexus-utils-3.4.2.pom (8.2 kB at 168 kB/s)
2025-Nov-07 15:43:06.112002
#20 25.09 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-container-default/2.1.0/plexus-container-default-2.1.0.pom
2025-Nov-07 15:43:06.112002
#20 25.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-container-default/2.1.0/plexus-container-default-2.1.0.pom (3.0 kB at 71 kB/s)
2025-Nov-07 15:43:06.112002
#20 25.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/xbean/xbean-reflect/3.7/xbean-reflect-3.7.pom
2025-Nov-07 15:43:06.112002
#20 25.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/xbean/xbean-reflect/3.7/xbean-reflect-3.7.pom (5.1 kB at 111 kB/s)
2025-Nov-07 15:43:06.230307
#20 25.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/xbean/xbean/3.7/xbean-3.7.pom
2025-Nov-07 15:43:06.230307
#20 25.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/xbean/xbean/3.7/xbean-3.7.pom (15 kB at 249 kB/s)
2025-Nov-07 15:43:06.230307
#20 25.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/geronimo/genesis/genesis-java5-flava/2.0/genesis-java5-flava-2.0.pom
2025-Nov-07 15:43:06.230307
#20 25.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/geronimo/genesis/genesis-java5-flava/2.0/genesis-java5-flava-2.0.pom (5.5 kB at 117 kB/s)
2025-Nov-07 15:43:06.332466
#20 25.32 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/geronimo/genesis/genesis-default-flava/2.0/genesis-default-flava-2.0.pom
2025-Nov-07 15:43:06.332466
#20 25.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/geronimo/genesis/genesis-default-flava/2.0/genesis-default-flava-2.0.pom (18 kB at 445 kB/s)
2025-Nov-07 15:43:06.332466
#20 25.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/geronimo/genesis/genesis/2.0/genesis-2.0.pom
2025-Nov-07 15:43:06.332466
#20 25.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/geronimo/genesis/genesis/2.0/genesis-2.0.pom (18 kB at 428 kB/s)
2025-Nov-07 15:43:06.332466
#20 25.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/collections/google-collections/1.0/google-collections-1.0.pom
2025-Nov-07 15:43:06.458205
#20 25.44 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/collections/google-collections/1.0/google-collections-1.0.pom (2.5 kB at 73 kB/s)
2025-Nov-07 15:43:06.458205
#20 25.44 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/google/1/google-1.pom
2025-Nov-07 15:43:06.458205
#20 25.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/google/1/google-1.pom (1.6 kB at 46 kB/s)
2025-Nov-07 15:43:06.458205
#20 25.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-core/1.11.1/doxia-core-1.11.1.pom
2025-Nov-07 15:43:06.458205
#20 25.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-core/1.11.1/doxia-core-1.11.1.pom (4.5 kB at 89 kB/s)
2025-Nov-07 15:43:06.623568
#20 25.55 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.8.1/commons-lang3-3.8.1.pom
2025-Nov-07 15:43:06.660675
#20 25.74 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.8.1/commons-lang3-3.8.1.pom (28 kB at 148 kB/s)
2025-Nov-07 15:43:06.660675
#20 ...
2025-Nov-07 15:43:06.660675
2025-Nov-07 15:43:06.660675
#22 [frontend-builder 6/6] RUN npm run build -- --configuration production
2025-Nov-07 15:43:06.660675
#22 0.276
2025-Nov-07 15:43:06.660675
#22 0.276 > sellia-app@0.0.0 build
2025-Nov-07 15:43:06.660675
#22 0.276 > ng build --configuration production
2025-Nov-07 15:43:06.660675
#22 0.276
2025-Nov-07 15:43:06.660675
#22 1.705 ❯ Building...
2025-Nov-07 15:43:06.769116
#22 ...
2025-Nov-07 15:43:06.769116
2025-Nov-07 15:43:06.769116
#20 [backend-builder 6/9] RUN mvn dependency:go-offline -B
2025-Nov-07 15:43:06.769116
#20 25.74 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.8.1/commons-lang3-3.8.1.pom (28 kB at 148 kB/s)
2025-Nov-07 15:43:06.769116
#20 25.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-text/1.3/commons-text-1.3.pom
2025-Nov-07 15:43:06.769116
#20 25.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-text/1.3/commons-text-1.3.pom (14 kB at 357 kB/s)
2025-Nov-07 15:43:06.769116
#20 25.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/45/commons-parent-45.pom
2025-Nov-07 15:43:06.769116
#20 25.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/45/commons-parent-45.pom (73 kB at 1.5 MB/s)
2025-Nov-07 15:43:06.883560
#20 25.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.7/commons-lang3-3.7.pom
2025-Nov-07 15:43:06.883560
#20 25.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.7/commons-lang3-3.7.pom (28 kB at 510 kB/s)
2025-Nov-07 15:43:06.883560
#20 25.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpclient/4.5.13/httpclient-4.5.13.pom
2025-Nov-07 15:43:06.883560
#20 25.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpclient/4.5.13/httpclient-4.5.13.pom (6.6 kB at 174 kB/s)
2025-Nov-07 15:43:07.011944
#20 25.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-client/4.5.13/httpcomponents-client-4.5.13.pom
2025-Nov-07 15:43:07.011944
#20 26.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-client/4.5.13/httpcomponents-client-4.5.13.pom (16 kB at 468 kB/s)
2025-Nov-07 15:43:07.011944
#20 26.01 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-parent/11/httpcomponents-parent-11.pom
2025-Nov-07 15:43:07.011944
#20 26.04 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-parent/11/httpcomponents-parent-11.pom (35 kB at 1.0 MB/s)
2025-Nov-07 15:43:07.011944
#20 26.05 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcore/4.4.13/httpcore-4.4.13.pom
2025-Nov-07 15:43:07.011944
#20 26.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcore/4.4.13/httpcore-4.4.13.pom (5.0 kB at 146 kB/s)
2025-Nov-07 15:43:07.122602
#20 26.09 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-core/4.4.13/httpcomponents-core-4.4.13.pom
2025-Nov-07 15:43:07.122602
#20 26.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-core/4.4.13/httpcomponents-core-4.4.13.pom (13 kB at 366 kB/s)
2025-Nov-07 15:43:07.122602
#20 26.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.11/commons-codec-1.11.pom
2025-Nov-07 15:43:07.122602
#20 26.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.11/commons-codec-1.11.pom (14 kB at 388 kB/s)
2025-Nov-07 15:43:07.122602
#20 26.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcore/4.4.14/httpcore-4.4.14.pom
2025-Nov-07 15:43:07.233893
#20 26.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcore/4.4.14/httpcore-4.4.14.pom (5.0 kB at 96 kB/s)
2025-Nov-07 15:43:07.233893
#20 26.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-core/4.4.14/httpcomponents-core-4.4.14.pom
2025-Nov-07 15:43:07.233893
#20 26.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-core/4.4.14/httpcomponents-core-4.4.14.pom (13 kB at 337 kB/s)
2025-Nov-07 15:43:07.335248
#20 26.32 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml/1.11.1/doxia-module-xhtml-1.11.1.pom
2025-Nov-07 15:43:07.335248
#20 26.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml/1.11.1/doxia-module-xhtml-1.11.1.pom (2.0 kB at 24 kB/s)
2025-Nov-07 15:43:07.452849
#20 26.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-modules/1.11.1/doxia-modules-1.11.1.pom
2025-Nov-07 15:43:07.452849
#20 26.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-modules/1.11.1/doxia-modules-1.11.1.pom (2.7 kB at 40 kB/s)
2025-Nov-07 15:43:07.452849
#20 26.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml5/1.11.1/doxia-module-xhtml5-1.11.1.pom
2025-Nov-07 15:43:07.452849
#20 26.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml5/1.11.1/doxia-module-xhtml5-1.11.1.pom (2.0 kB at 44 kB/s)
2025-Nov-07 15:43:07.567336
#20 26.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-apt/1.11.1/doxia-module-apt-1.11.1.pom
2025-Nov-07 15:43:07.567336
#20 26.58 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-apt/1.11.1/doxia-module-apt-1.11.1.pom (2.1 kB at 51 kB/s)
2025-Nov-07 15:43:07.567336
#20 26.60 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xdoc/1.11.1/doxia-module-xdoc-1.11.1.pom
2025-Nov-07 15:43:07.567336
#20 26.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xdoc/1.11.1/doxia-module-xdoc-1.11.1.pom (4.5 kB at 102 kB/s)
2025-Nov-07 15:43:07.667204
#20 26.66 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-fml/1.11.1/doxia-module-fml-1.11.1.pom
2025-Nov-07 15:43:07.667204
#20 26.70 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-fml/1.11.1/doxia-module-fml-1.11.1.pom (4.4 kB at 122 kB/s)
2025-Nov-07 15:43:07.667204
#20 26.70 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-markdown/1.11.1/doxia-module-markdown-1.11.1.pom
2025-Nov-07 15:43:07.667204
#20 26.74 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-markdown/1.11.1/doxia-module-markdown-1.11.1.pom (5.4 kB at 131 kB/s)
2025-Nov-07 15:43:07.768116
#20 26.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-all/0.42.14/flexmark-all-0.42.14.pom
2025-Nov-07 15:43:07.768116
#20 26.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-all/0.42.14/flexmark-all-0.42.14.pom (9.0 kB at 213 kB/s)
2025-Nov-07 15:43:07.768116
#20 26.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-java/0.42.14/flexmark-java-0.42.14.pom
2025-Nov-07 15:43:07.768116
#20 26.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-java/0.42.14/flexmark-java-0.42.14.pom (20 kB at 645 kB/s)
2025-Nov-07 15:43:07.768116
#20 26.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark/0.42.14/flexmark-0.42.14.pom
2025-Nov-07 15:43:07.882120
#20 26.87 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark/0.42.14/flexmark-0.42.14.pom (2.5 kB at 79 kB/s)
2025-Nov-07 15:43:07.882120
#20 26.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-util/0.42.14/flexmark-util-0.42.14.pom
2025-Nov-07 15:43:07.882120
#20 26.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-util/0.42.14/flexmark-util-0.42.14.pom (792 B at 22 kB/s)
2025-Nov-07 15:43:07.882120
#20 26.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-abbreviation/0.42.14/flexmark-ext-abbreviation-0.42.14.pom
2025-Nov-07 15:43:07.882120
#20 26.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-abbreviation/0.42.14/flexmark-ext-abbreviation-0.42.14.pom (2.5 kB at 65 kB/s)
2025-Nov-07 15:43:07.987549
#20 26.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-autolink/0.42.14/flexmark-ext-autolink-0.42.14.pom
2025-Nov-07 15:43:07.987549
#20 27.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-autolink/0.42.14/flexmark-ext-autolink-0.42.14.pom (1.8 kB at 51 kB/s)
2025-Nov-07 15:43:07.987549
#20 27.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/nibor/autolink/autolink/0.6.0/autolink-0.6.0.pom
2025-Nov-07 15:43:07.987549
#20 27.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/nibor/autolink/autolink/0.6.0/autolink-0.6.0.pom (9.2 kB at 241 kB/s)
2025-Nov-07 15:43:08.119551
#20 27.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-formatter/0.42.14/flexmark-formatter-0.42.14.pom
2025-Nov-07 15:43:08.119551
#20 27.10 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-formatter/0.42.14/flexmark-formatter-0.42.14.pom (1.1 kB at 37 kB/s)
2025-Nov-07 15:43:08.119551
#20 27.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-admonition/0.42.14/flexmark-ext-admonition-0.42.14.pom
2025-Nov-07 15:43:08.119551
#20 27.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-admonition/0.42.14/flexmark-ext-admonition-0.42.14.pom (1.5 kB at 44 kB/s)
2025-Nov-07 15:43:08.119551
#20 27.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-anchorlink/0.42.14/flexmark-ext-anchorlink-0.42.14.pom
2025-Nov-07 15:43:08.119551
#20 27.20 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-anchorlink/0.42.14/flexmark-ext-anchorlink-0.42.14.pom (1.6 kB at 40 kB/s)
2025-Nov-07 15:43:08.246386
#20 27.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-aside/0.42.14/flexmark-ext-aside-0.42.14.pom
2025-Nov-07 15:43:08.246386
#20 27.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-aside/0.42.14/flexmark-ext-aside-0.42.14.pom (1.5 kB at 42 kB/s)
2025-Nov-07 15:43:08.246386
#20 27.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-jira-converter/0.42.14/flexmark-jira-converter-0.42.14.pom
2025-Nov-07 15:43:08.246386
#20 27.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-jira-converter/0.42.14/flexmark-jira-converter-0.42.14.pom (2.1 kB at 53 kB/s)
2025-Nov-07 15:43:08.246386
#20 27.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-strikethrough/0.42.14/flexmark-ext-gfm-strikethrough-0.42.14.pom
2025-Nov-07 15:43:08.246386
#20 27.32 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-strikethrough/0.42.14/flexmark-ext-gfm-strikethrough-0.42.14.pom (1.3 kB at 33 kB/s)
2025-Nov-07 15:43:08.382725
#20 27.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-tables/0.42.14/flexmark-ext-tables-0.42.14.pom
2025-Nov-07 15:43:08.382725
#20 27.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-tables/0.42.14/flexmark-ext-tables-0.42.14.pom (1.5 kB at 38 kB/s)
2025-Nov-07 15:43:08.382725
#20 27.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-wikilink/0.42.14/flexmark-ext-wikilink-0.42.14.pom
2025-Nov-07 15:43:08.382725
#20 27.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-wikilink/0.42.14/flexmark-ext-wikilink-0.42.14.pom (1.5 kB at 44 kB/s)
2025-Nov-07 15:43:08.382725
#20 27.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-ins/0.42.14/flexmark-ext-ins-0.42.14.pom
2025-Nov-07 15:43:08.382725
#20 27.46 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-ins/0.42.14/flexmark-ext-ins-0.42.14.pom (1.3 kB at 30 kB/s)
2025-Nov-07 15:43:08.504871
#20 27.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-superscript/0.42.14/flexmark-ext-superscript-0.42.14.pom
2025-Nov-07 15:43:08.504871
#20 27.49 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-superscript/0.42.14/flexmark-ext-superscript-0.42.14.pom (1.3 kB at 37 kB/s)
2025-Nov-07 15:43:08.504871
#20 27.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-attributes/0.42.14/flexmark-ext-attributes-0.42.14.pom
2025-Nov-07 15:43:08.504871
#20 27.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-attributes/0.42.14/flexmark-ext-attributes-0.42.14.pom (2.6 kB at 84 kB/s)
2025-Nov-07 15:43:08.504871
#20 27.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-definition/0.42.14/flexmark-ext-definition-0.42.14.pom
2025-Nov-07 15:43:08.504871
#20 27.58 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-definition/0.42.14/flexmark-ext-definition-0.42.14.pom (1.3 kB at 31 kB/s)
2025-Nov-07 15:43:08.645289
#20 27.59 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-emoji/0.42.14/flexmark-ext-emoji-0.42.14.pom
2025-Nov-07 15:43:08.645289
#20 27.62 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-emoji/0.42.14/flexmark-ext-emoji-0.42.14.pom (1.5 kB at 43 kB/s)
2025-Nov-07 15:43:08.645289
#20 27.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-enumerated-reference/0.42.14/flexmark-ext-enumerated-reference-0.42.14.pom
2025-Nov-07 15:43:08.645289
#20 27.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-enumerated-reference/0.42.14/flexmark-ext-enumerated-reference-0.42.14.pom (1.7 kB at 39 kB/s)
2025-Nov-07 15:43:08.645289
#20 27.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-escaped-character/0.42.14/flexmark-ext-escaped-character-0.42.14.pom
2025-Nov-07 15:43:08.645289
#20 27.72 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-escaped-character/0.42.14/flexmark-ext-escaped-character-0.42.14.pom (1.3 kB at 33 kB/s)
2025-Nov-07 15:43:08.756684
#20 27.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-footnotes/0.42.14/flexmark-ext-footnotes-0.42.14.pom
2025-Nov-07 15:43:08.756684
#20 27.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-footnotes/0.42.14/flexmark-ext-footnotes-0.42.14.pom (1.3 kB at 46 kB/s)
2025-Nov-07 15:43:08.756684
#20 27.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-issues/0.42.14/flexmark-ext-gfm-issues-0.42.14.pom
2025-Nov-07 15:43:08.756684
#20 27.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-issues/0.42.14/flexmark-ext-gfm-issues-0.42.14.pom (1.3 kB at 47 kB/s)
2025-Nov-07 15:43:08.756684
#20 27.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-tables/0.42.14/flexmark-ext-gfm-tables-0.42.14.pom
2025-Nov-07 15:43:08.756684
#20 27.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-tables/0.42.14/flexmark-ext-gfm-tables-0.42.14.pom (1.3 kB at 46 kB/s)
2025-Nov-07 15:43:08.864050
#20 27.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-tasklist/0.42.14/flexmark-ext-gfm-tasklist-0.42.14.pom
2025-Nov-07 15:43:08.864050
#20 27.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-tasklist/0.42.14/flexmark-ext-gfm-tasklist-0.42.14.pom (1.4 kB at 51 kB/s)
2025-Nov-07 15:43:08.864050
#20 27.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-users/0.42.14/flexmark-ext-gfm-users-0.42.14.pom
2025-Nov-07 15:43:08.864050
#20 27.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-users/0.42.14/flexmark-ext-gfm-users-0.42.14.pom (1.3 kB at 48 kB/s)
2025-Nov-07 15:43:08.864050
#20 27.90 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gitlab/0.42.14/flexmark-ext-gitlab-0.42.14.pom
2025-Nov-07 15:43:08.864050
#20 27.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gitlab/0.42.14/flexmark-ext-gitlab-0.42.14.pom (1.3 kB at 33 kB/s)
2025-Nov-07 15:43:08.983108
#20 27.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-jekyll-front-matter/0.42.14/flexmark-ext-jekyll-front-matter-0.42.14.pom
2025-Nov-07 15:43:08.983108
#20 27.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-jekyll-front-matter/0.42.14/flexmark-ext-jekyll-front-matter-0.42.14.pom (1.5 kB at 45 kB/s)
2025-Nov-07 15:43:08.983108
#20 27.99 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-yaml-front-matter/0.42.14/flexmark-ext-yaml-front-matter-0.42.14.pom
2025-Nov-07 15:43:08.983108
#20 28.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-yaml-front-matter/0.42.14/flexmark-ext-yaml-front-matter-0.42.14.pom (1.3 kB at 42 kB/s)
2025-Nov-07 15:43:08.983108
#20 28.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-jekyll-tag/0.42.14/flexmark-ext-jekyll-tag-0.42.14.pom
2025-Nov-07 15:43:08.983108
#20 28.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-jekyll-tag/0.42.14/flexmark-ext-jekyll-tag-0.42.14.pom (1.3 kB at 45 kB/s)
2025-Nov-07 15:43:09.121291
#20 28.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-media-tags/0.42.14/flexmark-ext-media-tags-0.42.14.pom
2025-Nov-07 15:43:09.121291
#20 28.09 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-media-tags/0.42.14/flexmark-ext-media-tags-0.42.14.pom (1.0 kB at 38 kB/s)
2025-Nov-07 15:43:09.121291
#20 28.10 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-macros/0.42.14/flexmark-ext-macros-0.42.14.pom
2025-Nov-07 15:43:09.121291
#20 28.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-macros/0.42.14/flexmark-ext-macros-0.42.14.pom (1.6 kB at 30 kB/s)
2025-Nov-07 15:43:09.121291
#20 28.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-xwiki-macros/0.42.14/flexmark-ext-xwiki-macros-0.42.14.pom
2025-Nov-07 15:43:09.121291
#20 28.20 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-xwiki-macros/0.42.14/flexmark-ext-xwiki-macros-0.42.14.pom (1.3 kB at 33 kB/s)
2025-Nov-07 15:43:09.249944
#20 28.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-toc/0.42.14/flexmark-ext-toc-0.42.14.pom
2025-Nov-07 15:43:09.249944
#20 28.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-toc/0.42.14/flexmark-ext-toc-0.42.14.pom (1.5 kB at 47 kB/s)
2025-Nov-07 15:43:09.249944
#20 28.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-typographic/0.42.14/flexmark-ext-typographic-0.42.14.pom
2025-Nov-07 15:43:09.249944
#20 28.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-typographic/0.42.14/flexmark-ext-typographic-0.42.14.pom (1.3 kB at 29 kB/s)
2025-Nov-07 15:43:09.249944
#20 28.29 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-youtube-embedded/0.42.14/flexmark-ext-youtube-embedded-0.42.14.pom
2025-Nov-07 15:43:09.249944
#20 28.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-youtube-embedded/0.42.14/flexmark-ext-youtube-embedded-0.42.14.pom (883 B at 28 kB/s)
2025-Nov-07 15:43:09.370366
#20 28.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-html-parser/0.42.14/flexmark-html-parser-0.42.14.pom
2025-Nov-07 15:43:09.370366
#20 28.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-html-parser/0.42.14/flexmark-html-parser-0.42.14.pom (1.5 kB at 47 kB/s)
2025-Nov-07 15:43:09.370366
#20 28.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jsoup/jsoup/1.10.2/jsoup-1.10.2.pom
2025-Nov-07 15:43:09.370366
#20 28.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jsoup/jsoup/1.10.2/jsoup-1.10.2.pom (7.3 kB at 182 kB/s)
2025-Nov-07 15:43:09.370366
#20 28.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-profile-pegdown/0.42.14/flexmark-profile-pegdown-0.42.14.pom
2025-Nov-07 15:43:09.370366
#20 28.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-profile-pegdown/0.42.14/flexmark-profile-pegdown-0.42.14.pom (4.0 kB at 122 kB/s)
2025-Nov-07 15:43:09.508144
#20 28.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-youtrack-converter/0.42.14/flexmark-youtrack-converter-0.42.14.pom
2025-Nov-07 15:43:09.508144
#20 28.49 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-youtrack-converter/0.42.14/flexmark-youtrack-converter-0.42.14.pom (1.7 kB at 43 kB/s)
2025-Nov-07 15:43:09.508144
#20 28.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-confluence/1.11.1/doxia-module-confluence-1.11.1.pom
2025-Nov-07 15:43:09.508144
#20 28.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-confluence/1.11.1/doxia-module-confluence-1.11.1.pom (2.2 kB at 66 kB/s)
2025-Nov-07 15:43:09.508144
#20 28.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-docbook-simple/1.11.1/doxia-module-docbook-simple-1.11.1.pom
2025-Nov-07 15:43:09.508144
#20 28.58 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-docbook-simple/1.11.1/doxia-module-docbook-simple-1.11.1.pom (2.0 kB at 47 kB/s)
2025-Nov-07 15:43:09.650192
#20 28.59 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-twiki/1.11.1/doxia-module-twiki-1.11.1.pom
2025-Nov-07 15:43:09.650192
#20 28.62 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-twiki/1.11.1/doxia-module-twiki-1.11.1.pom (2.1 kB at 64 kB/s)
2025-Nov-07 15:43:09.650192
#20 28.64 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-decoration-model/1.11.1/doxia-decoration-model-1.11.1.pom
2025-Nov-07 15:43:09.650192
#20 28.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-decoration-model/1.11.1/doxia-decoration-model-1.11.1.pom (3.4 kB at 100 kB/s)
2025-Nov-07 15:43:09.650192
#20 28.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sitetools/1.11.1/doxia-sitetools-1.11.1.pom
2025-Nov-07 15:43:09.650192
#20 28.73 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sitetools/1.11.1/doxia-sitetools-1.11.1.pom (14 kB at 283 kB/s)
2025-Nov-07 15:43:09.764639
#20 28.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-renderer/1.11.1/doxia-site-renderer-1.11.1.pom
2025-Nov-07 15:43:09.764639
#20 28.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-renderer/1.11.1/doxia-site-renderer-1.11.1.pom (7.7 kB at 167 kB/s)
2025-Nov-07 15:43:09.764639
#20 28.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/3.0/maven-artifact-3.0.pom
2025-Nov-07 15:43:09.764639
#20 28.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/3.0/maven-artifact-3.0.pom (1.9 kB at 62 kB/s)
2025-Nov-07 15:43:09.870107
#20 28.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-skin-model/1.11.1/doxia-skin-model-1.11.1.pom
2025-Nov-07 15:43:09.870107
#20 28.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-skin-model/1.11.1/doxia-skin-model-1.11.1.pom (3.0 kB at 80 kB/s)
2025-Nov-07 15:43:09.870107
#20 28.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-container-default/1.0-alpha-30/plexus-container-default-1.0-alpha-30.pom
2025-Nov-07 15:43:09.870107
#20 28.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-container-default/1.0-alpha-30/plexus-container-default-1.0-alpha-30.pom (3.5 kB at 99 kB/s)
2025-Nov-07 15:43:09.870107
#20 28.94 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/1.0-alpha-30/plexus-containers-1.0-alpha-30.pom
2025-Nov-07 15:43:09.981393
#20 28.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/1.0-alpha-30/plexus-containers-1.0-alpha-30.pom (1.9 kB at 57 kB/s)
2025-Nov-07 15:43:09.981393
#20 28.98 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/1.0.11/plexus-1.0.11.pom
2025-Nov-07 15:43:09.981393
#20 29.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/1.0.11/plexus-1.0.11.pom (9.0 kB at 264 kB/s)
2025-Nov-07 15:43:09.981393
#20 29.02 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/1.2-alpha-9/plexus-classworlds-1.2-alpha-9.pom
2025-Nov-07 15:43:09.981393
#20 29.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/1.2-alpha-9/plexus-classworlds-1.2-alpha-9.pom (3.2 kB at 87 kB/s)
2025-Nov-07 15:43:10.109894
#20 29.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/junit/junit/3.8.1/junit-3.8.1.pom
2025-Nov-07 15:43:10.109894
#20 29.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/junit/junit/3.8.1/junit-3.8.1.pom (998 B at 24 kB/s)
2025-Nov-07 15:43:10.109894
#20 29.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-velocity/1.2/plexus-velocity-1.2.pom
2025-Nov-07 15:43:10.109894
#20 29.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-velocity/1.2/plexus-velocity-1.2.pom (2.8 kB at 88 kB/s)
2025-Nov-07 15:43:10.109894
#20 29.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-components/4.0/plexus-components-4.0.pom
2025-Nov-07 15:43:10.109894
#20 29.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-components/4.0/plexus-components-4.0.pom (2.7 kB at 78 kB/s)
2025-Nov-07 15:43:10.221353
#20 29.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/4.0/plexus-4.0.pom
2025-Nov-07 15:43:10.221353
#20 29.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/4.0/plexus-4.0.pom (22 kB at 614 kB/s)
2025-Nov-07 15:43:10.221353
#20 29.23 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-container-default/1.0-alpha-9-stable-1/plexus-container-default-1.0-alpha-9-stable-1.pom
2025-Nov-07 15:43:10.221353
#20 29.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-container-default/1.0-alpha-9-stable-1/plexus-container-default-1.0-alpha-9-stable-1.pom (3.9 kB at 123 kB/s)
2025-Nov-07 15:43:10.221353
#20 29.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/1.0.3/plexus-containers-1.0.3.pom
2025-Nov-07 15:43:10.221353
#20 29.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-containers/1.0.3/plexus-containers-1.0.3.pom (492 B at 16 kB/s)
2025-Nov-07 15:43:10.356599
#20 29.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/1.0.4/plexus-1.0.4.pom
2025-Nov-07 15:43:10.356599
#20 29.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/1.0.4/plexus-1.0.4.pom (5.7 kB at 143 kB/s)
2025-Nov-07 15:43:10.356599
#20 29.35 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/classworlds/classworlds/1.1-alpha-2/classworlds-1.1-alpha-2.pom
2025-Nov-07 15:43:10.356599
#20 29.39 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/classworlds/classworlds/1.1-alpha-2/classworlds-1.1-alpha-2.pom (3.1 kB at 80 kB/s)
2025-Nov-07 15:43:10.356599
#20 29.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.1/commons-collections-3.1.pom
2025-Nov-07 15:43:10.356599
#20 29.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.1/commons-collections-3.1.pom (6.1 kB at 164 kB/s)
2025-Nov-07 15:43:10.497891
#20 29.43 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity/1.7/velocity-1.7.pom
2025-Nov-07 15:43:10.497891
#20 29.47 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity/1.7/velocity-1.7.pom (11 kB at 293 kB/s)
2025-Nov-07 15:43:10.497891
#20 29.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.1/commons-collections-3.2.1.pom
2025-Nov-07 15:43:10.497891
#20 29.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.1/commons-collections-3.2.1.pom (13 kB at 379 kB/s)
2025-Nov-07 15:43:10.497891
#20 29.51 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/9/commons-parent-9.pom
2025-Nov-07 15:43:10.497891
#20 29.57 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/9/commons-parent-9.pom (22 kB at 360 kB/s)
2025-Nov-07 15:43:10.626580
#20 29.58 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-lang/commons-lang/2.4/commons-lang-2.4.pom
2025-Nov-07 15:43:10.626580
#20 29.62 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-lang/commons-lang/2.4/commons-lang-2.4.pom (14 kB at 333 kB/s)
2025-Nov-07 15:43:10.626580
#20 29.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-tools/2.0/velocity-tools-2.0.pom
2025-Nov-07 15:43:10.626580
#20 29.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-tools/2.0/velocity-tools-2.0.pom (18 kB at 492 kB/s)
2025-Nov-07 15:43:10.626580
#20 29.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.7.0/commons-beanutils-1.7.0.pom
2025-Nov-07 15:43:10.626580
#20 29.70 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.7.0/commons-beanutils-1.7.0.pom (357 B at 12 kB/s)
2025-Nov-07 15:43:10.763887
#20 29.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.0.3/commons-logging-1.0.3.pom
2025-Nov-07 15:43:10.763887
#20 29.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.0.3/commons-logging-1.0.3.pom (866 B at 24 kB/s)
2025-Nov-07 15:43:10.763887
#20 29.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-digester/commons-digester/1.8/commons-digester-1.8.pom
2025-Nov-07 15:43:10.763887
#20 29.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-digester/commons-digester/1.8/commons-digester-1.8.pom (7.0 kB at 206 kB/s)
2025-Nov-07 15:43:10.763887
#20 29.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.1/commons-logging-1.1.pom
2025-Nov-07 15:43:10.763887
#20 29.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.1/commons-logging-1.1.pom (6.2 kB at 124 kB/s)
2025-Nov-07 15:43:10.895844
#20 29.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/log4j/log4j/1.2.12/log4j-1.2.12.pom
2025-Nov-07 15:43:10.895844
#20 29.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/log4j/log4j/1.2.12/log4j-1.2.12.pom (145 B at 4.1 kB/s)
2025-Nov-07 15:43:10.895844
#20 29.89 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/logkit/logkit/1.0.1/logkit-1.0.1.pom
2025-Nov-07 15:43:10.895844
#20 29.93 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/logkit/logkit/1.0.1/logkit-1.0.1.pom (147 B at 3.5 kB/s)
2025-Nov-07 15:43:10.895844
#20 29.93 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/avalon-framework/avalon-framework/4.1.3/avalon-framework-4.1.3.pom
2025-Nov-07 15:43:10.895844
#20 29.97 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/avalon-framework/avalon-framework/4.1.3/avalon-framework-4.1.3.pom (167 B at 3.9 kB/s)
2025-Nov-07 15:43:10.996194
#20 29.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-chain/commons-chain/1.1/commons-chain-1.1.pom
2025-Nov-07 15:43:10.996194
#20 30.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-chain/commons-chain/1.1/commons-chain-1.1.pom (6.0 kB at 194 kB/s)
2025-Nov-07 15:43:10.996194
#20 30.01 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-digester/commons-digester/1.6/commons-digester-1.6.pom
2025-Nov-07 15:43:10.996194
#20 30.03 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-digester/commons-digester/1.6/commons-digester-1.6.pom (974 B at 36 kB/s)
2025-Nov-07 15:43:10.996194
#20 30.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.6/commons-beanutils-1.6.pom
2025-Nov-07 15:43:10.996194
#20 30.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.6/commons-beanutils-1.6.pom (2.3 kB at 70 kB/s)
2025-Nov-07 15:43:11.101108
#20 30.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.0/commons-logging-1.0.pom
2025-Nov-07 15:43:11.101108
#20 30.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-logging/commons-logging/1.0/commons-logging-1.0.pom (163 B at 5.3 kB/s)
2025-Nov-07 15:43:11.101108
#20 30.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/2.0/commons-collections-2.0.pom
2025-Nov-07 15:43:11.101108
#20 30.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/2.0/commons-collections-2.0.pom (171 B at 5.2 kB/s)
2025-Nov-07 15:43:11.101108
#20 30.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/2.1/commons-collections-2.1.pom
2025-Nov-07 15:43:11.101108
#20 30.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/2.1/commons-collections-2.1.pom (3.3 kB at 115 kB/s)
2025-Nov-07 15:43:11.225931
#20 30.18 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/xml-apis/xml-apis/1.0.b2/xml-apis-1.0.b2.pom
2025-Nov-07 15:43:11.225931
#20 30.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/xml-apis/xml-apis/1.0.b2/xml-apis-1.0.b2.pom (2.2 kB at 64 kB/s)
2025-Nov-07 15:43:11.225931
#20 30.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2/commons-collections-3.2.pom
2025-Nov-07 15:43:11.225931
#20 30.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2/commons-collections-3.2.pom (11 kB at 334 kB/s)
2025-Nov-07 15:43:11.225931
#20 30.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/dom4j/dom4j/1.1/dom4j-1.1.pom
2025-Nov-07 15:43:11.225931
#20 30.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/dom4j/dom4j/1.1/dom4j-1.1.pom (142 B at 3.5 kB/s)
2025-Nov-07 15:43:11.326536
#20 30.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/oro/oro/2.0.8/oro-2.0.8.pom
2025-Nov-07 15:43:11.326536
#20 30.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/oro/oro/2.0.8/oro-2.0.8.pom (140 B at 4.4 kB/s)
2025-Nov-07 15:43:11.326536
#20 30.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity/1.6.2/velocity-1.6.2.pom
2025-Nov-07 15:43:11.326536
#20 30.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity/1.6.2/velocity-1.6.2.pom (11 kB at 343 kB/s)
2025-Nov-07 15:43:11.326536
#20 30.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-integration-tools/1.11.1/doxia-integration-tools-1.11.1.pom
2025-Nov-07 15:43:11.326536
#20 30.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-integration-tools/1.11.1/doxia-integration-tools-1.11.1.pom (6.0 kB at 189 kB/s)
2025-Nov-07 15:43:11.454244
#20 30.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/3.0/maven-reporting-api-3.0.pom
2025-Nov-07 15:43:11.454244
#20 30.44 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/3.0/maven-reporting-api-3.0.pom (2.4 kB at 82 kB/s)
2025-Nov-07 15:43:11.454244
#20 30.44 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/15/maven-shared-components-15.pom
2025-Nov-07 15:43:11.454244
#20 30.49 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/15/maven-shared-components-15.pom (9.3 kB at 187 kB/s)
2025-Nov-07 15:43:11.454244
#20 30.49 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/16/maven-parent-16.pom
2025-Nov-07 15:43:11.454244
#20 30.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/16/maven-parent-16.pom (23 kB at 646 kB/s)
2025-Nov-07 15:43:11.558540
2025-Nov-07 15:43:11.571818
#20 30.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/1.0/doxia-sink-api-1.0.pom
2025-Nov-07 15:43:11.571818
#20 30.57 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/1.0/doxia-sink-api-1.0.pom (1.4 kB at 45 kB/s)
2025-Nov-07 15:43:11.571818
#20 30.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia/1.0/doxia-1.0.pom
2025-Nov-07 15:43:11.571818
#20 30.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia/1.0/doxia-1.0.pom (9.6 kB at 311 kB/s)
2025-Nov-07 15:43:11.571818
#20 30.60 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/10/maven-parent-10.pom
2025-Nov-07 15:43:11.571818
#20 30.63 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/10/maven-parent-10.pom (32 kB at 1.1 MB/s)
2025-Nov-07 15:43:11.674484
#20 30.64 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/2.2.1/maven-artifact-2.2.1.pom
2025-Nov-07 15:43:11.674484
#20 30.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/2.2.1/maven-artifact-2.2.1.pom (1.6 kB at 45 kB/s)
2025-Nov-07 15:43:11.674484
#20 30.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven/2.2.1/maven-2.2.1.pom
2025-Nov-07 15:43:11.674484
#20 30.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven/2.2.1/maven-2.2.1.pom (22 kB at 700 kB/s)
2025-Nov-07 15:43:11.674484
#20 30.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/11/maven-parent-11.pom
2025-Nov-07 15:43:11.674484
#20 30.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-parent/11/maven-parent-11.pom (32 kB at 900 kB/s)
2025-Nov-07 15:43:11.804126
#20 30.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/5/apache-5.pom
2025-Nov-07 15:43:11.804126
#20 30.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/5/apache-5.pom (4.1 kB at 124 kB/s)
2025-Nov-07 15:43:11.804126
#20 30.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/2.2.1/maven-model-2.2.1.pom
2025-Nov-07 15:43:11.804126
#20 30.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/2.2.1/maven-model-2.2.1.pom (3.2 kB at 64 kB/s)
2025-Nov-07 15:43:11.804126
#20 30.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/2.2.1/maven-plugin-api-2.2.1.pom
2025-Nov-07 15:43:11.804126
#20 30.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/2.2.1/maven-plugin-api-2.2.1.pom (1.5 kB at 38 kB/s)
2025-Nov-07 15:43:11.925429
#20 30.89 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-server/9.4.46.v20220331/jetty-server-9.4.46.v20220331.pom
2025-Nov-07 15:43:11.925429
#20 30.92 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-server/9.4.46.v20220331/jetty-server-9.4.46.v20220331.pom (3.4 kB at 101 kB/s)
2025-Nov-07 15:43:11.925429
#20 30.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-project/9.4.46.v20220331/jetty-project-9.4.46.v20220331.pom
2025-Nov-07 15:43:11.925429
#20 30.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-project/9.4.46.v20220331/jetty-project-9.4.46.v20220331.pom (71 kB at 2.0 MB/s)
2025-Nov-07 15:43:11.925429
#20 30.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.8.2/junit-bom-5.8.2.pom
2025-Nov-07 15:43:11.925429
#20 31.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.8.2/junit-bom-5.8.2.pom (5.6 kB at 161 kB/s)
2025-Nov-07 15:43:12.048102
#20 31.01 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/testcontainers/testcontainers-bom/1.16.1/testcontainers-bom-1.16.1.pom
2025-Nov-07 15:43:12.048102
#20 31.04 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/testcontainers/testcontainers-bom/1.16.1/testcontainers-bom-1.16.1.pom (7.2 kB at 219 kB/s)
2025-Nov-07 15:43:12.048102
#20 31.05 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/infinispan/infinispan-bom/11.0.15.Final/infinispan-bom-11.0.15.Final.pom
2025-Nov-07 15:43:12.048102
#20 31.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/infinispan/infinispan-bom/11.0.15.Final/infinispan-bom-11.0.15.Final.pom (19 kB at 523 kB/s)
2025-Nov-07 15:43:12.048102
#20 31.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/infinispan/infinispan-build-configuration-parent/11.0.15.Final/infinispan-build-configuration-parent-11.0.15.Final.pom
2025-Nov-07 15:43:12.048102
#20 31.12 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/infinispan/infinispan-build-configuration-parent/11.0.15.Final/infinispan-build-configuration-parent-11.0.15.Final.pom (13 kB at 360 kB/s)
2025-Nov-07 15:43:12.153450
#20 31.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/jboss-parent/36/jboss-parent-36.pom
2025-Nov-07 15:43:12.153450
#20 31.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/jboss-parent/36/jboss-parent-36.pom (66 kB at 2.0 MB/s)
2025-Nov-07 15:43:12.153450
#20 31.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/javax/servlet/javax.servlet-api/3.1.0/javax.servlet-api-3.1.0.pom
2025-Nov-07 15:43:12.153450
#20 31.20 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/javax/servlet/javax.servlet-api/3.1.0/javax.servlet-api-3.1.0.pom (14 kB at 410 kB/s)
2025-Nov-07 15:43:12.153450
#20 31.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-http/9.4.46.v20220331/jetty-http-9.4.46.v20220331.pom
2025-Nov-07 15:43:12.153450
#20 31.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-http/9.4.46.v20220331/jetty-http-9.4.46.v20220331.pom (4.0 kB at 134 kB/s)
2025-Nov-07 15:43:12.258304
#20 31.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-util/9.4.46.v20220331/jetty-util-9.4.46.v20220331.pom
2025-Nov-07 15:43:12.258304
#20 31.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-util/9.4.46.v20220331/jetty-util-9.4.46.v20220331.pom (4.0 kB at 92 kB/s)
2025-Nov-07 15:43:12.258304
#20 31.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-io/9.4.46.v20220331/jetty-io-9.4.46.v20220331.pom
2025-Nov-07 15:43:12.258304
#20 31.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-io/9.4.46.v20220331/jetty-io-9.4.46.v20220331.pom (1.2 kB at 29 kB/s)
2025-Nov-07 15:43:12.359371
#20 31.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-servlet/9.4.46.v20220331/jetty-servlet-9.4.46.v20220331.pom
2025-Nov-07 15:43:12.359371
#20 31.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-servlet/9.4.46.v20220331/jetty-servlet-9.4.46.v20220331.pom (2.3 kB at 46 kB/s)
2025-Nov-07 15:43:12.359371
#20 31.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-security/9.4.46.v20220331/jetty-security-9.4.46.v20220331.pom
2025-Nov-07 15:43:12.359371
#20 31.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-security/9.4.46.v20220331/jetty-security-9.4.46.v20220331.pom (2.1 kB at 50 kB/s)
2025-Nov-07 15:43:12.471923
#20 31.44 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-util-ajax/9.4.46.v20220331/jetty-util-ajax-9.4.46.v20220331.pom
2025-Nov-07 15:43:12.471923
#20 31.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-util-ajax/9.4.46.v20220331/jetty-util-ajax-9.4.46.v20220331.pom (1.3 kB at 23 kB/s)
2025-Nov-07 15:43:12.471923
#20 31.51 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-webapp/9.4.46.v20220331/jetty-webapp-9.4.46.v20220331.pom
2025-Nov-07 15:43:12.471923
#20 31.55 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-webapp/9.4.46.v20220331/jetty-webapp-9.4.46.v20220331.pom (3.2 kB at 79 kB/s)
2025-Nov-07 15:43:12.572295
#20 31.56 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-xml/9.4.46.v20220331/jetty-xml-9.4.46.v20220331.pom
2025-Nov-07 15:43:12.572295
#20 31.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-xml/9.4.46.v20220331/jetty-xml-9.4.46.v20220331.pom (1.7 kB at 52 kB/s)
2025-Nov-07 15:43:12.572295
#20 31.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/3.1.1/maven-reporting-api-3.1.1.jar
2025-Nov-07 15:43:12.675890
#20 31.69 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-api/3.1.1/maven-reporting-api-3.1.1.jar (11 kB at 278 kB/s)
2025-Nov-07 15:43:12.675890
#20 31.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-exec/1.6.0/maven-reporting-exec-1.6.0.jar
2025-Nov-07 15:43:12.675890
#20 31.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/3.2.5/maven-artifact-3.2.5.jar
2025-Nov-07 15:43:12.675890
#20 31.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-repository-metadata/3.2.5/maven-repository-metadata-3.2.5.jar
2025-Nov-07 15:43:12.675890
#20 31.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-core/3.2.5/maven-core-3.2.5.jar
2025-Nov-07 15:43:12.675890
#20 31.70 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model-builder/3.2.5/maven-model-builder-3.2.5.jar
2025-Nov-07 15:43:12.675890
#20 31.73 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/reporting/maven-reporting-exec/1.6.0/maven-reporting-exec-1.6.0.jar (31 kB at 828 kB/s)
2025-Nov-07 15:43:12.675890
#20 31.74 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-aether-provider/3.2.5/maven-aether-provider-3.2.5.jar
2025-Nov-07 15:43:12.675890
#20 31.74 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-repository-metadata/3.2.5/maven-repository-metadata-3.2.5.jar (26 kB at 666 kB/s)
2025-Nov-07 15:43:12.675890
#20 31.74 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-spi/1.0.0.v20140518/aether-spi-1.0.0.v20140518.jar
2025-Nov-07 15:43:12.675890
#20 31.74 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model-builder/3.2.5/maven-model-builder-3.2.5.jar (170 kB at 3.6 MB/s)
2025-Nov-07 15:43:12.675890
#20 31.74 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-impl/1.0.0.v20140518/aether-impl-1.0.0.v20140518.jar
2025-Nov-07 15:43:12.675890
#20 31.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-core/3.2.5/maven-core-3.2.5.jar (608 kB at 11 MB/s)
2025-Nov-07 15:43:12.780717
#20 31.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-api/1.0.0.v20140518/aether-api-1.0.0.v20140518.jar
2025-Nov-07 15:43:12.780717
#20 31.77 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-spi/1.0.0.v20140518/aether-spi-1.0.0.v20140518.jar (31 kB at 452 kB/s)
2025-Nov-07 15:43:12.780717
#20 31.77 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.plexus/0.3.5/org.eclipse.sisu.plexus-0.3.5.jar
2025-Nov-07 15:43:12.780717
#20 31.77 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-aether-provider/3.2.5/maven-aether-provider-3.2.5.jar (66 kB at 822 kB/s)
2025-Nov-07 15:43:12.780717
#20 31.78 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-artifact/3.2.5/maven-artifact-3.2.5.jar (55 kB at 641 kB/s)
2025-Nov-07 15:43:12.780717
#20 31.78 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/javax/annotation/javax.annotation-api/1.2/javax.annotation-api-1.2.jar
2025-Nov-07 15:43:12.780717
#20 31.78 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/javax/enterprise/cdi-api/1.2/cdi-api-1.2.jar
2025-Nov-07 15:43:12.780717
#20 31.78 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-impl/1.0.0.v20140518/aether-impl-1.0.0.v20140518.jar (172 kB at 2.2 MB/s)
2025-Nov-07 15:43:12.780717
#20 31.78 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.inject/0.3.5/org.eclipse.sisu.inject-0.3.5.jar
2025-Nov-07 15:43:12.780717
#20 31.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-api/1.0.0.v20140518/aether-api-1.0.0.v20140518.jar (136 kB at 1.3 MB/s)
2025-Nov-07 15:43:12.780717
#20 31.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-guice/3.2.3/sisu-guice-3.2.3-no_aop.jar
2025-Nov-07 15:43:12.780717
#20 31.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/javax/annotation/javax.annotation-api/1.2/javax.annotation-api-1.2.jar (26 kB at 249 kB/s)
2025-Nov-07 15:43:12.780717
#20 31.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/aopalliance/aopalliance/1.0/aopalliance-1.0.jar
2025-Nov-07 15:43:12.780717
#20 31.82 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.inject/0.3.5/org.eclipse.sisu.inject-0.3.5.jar (379 kB at 3.2 MB/s)
2025-Nov-07 15:43:12.780717
#20 31.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/guava/guava/16.0.1/guava-16.0.1.jar
2025-Nov-07 15:43:12.780717
#20 31.82 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/sisu/org.eclipse.sisu.plexus/0.3.5/org.eclipse.sisu.plexus-0.3.5.jar (205 kB at 1.7 MB/s)
2025-Nov-07 15:43:12.780717
#20 31.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.5.2/plexus-classworlds-2.5.2.jar
2025-Nov-07 15:43:12.780717
#20 31.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/javax/enterprise/cdi-api/1.2/cdi-api-1.2.jar (71 kB at 551 kB/s)
2025-Nov-07 15:43:12.780717
#20 31.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-sec-dispatcher/1.3/plexus-sec-dispatcher-1.3.jar
2025-Nov-07 15:43:12.780717
#20 31.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/aopalliance/aopalliance/1.0/aopalliance-1.0.jar (4.5 kB at 32 kB/s)
2025-Nov-07 15:43:12.780717
#20 31.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-cipher/1.4/plexus-cipher-1.4.jar
2025-Nov-07 15:43:12.780717
#20 31.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/sisu/sisu-guice/3.2.3/sisu-guice-3.2.3-no_aop.jar (398 kB at 2.8 MB/s)
2025-Nov-07 15:43:12.780717
#20 31.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/3.2.5/maven-model-3.2.5.jar
2025-Nov-07 15:43:12.780717
#20 31.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-classworlds/2.5.2/plexus-classworlds-2.5.2.jar (53 kB at 342 kB/s)
2025-Nov-07 15:43:12.780717
#20 31.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/3.2.5/maven-plugin-api-3.2.5.jar
2025-Nov-07 15:43:12.883022
#20 31.87 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-sec-dispatcher/1.3/plexus-sec-dispatcher-1.3.jar (29 kB at 166 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings/3.2.5/maven-settings-3.2.5.jar
2025-Nov-07 15:43:12.883022
#20 31.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/sonatype/plexus/plexus-cipher/1.4/plexus-cipher-1.4.jar (13 kB at 76 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings-builder/3.2.5/maven-settings-builder-3.2.5.jar
2025-Nov-07 15:43:12.883022
#20 31.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-model/3.2.5/maven-model-3.2.5.jar (161 kB at 864 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.89 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-util/1.0.0.v20140518/aether-util-1.0.0.v20140518.jar
2025-Nov-07 15:43:12.883022
#20 31.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-plugin-api/3.2.5/maven-plugin-api-3.2.5.jar (46 kB at 235 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.89 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.3.4/maven-shared-utils-3.3.4.jar
2025-Nov-07 15:43:12.883022
#20 31.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/guava/guava/16.0.1/guava-16.0.1.jar (2.2 MB at 11 MB/s)
2025-Nov-07 15:43:12.883022
#20 31.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.6/commons-io-2.6.jar
2025-Nov-07 15:43:12.883022
#20 31.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings/3.2.5/maven-settings-3.2.5.jar (43 kB at 205 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-archiver/3.5.2/maven-archiver-3.5.2.jar
2025-Nov-07 15:43:12.883022
#20 31.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/aether/aether-util/1.0.0.v20140518/aether-util-1.0.0.v20140518.jar (146 kB at 672 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.20/commons-compress-1.20.jar
2025-Nov-07 15:43:12.883022
#20 31.92 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-settings-builder/3.2.5/maven-settings-builder-3.2.5.jar (44 kB at 194 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.26/plexus-interpolation-1.26.jar
2025-Nov-07 15:43:12.883022
#20 31.93 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-utils/3.3.4/maven-shared-utils-3.3.4.jar (153 kB at 672 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.93 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.2.7/plexus-archiver-4.2.7.jar
2025-Nov-07 15:43:12.883022
#20 31.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/maven-archiver/3.5.2/maven-archiver-3.5.2.jar (26 kB at 106 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.2.0/plexus-io-3.2.0.jar
2025-Nov-07 15:43:12.883022
#20 31.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.6/commons-io-2.6.jar (215 kB at 839 kB/s)
2025-Nov-07 15:43:12.883022
#20 31.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/iq80/snappy/snappy/0.4/snappy-0.4.jar
2025-Nov-07 15:43:12.988128
#20 31.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-interpolation/1.26/plexus-interpolation-1.26.jar (85 kB at 328 kB/s)
2025-Nov-07 15:43:12.988128
#20 31.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.4.2/plexus-utils-3.4.2.jar
2025-Nov-07 15:43:12.988128
#20 31.97 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.2.7/plexus-archiver-4.2.7.jar (195 kB at 719 kB/s)
2025-Nov-07 15:43:12.988128
#20 31.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/1.11.1/doxia-sink-api-1.11.1.jar
2025-Nov-07 15:43:12.988128
#20 31.97 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.20/commons-compress-1.20.jar (632 kB at 2.3 MB/s)
2025-Nov-07 15:43:12.988128
#20 31.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-logging-api/1.11.1/doxia-logging-api-1.11.1.jar
2025-Nov-07 15:43:12.988128
#20 31.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.2.0/plexus-io-3.2.0.jar (76 kB at 271 kB/s)
2025-Nov-07 15:43:12.988128
#20 31.98 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-core/1.11.1/doxia-core-1.11.1.jar
2025-Nov-07 15:43:12.988128
#20 32.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/iq80/snappy/snappy/0.4/snappy-0.4.jar (58 kB at 192 kB/s)
2025-Nov-07 15:43:12.988128
#20 32.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-container-default/2.1.0/plexus-container-default-2.1.0.jar
2025-Nov-07 15:43:12.988128
#20 32.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-logging-api/1.11.1/doxia-logging-api-1.11.1.jar (12 kB at 38 kB/s)
2025-Nov-07 15:43:12.988128
#20 32.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/xbean/xbean-reflect/3.7/xbean-reflect-3.7.jar
2025-Nov-07 15:43:12.988128
#20 32.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.4.2/plexus-utils-3.4.2.jar (267 kB at 865 kB/s)
2025-Nov-07 15:43:12.988128
#20 32.01 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/collections/google-collections/1.0/google-collections-1.0.jar
2025-Nov-07 15:43:12.988128
#20 32.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-sink-api/1.11.1/doxia-sink-api-1.11.1.jar (12 kB at 37 kB/s)
2025-Nov-07 15:43:12.988128
#20 32.02 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.1.1/plexus-component-annotations-2.1.1.jar
2025-Nov-07 15:43:12.988128
#20 32.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-core/1.11.1/doxia-core-1.11.1.jar (218 kB at 679 kB/s)
2025-Nov-07 15:43:12.988128
#20 32.02 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.8.1/commons-lang3-3.8.1.jar
2025-Nov-07 15:43:12.988128
#20 32.04 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/xbean/xbean-reflect/3.7/xbean-reflect-3.7.jar (148 kB at 432 kB/s)
2025-Nov-07 15:43:12.988128
#20 32.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-text/1.3/commons-text-1.3.jar
2025-Nov-07 15:43:12.988128
#20 32.05 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/collections/google-collections/1.0/google-collections-1.0.jar (640 kB at 1.8 MB/s)
2025-Nov-07 15:43:12.988128
#20 32.05 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpclient/4.5.13/httpclient-4.5.13.jar
2025-Nov-07 15:43:12.988128
#20 32.05 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-component-annotations/2.1.1/plexus-component-annotations-2.1.1.jar (4.1 kB at 12 kB/s)
2025-Nov-07 15:43:12.988128
#20 32.05 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.11/commons-codec-1.11.jar
2025-Nov-07 15:43:12.988128
#20 32.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.8.1/commons-lang3-3.8.1.jar (502 kB at 1.4 MB/s)
2025-Nov-07 15:43:12.988128
#20 32.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcore/4.4.14/httpcore-4.4.14.jar
2025-Nov-07 15:43:13.098415
#20 32.09 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-container-default/2.1.0/plexus-container-default-2.1.0.jar (230 kB at 587 kB/s)
2025-Nov-07 15:43:13.098415
#20 32.09 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml/1.11.1/doxia-module-xhtml-1.11.1.jar
2025-Nov-07 15:43:13.098415
#20 32.10 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpclient/4.5.13/httpclient-4.5.13.jar (780 kB at 2.0 MB/s)
2025-Nov-07 15:43:13.098415
#20 32.10 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml5/1.11.1/doxia-module-xhtml5-1.11.1.jar
2025-Nov-07 15:43:13.098415
#20 32.10 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-text/1.3/commons-text-1.3.jar (183 kB at 456 kB/s)
2025-Nov-07 15:43:13.098415
#20 32.10 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-apt/1.11.1/doxia-module-apt-1.11.1.jar
2025-Nov-07 15:43:13.098415
#20 32.10 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.11/commons-codec-1.11.jar (335 kB at 827 kB/s)
2025-Nov-07 15:43:13.098415
#20 32.10 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xdoc/1.11.1/doxia-module-xdoc-1.11.1.jar
2025-Nov-07 15:43:13.098415
#20 32.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcore/4.4.14/httpcore-4.4.14.jar (328 kB at 797 kB/s)
2025-Nov-07 15:43:13.098415
#20 32.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-fml/1.11.1/doxia-module-fml-1.11.1.jar
2025-Nov-07 15:43:13.098415
#20 32.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml5/1.11.1/doxia-module-xhtml5-1.11.1.jar (18 kB at 42 kB/s)
2025-Nov-07 15:43:13.098415
#20 32.13 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-markdown/1.11.1/doxia-module-markdown-1.11.1.jar
2025-Nov-07 15:43:13.098415
#20 32.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xhtml/1.11.1/doxia-module-xhtml-1.11.1.jar (17 kB at 40 kB/s)
2025-Nov-07 15:43:13.098415
#20 32.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-xdoc/1.11.1/doxia-module-xdoc-1.11.1.jar (37 kB at 85 kB/s)
2025-Nov-07 15:43:13.098415
#20 32.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-all/0.42.14/flexmark-all-0.42.14.jar
2025-Nov-07 15:43:13.098415
#20 32.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-apt/1.11.1/doxia-module-apt-1.11.1.jar (55 kB at 126 kB/s)
2025-Nov-07 15:43:13.098415
#20 32.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark/0.42.14/flexmark-0.42.14.jar
2025-Nov-07 15:43:13.098415
#20 32.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-abbreviation/0.42.14/flexmark-ext-abbreviation-0.42.14.jar
2025-Nov-07 15:43:13.098415
#20 32.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-fml/1.11.1/doxia-module-fml-1.11.1.jar (38 kB at 85 kB/s)
2025-Nov-07 15:43:13.098415
#20 32.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-admonition/0.42.14/flexmark-ext-admonition-0.42.14.jar
2025-Nov-07 15:43:13.098415
#20 32.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-markdown/1.11.1/doxia-module-markdown-1.11.1.jar (18 kB at 39 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.17 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-anchorlink/0.42.14/flexmark-ext-anchorlink-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.17 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-all/0.42.14/flexmark-all-0.42.14.jar (2.2 kB at 4.5 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.17 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-aside/0.42.14/flexmark-ext-aside-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.17 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-abbreviation/0.42.14/flexmark-ext-abbreviation-0.42.14.jar (35 kB at 76 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.18 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-attributes/0.42.14/flexmark-ext-attributes-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark/0.42.14/flexmark-0.42.14.jar (389 kB at 796 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-autolink/0.42.14/flexmark-ext-autolink-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-admonition/0.42.14/flexmark-ext-admonition-0.42.14.jar (34 kB at 70 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/nibor/autolink/autolink/0.6.0/autolink-0.6.0.jar
2025-Nov-07 15:43:13.214731
#20 32.21 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-attributes/0.42.14/flexmark-ext-attributes-0.42.14.jar (36 kB at 70 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.21 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-definition/0.42.14/flexmark-ext-definition-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-anchorlink/0.42.14/flexmark-ext-anchorlink-0.42.14.jar (17 kB at 32 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-emoji/0.42.14/flexmark-ext-emoji-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-aside/0.42.14/flexmark-ext-aside-0.42.14.jar (16 kB at 31 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-enumerated-reference/0.42.14/flexmark-ext-enumerated-reference-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-autolink/0.42.14/flexmark-ext-autolink-0.42.14.jar (9.4 kB at 18 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/nibor/autolink/autolink/0.6.0/autolink-0.6.0.jar (16 kB at 30 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-footnotes/0.42.14/flexmark-ext-footnotes-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-escaped-character/0.42.14/flexmark-ext-escaped-character-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-emoji/0.42.14/flexmark-ext-emoji-0.42.14.jar (73 kB at 133 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.25 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-issues/0.42.14/flexmark-ext-gfm-issues-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-enumerated-reference/0.42.14/flexmark-ext-enumerated-reference-0.42.14.jar (66 kB at 120 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-strikethrough/0.42.14/flexmark-ext-gfm-strikethrough-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-definition/0.42.14/flexmark-ext-definition-0.42.14.jar (40 kB at 71 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-tables/0.42.14/flexmark-ext-gfm-tables-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-footnotes/0.42.14/flexmark-ext-footnotes-0.42.14.jar (41 kB at 72 kB/s)
2025-Nov-07 15:43:13.214731
#20 32.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-tasklist/0.42.14/flexmark-ext-gfm-tasklist-0.42.14.jar
2025-Nov-07 15:43:13.214731
#20 32.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-escaped-character/0.42.14/flexmark-ext-escaped-character-0.42.14.jar (13 kB at 22 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-users/0.42.14/flexmark-ext-gfm-users-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.29 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-issues/0.42.14/flexmark-ext-gfm-issues-0.42.14.jar (16 kB at 27 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.29 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gitlab/0.42.14/flexmark-ext-gitlab-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.29 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-strikethrough/0.42.14/flexmark-ext-gfm-strikethrough-0.42.14.jar (29 kB at 48 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.29 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-jekyll-front-matter/0.42.14/flexmark-ext-jekyll-front-matter-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-tables/0.42.14/flexmark-ext-gfm-tables-0.42.14.jar (33 kB at 55 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-jekyll-tag/0.42.14/flexmark-ext-jekyll-tag-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-tasklist/0.42.14/flexmark-ext-gfm-tasklist-0.42.14.jar (28 kB at 46 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-media-tags/0.42.14/flexmark-ext-media-tags-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.32 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gitlab/0.42.14/flexmark-ext-gitlab-0.42.14.jar (42 kB at 68 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.32 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-macros/0.42.14/flexmark-ext-macros-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.32 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-jekyll-tag/0.42.14/flexmark-ext-jekyll-tag-0.42.14.jar (21 kB at 34 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-gfm-users/0.42.14/flexmark-ext-gfm-users-0.42.14.jar (16 kB at 25 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-ins/0.42.14/flexmark-ext-ins-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-xwiki-macros/0.42.14/flexmark-ext-xwiki-macros-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-jekyll-front-matter/0.42.14/flexmark-ext-jekyll-front-matter-0.42.14.jar (18 kB at 29 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-superscript/0.42.14/flexmark-ext-superscript-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-media-tags/0.42.14/flexmark-ext-media-tags-0.42.14.jar (25 kB at 39 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-tables/0.42.14/flexmark-ext-tables-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.35 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-macros/0.42.14/flexmark-ext-macros-0.42.14.jar (35 kB at 53 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-toc/0.42.14/flexmark-ext-toc-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-superscript/0.42.14/flexmark-ext-superscript-0.42.14.jar (13 kB at 20 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-typographic/0.42.14/flexmark-ext-typographic-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-ins/0.42.14/flexmark-ext-ins-0.42.14.jar (13 kB at 19 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-wikilink/0.42.14/flexmark-ext-wikilink-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-tables/0.42.14/flexmark-ext-tables-0.42.14.jar (76 kB at 113 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-yaml-front-matter/0.42.14/flexmark-ext-yaml-front-matter-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-xwiki-macros/0.42.14/flexmark-ext-xwiki-macros-0.42.14.jar (31 kB at 46 kB/s)
2025-Nov-07 15:43:13.313516
#20 32.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-youtube-embedded/0.42.14/flexmark-ext-youtube-embedded-0.42.14.jar
2025-Nov-07 15:43:13.313516
#20 32.39 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-toc/0.42.14/flexmark-ext-toc-0.42.14.jar (91 kB at 131 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-formatter/0.42.14/flexmark-formatter-0.42.14.jar
2025-Nov-07 15:43:13.414628
#20 32.39 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-typographic/0.42.14/flexmark-ext-typographic-0.42.14.jar (22 kB at 32 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-html-parser/0.42.14/flexmark-html-parser-0.42.14.jar
2025-Nov-07 15:43:13.414628
#20 32.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-wikilink/0.42.14/flexmark-ext-wikilink-0.42.14.jar (26 kB at 36 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.40 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jsoup/jsoup/1.10.2/jsoup-1.10.2.jar
2025-Nov-07 15:43:13.414628
#20 32.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-youtube-embedded/0.42.14/flexmark-ext-youtube-embedded-0.42.14.jar (13 kB at 18 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-jira-converter/0.42.14/flexmark-jira-converter-0.42.14.jar
2025-Nov-07 15:43:13.414628
#20 32.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-ext-yaml-front-matter/0.42.14/flexmark-ext-yaml-front-matter-0.42.14.jar (18 kB at 26 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-profile-pegdown/0.42.14/flexmark-profile-pegdown-0.42.14.jar
2025-Nov-07 15:43:13.414628
#20 32.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-html-parser/0.42.14/flexmark-html-parser-0.42.14.jar (45 kB at 62 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-util/0.42.14/flexmark-util-0.42.14.jar
2025-Nov-07 15:43:13.414628
#20 32.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-formatter/0.42.14/flexmark-formatter-0.42.14.jar (97 kB at 133 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.43 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-youtrack-converter/0.42.14/flexmark-youtrack-converter-0.42.14.jar
2025-Nov-07 15:43:13.414628
#20 32.44 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jsoup/jsoup/1.10.2/jsoup-1.10.2.jar (351 kB at 472 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.44 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-confluence/1.11.1/doxia-module-confluence-1.11.1.jar
2025-Nov-07 15:43:13.414628
#20 32.44 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-profile-pegdown/0.42.14/flexmark-profile-pegdown-0.42.14.jar (6.3 kB at 8.4 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-docbook-simple/1.11.1/doxia-module-docbook-simple-1.11.1.jar
2025-Nov-07 15:43:13.414628
#20 32.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-jira-converter/0.42.14/flexmark-jira-converter-0.42.14.jar (40 kB at 53 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-twiki/1.11.1/doxia-module-twiki-1.11.1.jar
2025-Nov-07 15:43:13.414628
#20 32.46 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-util/0.42.14/flexmark-util-0.42.14.jar (385 kB at 508 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-decoration-model/1.11.1/doxia-decoration-model-1.11.1.jar
2025-Nov-07 15:43:13.414628
#20 32.46 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vladsch/flexmark/flexmark-youtrack-converter/0.42.14/flexmark-youtrack-converter-0.42.14.jar (41 kB at 54 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-renderer/1.11.1/doxia-site-renderer-1.11.1.jar
2025-Nov-07 15:43:13.414628
#20 32.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-docbook-simple/1.11.1/doxia-module-docbook-simple-1.11.1.jar (128 kB at 165 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-skin-model/1.11.1/doxia-skin-model-1.11.1.jar
2025-Nov-07 15:43:13.414628
#20 32.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-confluence/1.11.1/doxia-module-confluence-1.11.1.jar (58 kB at 74 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-velocity/1.2/plexus-velocity-1.2.jar
2025-Nov-07 15:43:13.414628
#20 32.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-decoration-model/1.11.1/doxia-decoration-model-1.11.1.jar (60 kB at 76 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.49 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity/1.7/velocity-1.7.jar
2025-Nov-07 15:43:13.414628
#20 32.49 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-module-twiki/1.11.1/doxia-module-twiki-1.11.1.jar (73 kB at 92 kB/s)
2025-Nov-07 15:43:13.414628
#20 32.49 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-lang/commons-lang/2.4/commons-lang-2.4.jar
2025-Nov-07 15:43:13.531712
#20 32.49 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-site-renderer/1.11.1/doxia-site-renderer-1.11.1.jar (65 kB at 82 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-tools/2.0/velocity-tools-2.0.jar
2025-Nov-07 15:43:13.531712
#20 32.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-skin-model/1.11.1/doxia-skin-model-1.11.1.jar (16 kB at 20 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.52 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.7.0/commons-beanutils-1.7.0.jar
2025-Nov-07 15:43:13.531712
#20 32.52 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-velocity/1.2/plexus-velocity-1.2.jar (8.1 kB at 9.8 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.52 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-digester/commons-digester/1.8/commons-digester-1.8.jar
2025-Nov-07 15:43:13.531712
#20 32.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-lang/commons-lang/2.4/commons-lang-2.4.jar (262 kB at 316 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.53 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-chain/commons-chain/1.1/commons-chain-1.1.jar
2025-Nov-07 15:43:13.531712
#20 32.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity-tools/2.0/velocity-tools-2.0.jar (347 kB at 415 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/dom4j/dom4j/1.1/dom4j-1.1.jar
2025-Nov-07 15:43:13.531712
#20 32.54 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/velocity/velocity/1.7/velocity-1.7.jar (450 kB at 537 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/oro/oro/2.0.8/oro-2.0.8.jar
2025-Nov-07 15:43:13.531712
#20 32.55 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/1.7.0/commons-beanutils-1.7.0.jar (189 kB at 222 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.55 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-integration-tools/1.11.1/doxia-integration-tools-1.11.1.jar
2025-Nov-07 15:43:13.531712
#20 32.57 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/oro/oro/2.0.8/oro-2.0.8.jar (65 kB at 75 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-server/9.4.46.v20220331/jetty-server-9.4.46.v20220331.jar
2025-Nov-07 15:43:13.531712
#20 32.58 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-chain/commons-chain/1.1/commons-chain-1.1.jar (90 kB at 103 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.58 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/javax/servlet/javax.servlet-api/3.1.0/javax.servlet-api-3.1.0.jar
2025-Nov-07 15:43:13.531712
#20 32.58 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/dom4j/dom4j/1.1/dom4j-1.1.jar (457 kB at 519 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.58 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-http/9.4.46.v20220331/jetty-http-9.4.46.v20220331.jar
2025-Nov-07 15:43:13.531712
#20 32.58 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/doxia/doxia-integration-tools/1.11.1/doxia-integration-tools-1.11.1.jar (47 kB at 53 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.59 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-io/9.4.46.v20220331/jetty-io-9.4.46.v20220331.jar
2025-Nov-07 15:43:13.531712
#20 32.59 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-digester/commons-digester/1.8/commons-digester-1.8.jar (144 kB at 162 kB/s)
2025-Nov-07 15:43:13.531712
#20 32.59 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-servlet/9.4.46.v20220331/jetty-servlet-9.4.46.v20220331.jar
2025-Nov-07 15:43:13.531712
#20 32.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/javax/servlet/javax.servlet-api/3.1.0/javax.servlet-api-3.1.0.jar (96 kB at 105 kB/s)
2025-Nov-07 15:43:13.755541
#20 32.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-security/9.4.46.v20220331/jetty-security-9.4.46.v20220331.jar
2025-Nov-07 15:43:13.755541
#20 32.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-server/9.4.46.v20220331/jetty-server-9.4.46.v20220331.jar (733 kB at 803 kB/s)
2025-Nov-07 15:43:13.755541
#20 32.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-util-ajax/9.4.46.v20220331/jetty-util-ajax-9.4.46.v20220331.jar
2025-Nov-07 15:43:13.755541
#20 32.62 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-http/9.4.46.v20220331/jetty-http-9.4.46.v20220331.jar (225 kB at 243 kB/s)
2025-Nov-07 15:43:13.755541
#20 32.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-webapp/9.4.46.v20220331/jetty-webapp-9.4.46.v20220331.jar
2025-Nov-07 15:43:13.755541
#20 32.63 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-io/9.4.46.v20220331/jetty-io-9.4.46.v20220331.jar (184 kB at 198 kB/s)
2025-Nov-07 15:43:13.755541
#20 32.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-xml/9.4.46.v20220331/jetty-xml-9.4.46.v20220331.jar
2025-Nov-07 15:43:13.755541
#20 32.63 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-servlet/9.4.46.v20220331/jetty-servlet-9.4.46.v20220331.jar (147 kB at 157 kB/s)
2025-Nov-07 15:43:13.755541
#20 32.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-util/9.4.46.v20220331/jetty-util-9.4.46.v20220331.jar
2025-Nov-07 15:43:13.755541
#20 32.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-util-ajax/9.4.46.v20220331/jetty-util-ajax-9.4.46.v20220331.jar (67 kB at 71 kB/s)
2025-Nov-07 15:43:13.755541
#20 32.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-security/9.4.46.v20220331/jetty-security-9.4.46.v20220331.jar (119 kB at 126 kB/s)
2025-Nov-07 15:43:13.755541
#20 32.66 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-xml/9.4.46.v20220331/jetty-xml-9.4.46.v20220331.jar (69 kB at 72 kB/s)
2025-Nov-07 15:43:13.755541
#20 32.66 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-webapp/9.4.46.v20220331/jetty-webapp-9.4.46.v20220331.jar (141 kB at 146 kB/s)
2025-Nov-07 15:43:13.755541
#20 32.68 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/jetty/jetty-util/9.4.46.v20220331/jetty-util-9.4.46.v20220331.jar (586 kB at 597 kB/s)
2025-Nov-07 15:43:13.778630
#20 32.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-incremental/1.1/maven-shared-incremental-1.1.pom
2025-Nov-07 15:43:13.914124
#20 32.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-incremental/1.1/maven-shared-incremental-1.1.pom (4.7 kB at 91 kB/s)
2025-Nov-07 15:43:13.914124
#20 32.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/19/maven-shared-components-19.pom
2025-Nov-07 15:43:13.914124
#20 32.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/19/maven-shared-components-19.pom (6.4 kB at 212 kB/s)
2025-Nov-07 15:43:13.914124
#20 32.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-java/1.4.0/plexus-java-1.4.0.pom
2025-Nov-07 15:43:13.914124
#20 32.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-java/1.4.0/plexus-java-1.4.0.pom (4.1 kB at 117 kB/s)
2025-Nov-07 15:43:14.032165
#20 33.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-languages/1.4.0/plexus-languages-1.4.0.pom
2025-Nov-07 15:43:14.032165
#20 33.03 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-languages/1.4.0/plexus-languages-1.4.0.pom (3.9 kB at 107 kB/s)
2025-Nov-07 15:43:14.032165
#20 33.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/20/plexus-20.pom
2025-Nov-07 15:43:14.032165
#20 33.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/20/plexus-20.pom (29 kB at 1.0 MB/s)
2025-Nov-07 15:43:14.032165
#20 33.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.4/junit-bom-5.11.4.pom
2025-Nov-07 15:43:14.032165
#20 33.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.4/junit-bom-5.11.4.pom (5.6 kB at 177 kB/s)
2025-Nov-07 15:43:14.158841
#20 33.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.7.1/asm-9.7.1.pom
2025-Nov-07 15:43:14.158841
#20 33.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.7.1/asm-9.7.1.pom (2.4 kB at 70 kB/s)
2025-Nov-07 15:43:14.158841
#20 33.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/thoughtworks/qdox/qdox/2.2.0/qdox-2.2.0.pom
2025-Nov-07 15:43:14.158841
#20 33.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/thoughtworks/qdox/qdox/2.2.0/qdox-2.2.0.pom (18 kB at 552 kB/s)
2025-Nov-07 15:43:14.158841
#20 33.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-api/2.15.0/plexus-compiler-api-2.15.0.pom
2025-Nov-07 15:43:14.158841
#20 33.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-api/2.15.0/plexus-compiler-api-2.15.0.pom (1.4 kB at 32 kB/s)
2025-Nov-07 15:43:14.261665
#20 33.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler/2.15.0/plexus-compiler-2.15.0.pom
2025-Nov-07 15:43:14.261665
#20 33.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler/2.15.0/plexus-compiler-2.15.0.pom (7.6 kB at 205 kB/s)
2025-Nov-07 15:43:14.261665
#20 33.29 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-manager/2.15.0/plexus-compiler-manager-2.15.0.pom
2025-Nov-07 15:43:14.261665
#20 33.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-manager/2.15.0/plexus-compiler-manager-2.15.0.pom (1.3 kB at 28 kB/s)
2025-Nov-07 15:43:14.362990
#20 33.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-javac/2.15.0/plexus-compiler-javac-2.15.0.pom
2025-Nov-07 15:43:14.362990
#20 33.39 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-javac/2.15.0/plexus-compiler-javac-2.15.0.pom (1.3 kB at 31 kB/s)
2025-Nov-07 15:43:14.362990
#20 33.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compilers/2.15.0/plexus-compilers-2.15.0.pom
2025-Nov-07 15:43:14.362990
#20 33.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compilers/2.15.0/plexus-compilers-2.15.0.pom (1.6 kB at 38 kB/s)
2025-Nov-07 15:43:14.362990
#20 33.44 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.11.0/commons-io-2.11.0.jar
2025-Nov-07 15:43:14.468874
#20 33.47 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-io/commons-io/2.11.0/commons-io-2.11.0.jar (327 kB at 9.6 MB/s)
2025-Nov-07 15:43:14.468874
#20 33.47 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-incremental/1.1/maven-shared-incremental-1.1.jar
2025-Nov-07 15:43:14.468874
#20 33.47 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-java/1.4.0/plexus-java-1.4.0.jar
2025-Nov-07 15:43:14.468874
#20 33.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.7.1/asm-9.7.1.jar
2025-Nov-07 15:43:14.468874
#20 33.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/thoughtworks/qdox/qdox/2.2.0/qdox-2.2.0.jar
2025-Nov-07 15:43:14.468874
#20 33.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-api/2.15.0/plexus-compiler-api-2.15.0.jar
2025-Nov-07 15:43:14.468874
#20 33.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/thoughtworks/qdox/qdox/2.2.0/qdox-2.2.0.jar (353 kB at 13 MB/s)
2025-Nov-07 15:43:14.468874
#20 33.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-manager/2.15.0/plexus-compiler-manager-2.15.0.jar
2025-Nov-07 15:43:14.468874
#20 33.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-incremental/1.1/maven-shared-incremental-1.1.jar (14 kB at 423 kB/s)
2025-Nov-07 15:43:14.468874
#20 33.51 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-javac/2.15.0/plexus-compiler-javac-2.15.0.jar
2025-Nov-07 15:43:14.468874
#20 33.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.7.1/asm-9.7.1.jar (126 kB at 3.7 MB/s)
2025-Nov-07 15:43:14.468874
#20 33.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-java/1.4.0/plexus-java-1.4.0.jar (57 kB at 1.5 MB/s)
2025-Nov-07 15:43:14.468874
#20 33.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-api/2.15.0/plexus-compiler-api-2.15.0.jar (29 kB at 765 kB/s)
2025-Nov-07 15:43:14.468874
#20 33.54 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-javac/2.15.0/plexus-compiler-javac-2.15.0.jar (26 kB at 443 kB/s)
2025-Nov-07 15:43:14.468874
#20 33.54 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-compiler-manager/2.15.0/plexus-compiler-manager-2.15.0.jar (5.2 kB at 79 kB/s)
2025-Nov-07 15:43:14.589887
#20 33.55 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.5.1/plexus-utils-3.5.1.pom
2025-Nov-07 15:43:14.589887
#20 33.59 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.5.1/plexus-utils-3.5.1.pom (8.8 kB at 266 kB/s)
2025-Nov-07 15:43:14.589887
#20 33.59 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/10/plexus-10.pom
2025-Nov-07 15:43:14.589887
#20 33.63 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus/10/plexus-10.pom (25 kB at 635 kB/s)
2025-Nov-07 15:43:14.589887
#20 33.64 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-filtering/3.3.1/maven-filtering-3.3.1.pom
2025-Nov-07 15:43:14.589887
#20 33.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-filtering/3.3.1/maven-filtering-3.3.1.pom (6.0 kB at 208 kB/s)
2025-Nov-07 15:43:14.692638
#20 33.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.5.0/plexus-utils-3.5.0.pom
2025-Nov-07 15:43:14.692638
#20 33.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.5.0/plexus-utils-3.5.0.pom (8.0 kB at 211 kB/s)
2025-Nov-07 15:43:14.692638
#20 33.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.12.0/commons-lang3-3.12.0.pom
2025-Nov-07 15:43:14.692638
#20 33.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.12.0/commons-lang3-3.12.0.pom (31 kB at 852 kB/s)
2025-Nov-07 15:43:14.692638
#20 33.77 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.7.1/junit-bom-5.7.1.pom
2025-Nov-07 15:43:14.821663
#20 33.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.7.1/junit-bom-5.7.1.pom (5.1 kB at 164 kB/s)
2025-Nov-07 15:43:14.821663
#20 33.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.5.1/plexus-utils-3.5.1.jar
2025-Nov-07 15:43:14.821663
#20 33.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-utils/3.5.1/plexus-utils-3.5.1.jar (269 kB at 5.3 MB/s)
2025-Nov-07 15:43:14.821663
#20 33.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-filtering/3.3.1/maven-filtering-3.3.1.jar
2025-Nov-07 15:43:14.821663
#20 33.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.12.0/commons-lang3-3.12.0.jar
2025-Nov-07 15:43:14.821663
#20 33.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-filtering/3.3.1/maven-filtering-3.3.1.jar (55 kB at 1.6 MB/s)
2025-Nov-07 15:43:14.950559
#20 33.93 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.12.0/commons-lang3-3.12.0.jar (587 kB at 8.5 MB/s)
2025-Nov-07 15:43:14.950559
#20 33.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/file-management/3.1.0/file-management-3.1.0.pom
2025-Nov-07 15:43:14.950559
#20 33.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/file-management/3.1.0/file-management-3.1.0.pom (4.5 kB at 132 kB/s)
2025-Nov-07 15:43:14.950559
#20 33.99 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/36/maven-shared-components-36.pom
2025-Nov-07 15:43:14.950559
#20 34.02 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/maven-shared-components/36/maven-shared-components-36.pom (4.9 kB at 140 kB/s)
2025-Nov-07 15:43:15.048834
#20 34.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/file-management/3.1.0/file-management-3.1.0.jar
2025-Nov-07 15:43:15.048834
#20 34.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/shared/file-management/3.1.0/file-management-3.1.0.jar (36 kB at 931 kB/s)
2025-Nov-07 15:43:15.048834
#20 34.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.9.2/plexus-archiver-4.9.2.jar
2025-Nov-07 15:43:15.048834
#20 34.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.4.2/plexus-io-3.4.2.jar
2025-Nov-07 15:43:15.048834
#20 34.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.26.1/commons-compress-1.26.1.jar
2025-Nov-07 15:43:15.048834
#20 34.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.14.0/commons-lang3-3.14.0.jar
2025-Nov-07 15:43:15.048834
#20 34.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.16.1/commons-codec-1.16.1.jar
2025-Nov-07 15:43:15.048834
#20 34.12 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-io/3.4.2/plexus-io-3.4.2.jar (79 kB at 1.9 MB/s)
2025-Nov-07 15:43:15.048834
#20 34.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/luben/zstd-jni/1.5.5-11/zstd-jni-1.5.5-11.jar
2025-Nov-07 15:43:15.048834
#20 34.12 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.16.1/commons-codec-1.16.1.jar (365 kB at 8.9 MB/s)
2025-Nov-07 15:43:15.157470
#20 34.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.14.0/commons-lang3-3.14.0.jar (658 kB at 15 MB/s)
2025-Nov-07 15:43:15.157470
#20 34.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.26.1/commons-compress-1.26.1.jar (1.1 MB at 21 MB/s)
2025-Nov-07 15:43:15.157470
#20 34.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-archiver/4.9.2/plexus-archiver-4.9.2.jar (225 kB at 3.6 MB/s)
2025-Nov-07 15:43:15.157470
#20 34.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/luben/zstd-jni/1.5.5-11/zstd-jni-1.5.5-11.jar (6.8 MB at 67 MB/s)
2025-Nov-07 15:43:15.157470
#20 34.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-api/3.5.4/surefire-api-3.5.4.pom
2025-Nov-07 15:43:15.157470
#20 34.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-api/3.5.4/surefire-api-3.5.4.pom (3.7 kB at 128 kB/s)
2025-Nov-07 15:43:15.281983
#20 34.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-logger-api/3.5.4/surefire-logger-api-3.5.4.pom
2025-Nov-07 15:43:15.281983
#20 34.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-logger-api/3.5.4/surefire-logger-api-3.5.4.pom (3.5 kB at 106 kB/s)
2025-Nov-07 15:43:15.281983
#20 34.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-shared-utils/3.5.4/surefire-shared-utils-3.5.4.pom
2025-Nov-07 15:43:15.281983
#20 34.31 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-shared-utils/3.5.4/surefire-shared-utils-3.5.4.pom (4.0 kB at 132 kB/s)
2025-Nov-07 15:43:15.281983
#20 34.32 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-extensions-api/3.5.4/surefire-extensions-api-3.5.4.pom
2025-Nov-07 15:43:15.281983
#20 34.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-extensions-api/3.5.4/surefire-extensions-api-3.5.4.pom (3.6 kB at 89 kB/s)
2025-Nov-07 15:43:15.388948
#20 34.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/maven-surefire-common/3.5.4/maven-surefire-common-3.5.4.pom
2025-Nov-07 15:43:15.388948
#20 34.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/maven-surefire-common/3.5.4/maven-surefire-common-3.5.4.pom (7.3 kB at 228 kB/s)
2025-Nov-07 15:43:15.388948
#20 34.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-booter/3.5.4/surefire-booter-3.5.4.pom
2025-Nov-07 15:43:15.388948
#20 34.46 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-booter/3.5.4/surefire-booter-3.5.4.pom (5.0 kB at 89 kB/s)
2025-Nov-07 15:43:15.514263
#20 34.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-extensions-spi/3.5.4/surefire-extensions-spi-3.5.4.pom
2025-Nov-07 15:43:15.514263
#20 34.52 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-extensions-spi/3.5.4/surefire-extensions-spi-3.5.4.pom (1.7 kB at 42 kB/s)
2025-Nov-07 15:43:15.514263
#20 34.52 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-java/1.5.0/plexus-java-1.5.0.pom
2025-Nov-07 15:43:15.514263
#20 34.55 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-java/1.5.0/plexus-java-1.5.0.pom (4.1 kB at 136 kB/s)
2025-Nov-07 15:43:15.514263
#20 34.55 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-languages/1.5.0/plexus-languages-1.5.0.pom
2025-Nov-07 15:43:15.514263
#20 34.59 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-languages/1.5.0/plexus-languages-1.5.0.pom (3.9 kB at 107 kB/s)
2025-Nov-07 15:43:15.626729
#20 34.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.8/asm-9.8.pom
2025-Nov-07 15:43:15.626729
#20 34.65 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.8/asm-9.8.pom (2.4 kB at 59 kB/s)
2025-Nov-07 15:43:15.626729
#20 34.66 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-api/3.5.4/surefire-api-3.5.4.jar
2025-Nov-07 15:43:15.626729
#20 34.70 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-api/3.5.4/surefire-api-3.5.4.jar (174 kB at 3.9 MB/s)
2025-Nov-07 15:43:15.732293
#20 34.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-logger-api/3.5.4/surefire-logger-api-3.5.4.jar
2025-Nov-07 15:43:15.732293
#20 34.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-shared-utils/3.5.4/surefire-shared-utils-3.5.4.jar
2025-Nov-07 15:43:15.732293
#20 34.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-extensions-api/3.5.4/surefire-extensions-api-3.5.4.jar
2025-Nov-07 15:43:15.732293
#20 34.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/maven-surefire-common/3.5.4/maven-surefire-common-3.5.4.jar
2025-Nov-07 15:43:15.732293
#20 34.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-booter/3.5.4/surefire-booter-3.5.4.jar
2025-Nov-07 15:43:15.732293
#20 34.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-logger-api/3.5.4/surefire-logger-api-3.5.4.jar (14 kB at 289 kB/s)
2025-Nov-07 15:43:15.732293
#20 34.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-extensions-spi/3.5.4/surefire-extensions-spi-3.5.4.jar
2025-Nov-07 15:43:15.732293
#20 34.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-extensions-api/3.5.4/surefire-extensions-api-3.5.4.jar (26 kB at 485 kB/s)
2025-Nov-07 15:43:15.732293
#20 34.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-java/1.5.0/plexus-java-1.5.0.jar
2025-Nov-07 15:43:15.732293
#20 34.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/maven-surefire-common/3.5.4/maven-surefire-common-3.5.4.jar (314 kB at 6.8 MB/s)
2025-Nov-07 15:43:15.732293
#20 34.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.8/asm-9.8.jar
2025-Nov-07 15:43:15.732293
#20 34.77 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-booter/3.5.4/surefire-booter-3.5.4.jar (119 kB at 2.2 MB/s)
2025-Nov-07 15:43:15.732293
#20 34.78 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-shared-utils/3.5.4/surefire-shared-utils-3.5.4.jar (2.9 MB at 39 MB/s)
2025-Nov-07 15:43:15.732293
#20 34.78 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/surefire/surefire-extensions-spi/3.5.4/surefire-extensions-spi-3.5.4.jar (8.2 kB at 120 kB/s)
2025-Nov-07 15:43:15.732293
#20 34.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.8/asm-9.8.jar (126 kB at 1.5 MB/s)
2025-Nov-07 15:43:15.732293
#20 34.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/codehaus/plexus/plexus-java/1.5.0/plexus-java-1.5.0.jar (57 kB at 630 kB/s)
2025-Nov-07 15:43:15.835155
#20 34.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-buildpack-platform/3.5.6/spring-boot-buildpack-platform-3.5.6.pom
2025-Nov-07 15:43:15.848010
#20 34.87 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-buildpack-platform/3.5.6/spring-boot-buildpack-platform-3.5.6.pom (3.2 kB at 71 kB/s)
2025-Nov-07 15:43:15.848010
#20 34.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.19.2/jackson-databind-2.19.2.pom
2025-Nov-07 15:43:15.848010
#20 34.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.19.2/jackson-databind-2.19.2.pom (23 kB at 552 kB/s)
2025-Nov-07 15:43:15.936234
#20 34.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-base/2.19.2/jackson-base-2.19.2.pom
2025-Nov-07 15:43:15.936234
#20 34.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-base/2.19.2/jackson-base-2.19.2.pom (12 kB at 426 kB/s)
2025-Nov-07 15:43:15.936234
#20 34.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.19.2/jackson-annotations-2.19.2.pom
2025-Nov-07 15:43:15.936234
#20 34.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.19.2/jackson-annotations-2.19.2.pom (6.9 kB at 223 kB/s)
2025-Nov-07 15:43:15.936234
#20 34.98 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-core/2.19.2/jackson-core-2.19.2.pom
2025-Nov-07 15:43:15.936234
#20 35.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-core/2.19.2/jackson-core-2.19.2.pom (9.4 kB at 294 kB/s)
2025-Nov-07 15:43:16.059698
#20 35.02 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/module/jackson-module-parameter-names/2.19.2/jackson-module-parameter-names-2.19.2.pom
2025-Nov-07 15:43:16.059698
#20 35.05 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/module/jackson-module-parameter-names/2.19.2/jackson-module-parameter-names-2.19.2.pom (4.4 kB at 132 kB/s)
2025-Nov-07 15:43:16.059698
#20 35.05 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/module/jackson-modules-java8/2.19.2/jackson-modules-java8-2.19.2.pom
2025-Nov-07 15:43:16.059698
#20 35.09 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/module/jackson-modules-java8/2.19.2/jackson-modules-java8-2.19.2.pom (3.1 kB at 85 kB/s)
2025-Nov-07 15:43:16.059698
#20 35.09 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna-platform/5.17.0/jna-platform-5.17.0.pom
2025-Nov-07 15:43:16.059698
#20 35.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna-platform/5.17.0/jna-platform-5.17.0.pom (2.3 kB at 58 kB/s)
2025-Nov-07 15:43:16.181312
#20 35.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna/5.17.0/jna-5.17.0.pom
2025-Nov-07 15:43:16.181312
#20 35.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna/5.17.0/jna-5.17.0.pom (2.0 kB at 53 kB/s)
2025-Nov-07 15:43:16.181312
#20 35.18 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.27.1/commons-compress-1.27.1.pom
2025-Nov-07 15:43:16.181312
#20 35.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.27.1/commons-compress-1.27.1.pom (23 kB at 623 kB/s)
2025-Nov-07 15:43:16.181312
#20 35.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/72/commons-parent-72.pom
2025-Nov-07 15:43:16.181312
#20 35.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/72/commons-parent-72.pom (78 kB at 2.4 MB/s)
2025-Nov-07 15:43:16.296021
#20 35.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.0-M2/junit-bom-5.11.0-M2.pom
2025-Nov-07 15:43:16.296021
#20 35.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/junit-bom/5.11.0-M2/junit-bom-5.11.0-M2.pom (5.7 kB at 154 kB/s)
2025-Nov-07 15:43:16.296021
#20 35.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.17.1/commons-codec-1.17.1.pom
2025-Nov-07 15:43:16.296021
#20 35.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.17.1/commons-codec-1.17.1.pom (18 kB at 508 kB/s)
2025-Nov-07 15:43:16.296021
#20 35.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/71/commons-parent-71.pom
2025-Nov-07 15:43:16.296021
#20 35.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-parent/71/commons-parent-71.pom (78 kB at 2.7 MB/s)
2025-Nov-07 15:43:16.423281
#20 35.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.16.0/commons-lang3-3.16.0.pom
2025-Nov-07 15:43:16.423281
#20 35.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.16.0/commons-lang3-3.16.0.pom (31 kB at 977 kB/s)
2025-Nov-07 15:43:16.423281
#20 35.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/client5/httpclient5/5.5/httpclient5-5.5.pom
2025-Nov-07 15:43:16.423281
#20 35.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/client5/httpclient5/5.5/httpclient5-5.5.pom (6.1 kB at 202 kB/s)
2025-Nov-07 15:43:16.423281
#20 35.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/client5/httpclient5-parent/5.5/httpclient5-parent-5.5.pom
2025-Nov-07 15:43:16.423281
#20 35.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/client5/httpclient5-parent/5.5/httpclient5-parent-5.5.pom (17 kB at 333 kB/s)
2025-Nov-07 15:43:16.536222
#20 35.52 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-parent/14/httpcomponents-parent-14.pom
2025-Nov-07 15:43:16.536222
#20 35.57 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-parent/14/httpcomponents-parent-14.pom (30 kB at 660 kB/s)
2025-Nov-07 15:43:16.536222
#20 35.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/apache/27/apache-27.pom
2025-Nov-07 15:43:16.536222
#20 35.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/apache/27/apache-27.pom (20 kB at 536 kB/s)
2025-Nov-07 15:43:16.647980
#20 35.62 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5/5.3.4/httpcore5-5.3.4.pom
2025-Nov-07 15:43:16.647980
#20 35.65 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5/5.3.4/httpcore5-5.3.4.pom (3.9 kB at 136 kB/s)
2025-Nov-07 15:43:16.647980
#20 35.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5-parent/5.3.4/httpcore5-parent-5.3.4.pom
2025-Nov-07 15:43:16.647980
#20 35.68 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5-parent/5.3.4/httpcore5-parent-5.3.4.pom (14 kB at 450 kB/s)
2025-Nov-07 15:43:16.647980
#20 35.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-parent/13/httpcomponents-parent-13.pom
2025-Nov-07 15:43:16.647980
#20 35.72 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpcomponents-parent/13/httpcomponents-parent-13.pom (30 kB at 889 kB/s)
2025-Nov-07 15:43:16.763820
#20 35.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5-h2/5.3.4/httpcore5-h2-5.3.4.pom
2025-Nov-07 15:43:16.763820
#20 35.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5-h2/5.3.4/httpcore5-h2-5.3.4.pom (3.6 kB at 121 kB/s)
2025-Nov-07 15:43:16.763820
#20 35.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-core/6.2.11/spring-core-6.2.11.pom
2025-Nov-07 15:43:16.763820
#20 35.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-core/6.2.11/spring-core-6.2.11.pom (2.0 kB at 60 kB/s)
2025-Nov-07 15:43:16.763820
#20 35.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-jcl/6.2.11/spring-jcl-6.2.11.pom
2025-Nov-07 15:43:16.763820
#20 35.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-jcl/6.2.11/spring-jcl-6.2.11.pom (1.8 kB at 53 kB/s)
2025-Nov-07 15:43:16.887117
#20 35.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/tomlj/tomlj/1.0.0/tomlj-1.0.0.pom
2025-Nov-07 15:43:16.887117
#20 35.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/tomlj/tomlj/1.0.0/tomlj-1.0.0.pom (2.8 kB at 74 kB/s)
2025-Nov-07 15:43:16.887117
#20 35.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-runtime/4.7.2/antlr4-runtime-4.7.2.pom
2025-Nov-07 15:43:16.887117
#20 35.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-runtime/4.7.2/antlr4-runtime-4.7.2.pom (3.6 kB at 54 kB/s)
2025-Nov-07 15:43:17.111056
#20 35.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-master/4.7.2/antlr4-master-4.7.2.pom
2025-Nov-07 15:43:17.111056
#20 35.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-master/4.7.2/antlr4-master-4.7.2.pom (4.4 kB at 133 kB/s)
2025-Nov-07 15:43:17.111056
#20 36.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/code/findbugs/jsr305/3.0.2/jsr305-3.0.2.pom
2025-Nov-07 15:43:17.111056
#20 36.03 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/code/findbugs/jsr305/3.0.2/jsr305-3.0.2.pom (4.3 kB at 134 kB/s)
2025-Nov-07 15:43:17.111056
#20 36.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-loader-tools/3.5.6/spring-boot-loader-tools-3.5.6.pom
2025-Nov-07 15:43:17.134862
#20 36.21 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-loader-tools/3.5.6/spring-boot-loader-tools-3.5.6.pom (2.2 kB at 13 kB/s)
2025-Nov-07 15:43:17.255571
#20 36.21 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-context/6.2.11/spring-context-6.2.11.pom
2025-Nov-07 15:43:17.255571
#20 36.24 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-context/6.2.11/spring-context-6.2.11.pom (2.8 kB at 82 kB/s)
2025-Nov-07 15:43:17.255571
#20 36.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-aop/6.2.11/spring-aop-6.2.11.pom
2025-Nov-07 15:43:17.255571
#20 36.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-aop/6.2.11/spring-aop-6.2.11.pom (2.2 kB at 63 kB/s)
2025-Nov-07 15:43:17.255571
#20 36.29 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-beans/6.2.11/spring-beans-6.2.11.pom
2025-Nov-07 15:43:17.255571
#20 36.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-beans/6.2.11/spring-beans-6.2.11.pom (2.0 kB at 56 kB/s)
2025-Nov-07 15:43:17.388195
#20 36.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-expression/6.2.11/spring-expression-6.2.11.pom
2025-Nov-07 15:43:17.388195
#20 36.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-expression/6.2.11/spring-expression-6.2.11.pom (2.1 kB at 61 kB/s)
2025-Nov-07 15:43:17.388195
#20 36.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-observation/1.14.11/micrometer-observation-1.14.11.pom
2025-Nov-07 15:43:17.388195
#20 36.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-observation/1.14.11/micrometer-observation-1.14.11.pom (3.8 kB at 104 kB/s)
2025-Nov-07 15:43:17.388195
#20 36.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-commons/1.14.11/micrometer-commons-1.14.11.pom
2025-Nov-07 15:43:17.388195
#20 36.46 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-commons/1.14.11/micrometer-commons-1.14.11.pom (3.4 kB at 88 kB/s)
2025-Nov-07 15:43:17.499751
#20 36.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-shade-plugin/3.6.0/maven-shade-plugin-3.6.0.pom
2025-Nov-07 15:43:17.499751
#20 36.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-shade-plugin/3.6.0/maven-shade-plugin-3.6.0.pom (12 kB at 323 kB/s)
2025-Nov-07 15:43:17.499751
#20 36.51 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm-commons/9.7/asm-commons-9.7.pom
2025-Nov-07 15:43:17.499751
#20 36.54 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm-commons/9.7/asm-commons-9.7.pom (2.8 kB at 93 kB/s)
2025-Nov-07 15:43:17.499751
#20 36.55 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm-tree/9.7/asm-tree-9.7.pom
2025-Nov-07 15:43:17.499751
#20 36.58 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm-tree/9.7/asm-tree-9.7.pom (2.6 kB at 84 kB/s)
2025-Nov-07 15:43:17.633247
#20 36.58 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jdom/jdom2/2.0.6.1/jdom2-2.0.6.1.pom
2025-Nov-07 15:43:17.633247
#20 36.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jdom/jdom2/2.0.6.1/jdom2-2.0.6.1.pom (4.6 kB at 159 kB/s)
2025-Nov-07 15:43:17.633247
#20 36.62 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/vafer/jdependency/2.10/jdependency-2.10.pom
2025-Nov-07 15:43:17.633247
#20 36.65 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/vafer/jdependency/2.10/jdependency-2.10.pom (14 kB at 453 kB/s)
2025-Nov-07 15:43:17.633247
#20 36.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-buildpack-platform/3.5.6/spring-boot-buildpack-platform-3.5.6.jar
2025-Nov-07 15:43:17.633247
#20 36.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-buildpack-platform/3.5.6/spring-boot-buildpack-platform-3.5.6.jar (319 kB at 8.9 MB/s)
2025-Nov-07 15:43:17.633247
#20 36.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.19.2/jackson-databind-2.19.2.jar
2025-Nov-07 15:43:17.733928
#20 36.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.19.2/jackson-annotations-2.19.2.jar
2025-Nov-07 15:43:17.733928
#20 36.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-core/2.19.2/jackson-core-2.19.2.jar
2025-Nov-07 15:43:17.733928
#20 36.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/module/jackson-module-parameter-names/2.19.2/jackson-module-parameter-names-2.19.2.jar
2025-Nov-07 15:43:17.733928
#20 36.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna-platform/5.17.0/jna-platform-5.17.0.jar
2025-Nov-07 15:43:17.733928
#20 36.74 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/module/jackson-module-parameter-names/2.19.2/jackson-module-parameter-names-2.19.2.jar (10 kB at 315 kB/s)
2025-Nov-07 15:43:17.733928
#20 36.74 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna/5.17.0/jna-5.17.0.jar
2025-Nov-07 15:43:17.733928
#20 36.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-core/2.19.2/jackson-core-2.19.2.jar (591 kB at 16 MB/s)
2025-Nov-07 15:43:17.733928
#20 36.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.27.1/commons-compress-1.27.1.jar
2025-Nov-07 15:43:17.733928
#20 36.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.19.2/jackson-databind-2.19.2.jar (1.7 MB at 37 MB/s)
2025-Nov-07 15:43:17.733928
#20 36.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.19.2/jackson-annotations-2.19.2.jar (79 kB at 1.9 MB/s)
2025-Nov-07 15:43:17.733928
#20 36.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.17.1/commons-codec-1.17.1.jar
2025-Nov-07 15:43:17.733928
#20 36.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.16.0/commons-lang3-3.16.0.jar
2025-Nov-07 15:43:17.733928
#20 36.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna-platform/5.17.0/jna-platform-5.17.0.jar (1.4 MB at 29 MB/s)
2025-Nov-07 15:43:17.733928
#20 36.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/client5/httpclient5/5.5/httpclient5-5.5.jar
2025-Nov-07 15:43:17.733928
#20 36.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-lang3/3.16.0/commons-lang3-3.16.0.jar (674 kB at 8.1 MB/s)
2025-Nov-07 15:43:17.733928
#20 36.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/commons-codec/commons-codec/1.17.1/commons-codec-1.17.1.jar (373 kB at 4.0 MB/s)
2025-Nov-07 15:43:17.733928
#20 36.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/client5/httpclient5/5.5/httpclient5-5.5.jar (955 kB at 11 MB/s)
2025-Nov-07 15:43:17.733928
#20 36.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5-h2/5.3.4/httpcore5-h2-5.3.4.jar
2025-Nov-07 15:43:17.838991
#20 36.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5/5.3.4/httpcore5-5.3.4.jar
2025-Nov-07 15:43:17.838991
#20 36.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/tomlj/tomlj/1.0.0/tomlj-1.0.0.jar
2025-Nov-07 15:43:17.838991
#20 36.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.27.1/commons-compress-1.27.1.jar (1.1 MB at 9.4 MB/s)
2025-Nov-07 15:43:17.838991
#20 36.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-runtime/4.7.2/antlr4-runtime-4.7.2.jar
2025-Nov-07 15:43:17.838991
#20 36.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna/5.17.0/jna-5.17.0.jar (2.0 MB at 17 MB/s)
2025-Nov-07 15:43:17.838991
#20 36.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/code/findbugs/jsr305/3.0.2/jsr305-3.0.2.jar
2025-Nov-07 15:43:17.838991
#20 36.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5/5.3.4/httpcore5-5.3.4.jar (909 kB at 6.5 MB/s)
2025-Nov-07 15:43:17.838991
#20 36.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-loader-tools/3.5.6/spring-boot-loader-tools-3.5.6.jar
2025-Nov-07 15:43:17.838991
#20 36.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/tomlj/tomlj/1.0.0/tomlj-1.0.0.jar (157 kB at 1.1 MB/s)
2025-Nov-07 15:43:17.838991
#20 36.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-core/6.2.11/spring-core-6.2.11.jar
2025-Nov-07 15:43:17.838991
#20 36.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/httpcomponents/core5/httpcore5-h2/5.3.4/httpcore5-h2-5.3.4.jar (242 kB at 1.6 MB/s)
2025-Nov-07 15:43:17.838991
#20 36.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-jcl/6.2.11/spring-jcl-6.2.11.jar
2025-Nov-07 15:43:17.838991
#20 36.87 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-runtime/4.7.2/antlr4-runtime-4.7.2.jar (338 kB at 2.1 MB/s)
2025-Nov-07 15:43:17.838991
#20 36.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-context/6.2.11/spring-context-6.2.11.jar
2025-Nov-07 15:43:17.838991
#20 36.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/code/findbugs/jsr305/3.0.2/jsr305-3.0.2.jar (20 kB at 117 kB/s)
2025-Nov-07 15:43:17.838991
#20 36.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-aop/6.2.11/spring-aop-6.2.11.jar
2025-Nov-07 15:43:17.838991
#20 36.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-loader-tools/3.5.6/spring-boot-loader-tools-3.5.6.jar (464 kB at 2.7 MB/s)
2025-Nov-07 15:43:17.838991
#20 36.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-beans/6.2.11/spring-beans-6.2.11.jar
2025-Nov-07 15:43:17.838991
#20 36.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-jcl/6.2.11/spring-jcl-6.2.11.jar (25 kB at 139 kB/s)
2025-Nov-07 15:43:17.838991
#20 36.89 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-expression/6.2.11/spring-expression-6.2.11.jar
2025-Nov-07 15:43:17.838991
#20 36.92 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-core/6.2.11/spring-core-6.2.11.jar (2.0 MB at 9.9 MB/s)
2025-Nov-07 15:43:17.971303
#20 36.93 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-observation/1.14.11/micrometer-observation-1.14.11.jar
2025-Nov-07 15:43:17.971303
#20 36.93 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-expression/6.2.11/spring-expression-6.2.11.jar (318 kB at 1.5 MB/s)
2025-Nov-07 15:43:17.971303
#20 36.93 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-commons/1.14.11/micrometer-commons-1.14.11.jar
2025-Nov-07 15:43:17.971303
#20 36.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-aop/6.2.11/spring-aop-6.2.11.jar (420 kB at 1.8 MB/s)
2025-Nov-07 15:43:17.971303
#20 36.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-shade-plugin/3.6.0/maven-shade-plugin-3.6.0.jar
2025-Nov-07 15:43:17.971303
#20 36.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-beans/6.2.11/spring-beans-6.2.11.jar (890 kB at 3.8 MB/s)
2025-Nov-07 15:43:17.971303
#20 36.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-context/6.2.11/spring-context-6.2.11.jar (1.4 MB at 5.8 MB/s)
2025-Nov-07 15:43:17.971303
#20 36.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm-commons/9.7/asm-commons-9.7.jar
2025-Nov-07 15:43:17.971303
#20 36.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm-tree/9.7/asm-tree-9.7.jar
2025-Nov-07 15:43:17.971303
#20 36.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-observation/1.14.11/micrometer-observation-1.14.11.jar (75 kB at 306 kB/s)
2025-Nov-07 15:43:17.971303
#20 36.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jdom/jdom2/2.0.6.1/jdom2-2.0.6.1.jar
2025-Nov-07 15:43:17.971303
#20 36.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-commons/1.14.11/micrometer-commons-1.14.11.jar (48 kB at 194 kB/s)
2025-Nov-07 15:43:17.971303
#20 36.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/vafer/jdependency/2.10/jdependency-2.10.jar
2025-Nov-07 15:43:17.971303
#20 36.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-shade-plugin/3.6.0/maven-shade-plugin-3.6.0.jar (150 kB at 555 kB/s)
2025-Nov-07 15:43:17.971303
#20 36.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm-tree/9.7/asm-tree-9.7.jar (52 kB at 189 kB/s)
2025-Nov-07 15:43:17.971303
#20 36.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm-commons/9.7/asm-commons-9.7.jar (73 kB at 263 kB/s)
2025-Nov-07 15:43:17.971303
#20 37.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/vafer/jdependency/2.10/jdependency-2.10.jar (416 kB at 1.5 MB/s)
2025-Nov-07 15:43:17.971303
#20 37.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jdom/jdom2/2.0.6.1/jdom2-2.0.6.1.jar (328 kB at 1.1 MB/s)
2025-Nov-07 15:43:17.971303
#20 37.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-websocket/3.5.6/spring-boot-starter-websocket-3.5.6.pom
2025-Nov-07 15:43:18.077047
#20 37.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-websocket/3.5.6/spring-boot-starter-websocket-3.5.6.pom (2.5 kB at 74 kB/s)
2025-Nov-07 15:43:18.077047
#20 37.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-web/3.5.6/spring-boot-starter-web-3.5.6.pom
2025-Nov-07 15:43:18.077047
#20 37.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-web/3.5.6/spring-boot-starter-web-3.5.6.pom (2.9 kB at 84 kB/s)
2025-Nov-07 15:43:18.077047
#20 37.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter/3.5.6/spring-boot-starter-3.5.6.pom
2025-Nov-07 15:43:18.077047
#20 37.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter/3.5.6/spring-boot-starter-3.5.6.pom (3.0 kB at 87 kB/s)
2025-Nov-07 15:43:18.182257
#20 37.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot/3.5.6/spring-boot-3.5.6.pom
2025-Nov-07 15:43:18.182257
#20 37.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot/3.5.6/spring-boot-3.5.6.pom (2.2 kB at 73 kB/s)
2025-Nov-07 15:43:18.182257
#20 37.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-autoconfigure/3.5.6/spring-boot-autoconfigure-3.5.6.pom
2025-Nov-07 15:43:18.182257
#20 37.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-autoconfigure/3.5.6/spring-boot-autoconfigure-3.5.6.pom (2.1 kB at 66 kB/s)
2025-Nov-07 15:43:18.182257
#20 37.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-logging/3.5.6/spring-boot-starter-logging-3.5.6.pom
2025-Nov-07 15:43:18.182257
#20 37.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-logging/3.5.6/spring-boot-starter-logging-3.5.6.pom (2.5 kB at 82 kB/s)
2025-Nov-07 15:43:18.182257
#20 37.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-classic/1.5.18/logback-classic-1.5.18.pom
2025-Nov-07 15:43:18.284450
#20 37.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-classic/1.5.18/logback-classic-1.5.18.pom (13 kB at 272 kB/s)
2025-Nov-07 15:43:18.284450
#20 37.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-parent/1.5.18/logback-parent-1.5.18.pom
2025-Nov-07 15:43:18.284450
#20 37.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-parent/1.5.18/logback-parent-1.5.18.pom (19 kB at 601 kB/s)
2025-Nov-07 15:43:18.284450
#20 37.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-core/1.5.18/logback-core-1.5.18.pom
2025-Nov-07 15:43:18.403855
#20 37.39 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-core/1.5.18/logback-core-1.5.18.pom (9.1 kB at 267 kB/s)
2025-Nov-07 15:43:18.403855
#20 37.40 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.17/slf4j-api-2.0.17.pom
2025-Nov-07 15:43:18.403855
#20 37.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.17/slf4j-api-2.0.17.pom (2.8 kB at 52 kB/s)
2025-Nov-07 15:43:18.403855
#20 37.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/2.0.17/slf4j-parent-2.0.17.pom
2025-Nov-07 15:43:18.403855
#20 37.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/2.0.17/slf4j-parent-2.0.17.pom (13 kB at 514 kB/s)
2025-Nov-07 15:43:18.515174
#20 37.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-bom/2.0.17/slf4j-bom-2.0.17.pom
2025-Nov-07 15:43:18.515174
#20 37.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-bom/2.0.17/slf4j-bom-2.0.17.pom (7.3 kB at 271 kB/s)
2025-Nov-07 15:43:18.515174
#20 37.51 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-to-slf4j/2.24.3/log4j-to-slf4j-2.24.3.pom
2025-Nov-07 15:43:18.515174
#20 37.54 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-to-slf4j/2.24.3/log4j-to-slf4j-2.24.3.pom (5.0 kB at 153 kB/s)
2025-Nov-07 15:43:18.515174
#20 37.55 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j/2.24.3/log4j-2.24.3.pom
2025-Nov-07 15:43:18.515174
#20 37.59 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j/2.24.3/log4j-2.24.3.pom (35 kB at 855 kB/s)
2025-Nov-07 15:43:18.629425
#20 37.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/groovy/groovy-bom/4.0.22/groovy-bom-4.0.22.pom
2025-Nov-07 15:43:18.629425
#20 37.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/groovy/groovy-bom/4.0.22/groovy-bom-4.0.22.pom (27 kB at 852 kB/s)
2025-Nov-07 15:43:18.629425
#20 37.64 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-bom/2.17.2/jackson-bom-2.17.2.pom
2025-Nov-07 15:43:18.629425
#20 37.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-bom/2.17.2/jackson-bom-2.17.2.pom (19 kB at 645 kB/s)
2025-Nov-07 15:43:18.629425
#20 37.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-parent/2.17/jackson-parent-2.17.pom
2025-Nov-07 15:43:18.629425
#20 37.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-parent/2.17/jackson-parent-2.17.pom (6.5 kB at 217 kB/s)
2025-Nov-07 15:43:18.751966
#20 37.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/58/oss-parent-58.pom
2025-Nov-07 15:43:18.751966
#20 37.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/58/oss-parent-58.pom (24 kB at 623 kB/s)
2025-Nov-07 15:43:18.751966
#20 37.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/platform/jakarta.jakartaee-bom/9.1.0/jakarta.jakartaee-bom-9.1.0.pom
2025-Nov-07 15:43:18.751966
#20 37.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/platform/jakarta.jakartaee-bom/9.1.0/jakarta.jakartaee-bom-9.1.0.pom (9.6 kB at 265 kB/s)
2025-Nov-07 15:43:18.751966
#20 37.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/platform/jakartaee-api-parent/9.1.0/jakartaee-api-parent-9.1.0.pom
2025-Nov-07 15:43:18.751966
#20 37.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/platform/jakartaee-api-parent/9.1.0/jakartaee-api-parent-9.1.0.pom (15 kB at 464 kB/s)
2025-Nov-07 15:43:18.853809
#20 37.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/ee4j/project/1.0.7/project-1.0.7.pom
2025-Nov-07 15:43:18.853809
#20 37.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/ee4j/project/1.0.7/project-1.0.7.pom (14 kB at 302 kB/s)
2025-Nov-07 15:43:18.853809
#20 37.89 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-bom/4.11.0/mockito-bom-4.11.0.pom
2025-Nov-07 15:43:18.853809
#20 37.92 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-bom/4.11.0/mockito-bom-4.11.0.pom (3.2 kB at 88 kB/s)
2025-Nov-07 15:43:18.853809
#20 37.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-framework-bom/5.3.39/spring-framework-bom-5.3.39.pom
2025-Nov-07 15:43:18.957550
#20 37.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-framework-bom/5.3.39/spring-framework-bom-5.3.39.pom (5.7 kB at 177 kB/s)
2025-Nov-07 15:43:18.957550
#20 37.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-api/2.24.3/log4j-api-2.24.3.pom
2025-Nov-07 15:43:18.957550
#20 38.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-api/2.24.3/log4j-api-2.24.3.pom (4.4 kB at 122 kB/s)
2025-Nov-07 15:43:18.957550
#20 38.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.16/slf4j-api-2.0.16.pom
2025-Nov-07 15:43:18.957550
#20 38.03 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.16/slf4j-api-2.0.16.pom (2.8 kB at 97 kB/s)
2025-Nov-07 15:43:19.071220
#20 38.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/2.0.16/slf4j-parent-2.0.16.pom
2025-Nov-07 15:43:19.071220
#20 38.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/2.0.16/slf4j-parent-2.0.16.pom (13 kB at 284 kB/s)
2025-Nov-07 15:43:19.071220
#20 38.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-bom/2.0.16/slf4j-bom-2.0.16.pom
2025-Nov-07 15:43:19.071220
#20 38.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-bom/2.0.16/slf4j-bom-2.0.16.pom (7.3 kB at 293 kB/s)
2025-Nov-07 15:43:19.071220
#20 38.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/jul-to-slf4j/2.0.17/jul-to-slf4j-2.0.17.pom
2025-Nov-07 15:43:19.071220
#20 38.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/jul-to-slf4j/2.0.17/jul-to-slf4j-2.0.17.pom (1.1 kB at 31 kB/s)
2025-Nov-07 15:43:19.183017
#20 38.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.pom
2025-Nov-07 15:43:19.183017
#20 38.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.pom (16 kB at 510 kB/s)
2025-Nov-07 15:43:19.183017
#20 38.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/yaml/snakeyaml/2.4/snakeyaml-2.4.pom
2025-Nov-07 15:43:19.183017
#20 38.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/yaml/snakeyaml/2.4/snakeyaml-2.4.pom (22 kB at 616 kB/s)
2025-Nov-07 15:43:19.183017
#20 38.23 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-json/3.5.6/spring-boot-starter-json-3.5.6.pom
2025-Nov-07 15:43:19.183017
#20 38.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-json/3.5.6/spring-boot-starter-json-3.5.6.pom (3.1 kB at 96 kB/s)
2025-Nov-07 15:43:19.295437
#20 38.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-web/6.2.11/spring-web-6.2.11.pom
2025-Nov-07 15:43:19.295437
#20 38.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-web/6.2.11/spring-web-6.2.11.pom (2.4 kB at 69 kB/s)
2025-Nov-07 15:43:19.295437
#20 38.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.19.2/jackson-datatype-jdk8-2.19.2.pom
2025-Nov-07 15:43:19.295437
#20 38.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.19.2/jackson-datatype-jdk8-2.19.2.pom (2.8 kB at 71 kB/s)
2025-Nov-07 15:43:19.295437
#20 38.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.19.2/jackson-datatype-jsr310-2.19.2.pom
2025-Nov-07 15:43:19.295437
#20 38.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.19.2/jackson-datatype-jsr310-2.19.2.pom (5.4 kB at 163 kB/s)
2025-Nov-07 15:43:19.423959
#20 38.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-tomcat/3.5.6/spring-boot-starter-tomcat-3.5.6.pom
2025-Nov-07 15:43:19.423959
#20 38.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-tomcat/3.5.6/spring-boot-starter-tomcat-3.5.6.pom (3.1 kB at 112 kB/s)
2025-Nov-07 15:43:19.423959
#20 38.40 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-core/10.1.46/tomcat-embed-core-10.1.46.pom
2025-Nov-07 15:43:19.423959
#20 38.44 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-core/10.1.46/tomcat-embed-core-10.1.46.pom (1.7 kB at 53 kB/s)
2025-Nov-07 15:43:19.423959
#20 38.44 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-el/10.1.46/tomcat-embed-el-10.1.46.pom
2025-Nov-07 15:43:19.423959
#20 38.47 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-el/10.1.46/tomcat-embed-el-10.1.46.pom (1.5 kB at 60 kB/s)
2025-Nov-07 15:43:19.423959
#20 38.47 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.46/tomcat-embed-websocket-10.1.46.pom
2025-Nov-07 15:43:19.423959
#20 38.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.46/tomcat-embed-websocket-10.1.46.pom (1.7 kB at 56 kB/s)
2025-Nov-07 15:43:19.528436
#20 38.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-webmvc/6.2.11/spring-webmvc-6.2.11.pom
2025-Nov-07 15:43:19.528436
#20 38.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-webmvc/6.2.11/spring-webmvc-6.2.11.pom (3.0 kB at 110 kB/s)
2025-Nov-07 15:43:19.528436
#20 38.53 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-messaging/6.2.11/spring-messaging-6.2.11.pom
2025-Nov-07 15:43:19.528436
#20 38.56 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-messaging/6.2.11/spring-messaging-6.2.11.pom (2.2 kB at 70 kB/s)
2025-Nov-07 15:43:19.528436
#20 38.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-websocket/6.2.11/spring-websocket-6.2.11.pom
2025-Nov-07 15:43:19.528436
#20 38.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-websocket/6.2.11/spring-websocket-6.2.11.pom (2.4 kB at 67 kB/s)
2025-Nov-07 15:43:19.630838
2025-Nov-07 15:43:19.648662
#20 38.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-websocket/3.5.6/spring-boot-starter-websocket-3.5.6.jar
2025-Nov-07 15:43:19.648662
#20 38.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-websocket/3.5.6/spring-boot-starter-websocket-3.5.6.jar (4.8 kB at 165 kB/s)
2025-Nov-07 15:43:19.648662
#20 38.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-web/3.5.6/spring-boot-starter-web-3.5.6.jar
2025-Nov-07 15:43:19.648662
#20 38.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter/3.5.6/spring-boot-starter-3.5.6.jar
2025-Nov-07 15:43:19.648662
#20 38.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot/3.5.6/spring-boot-3.5.6.jar
2025-Nov-07 15:43:19.648662
#20 38.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-autoconfigure/3.5.6/spring-boot-autoconfigure-3.5.6.jar
2025-Nov-07 15:43:19.648662
#20 38.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-logging/3.5.6/spring-boot-starter-logging-3.5.6.jar
2025-Nov-07 15:43:19.648662
#20 38.68 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-web/3.5.6/spring-boot-starter-web-3.5.6.jar (4.8 kB at 123 kB/s)
2025-Nov-07 15:43:19.648662
#20 38.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-classic/1.5.18/logback-classic-1.5.18.jar
2025-Nov-07 15:43:19.648662
#20 38.69 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-logging/3.5.6/spring-boot-starter-logging-3.5.6.jar (4.8 kB at 125 kB/s)
2025-Nov-07 15:43:19.648662
#20 38.69 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter/3.5.6/spring-boot-starter-3.5.6.jar (4.8 kB at 111 kB/s)
2025-Nov-07 15:43:19.648662
#20 38.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-core/1.5.18/logback-core-1.5.18.jar
2025-Nov-07 15:43:19.648662
#20 38.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.17/slf4j-api-2.0.17.jar
2025-Nov-07 15:43:19.648662
#20 38.69 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-autoconfigure/3.5.6/spring-boot-autoconfigure-3.5.6.jar (2.1 MB at 47 MB/s)
2025-Nov-07 15:43:19.648662
#20 38.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-to-slf4j/2.24.3/log4j-to-slf4j-2.24.3.jar
2025-Nov-07 15:43:19.648662
#20 38.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot/3.5.6/spring-boot-3.5.6.jar (1.9 MB at 32 MB/s)
2025-Nov-07 15:43:19.648662
#20 38.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-api/2.24.3/log4j-api-2.24.3.jar
2025-Nov-07 15:43:19.739414
#20 38.72 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.17/slf4j-api-2.0.17.jar (70 kB at 1.0 MB/s)
2025-Nov-07 15:43:19.739414
#20 38.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/jul-to-slf4j/2.0.17/jul-to-slf4j-2.0.17.jar
2025-Nov-07 15:43:19.739414
#20 38.73 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-to-slf4j/2.24.3/log4j-to-slf4j-2.24.3.jar (24 kB at 326 kB/s)
2025-Nov-07 15:43:19.739414
#20 38.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar
2025-Nov-07 15:43:19.739414
#20 38.73 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-classic/1.5.18/logback-classic-1.5.18.jar (307 kB at 4.0 MB/s)
2025-Nov-07 15:43:19.739414
#20 38.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/yaml/snakeyaml/2.4/snakeyaml-2.4.jar
2025-Nov-07 15:43:19.739414
#20 38.73 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/ch/qos/logback/logback-core/1.5.18/logback-core-1.5.18.jar (627 kB at 8.0 MB/s)
2025-Nov-07 15:43:19.739414
#20 38.73 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-json/3.5.6/spring-boot-starter-json-3.5.6.jar
2025-Nov-07 15:43:19.739414
#20 38.74 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/logging/log4j/log4j-api/2.24.3/log4j-api-2.24.3.jar (349 kB at 4.3 MB/s)
2025-Nov-07 15:43:19.739414
#20 38.74 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.19.2/jackson-datatype-jdk8-2.19.2.jar
2025-Nov-07 15:43:19.739414
#20 38.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar (26 kB at 261 kB/s)
2025-Nov-07 15:43:19.739414
#20 38.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/jul-to-slf4j/2.0.17/jul-to-slf4j-2.0.17.jar (6.3 kB at 62 kB/s)
2025-Nov-07 15:43:19.739414
#20 38.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.19.2/jackson-datatype-jsr310-2.19.2.jar
2025-Nov-07 15:43:19.739414
#20 38.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-tomcat/3.5.6/spring-boot-starter-tomcat-3.5.6.jar
2025-Nov-07 15:43:19.739414
#20 38.77 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/yaml/snakeyaml/2.4/snakeyaml-2.4.jar (340 kB at 2.9 MB/s)
2025-Nov-07 15:43:19.739414
#20 38.77 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-core/10.1.46/tomcat-embed-core-10.1.46.jar
2025-Nov-07 15:43:19.739414
#20 38.77 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.19.2/jackson-datatype-jdk8-2.19.2.jar (36 kB at 307 kB/s)
2025-Nov-07 15:43:19.739414
#20 38.78 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-el/10.1.46/tomcat-embed-el-10.1.46.jar
2025-Nov-07 15:43:19.739414
#20 38.78 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-json/3.5.6/spring-boot-starter-json-3.5.6.jar (4.7 kB at 39 kB/s)
2025-Nov-07 15:43:19.739414
#20 38.78 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.46/tomcat-embed-websocket-10.1.46.jar
2025-Nov-07 15:43:19.739414
#20 38.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-tomcat/3.5.6/spring-boot-starter-tomcat-3.5.6.jar (4.8 kB at 35 kB/s)
2025-Nov-07 15:43:19.739414
#20 38.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-web/6.2.11/spring-web-6.2.11.jar
2025-Nov-07 15:43:19.739414
#20 38.82 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.19.2/jackson-datatype-jsr310-2.19.2.jar (137 kB at 856 kB/s)
2025-Nov-07 15:43:19.884216
#20 38.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-webmvc/6.2.11/spring-webmvc-6.2.11.jar
2025-Nov-07 15:43:19.884216
#20 38.82 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-el/10.1.46/tomcat-embed-el-10.1.46.jar (264 kB at 1.6 MB/s)
2025-Nov-07 15:43:19.884216
#20 38.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-messaging/6.2.11/spring-messaging-6.2.11.jar
2025-Nov-07 15:43:19.884216
#20 38.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.46/tomcat-embed-websocket-10.1.46.jar (284 kB at 1.6 MB/s)
2025-Nov-07 15:43:19.884216
#20 38.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-websocket/6.2.11/spring-websocket-6.2.11.jar
2025-Nov-07 15:43:19.884216
#20 38.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-web/6.2.11/spring-web-6.2.11.jar (2.1 MB at 10 MB/s)
2025-Nov-07 15:43:19.884216
#20 38.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-webmvc/6.2.11/spring-webmvc-6.2.11.jar (1.1 MB at 4.9 MB/s)
2025-Nov-07 15:43:19.884216
#20 38.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apache/tomcat/embed/tomcat-embed-core/10.1.46/tomcat-embed-core-10.1.46.jar (3.6 MB at 16 MB/s)
2025-Nov-07 15:43:19.884216
#20 38.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-messaging/6.2.11/spring-messaging-6.2.11.jar (619 kB at 2.7 MB/s)
2025-Nov-07 15:43:19.884216
#20 38.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-websocket/6.2.11/spring-websocket-6.2.11.jar (444 kB at 1.9 MB/s)
2025-Nov-07 15:43:19.884216
#20 38.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-data-jpa/3.5.6/spring-boot-starter-data-jpa-3.5.6.pom
2025-Nov-07 15:43:19.884216
#20 38.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-data-jpa/3.5.6/spring-boot-starter-data-jpa-3.5.6.pom (2.9 kB at 64 kB/s)
2025-Nov-07 15:43:19.981453
#20 38.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-jdbc/3.5.6/spring-boot-starter-jdbc-3.5.6.pom
2025-Nov-07 15:43:19.981453
#20 39.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-jdbc/3.5.6/spring-boot-starter-jdbc-3.5.6.pom (2.5 kB at 47 kB/s)
2025-Nov-07 15:43:19.981453
#20 39.02 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/zaxxer/HikariCP/6.3.3/HikariCP-6.3.3.pom
2025-Nov-07 15:43:19.981453
#20 39.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/zaxxer/HikariCP/6.3.3/HikariCP-6.3.3.pom (29 kB at 752 kB/s)
2025-Nov-07 15:43:20.094025
#20 39.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-jdbc/6.2.11/spring-jdbc-6.2.11.pom
2025-Nov-07 15:43:20.094025
#20 39.09 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-jdbc/6.2.11/spring-jdbc-6.2.11.pom (2.4 kB at 73 kB/s)
2025-Nov-07 15:43:20.094025
#20 39.10 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-tx/6.2.11/spring-tx-6.2.11.pom
2025-Nov-07 15:43:20.094025
#20 39.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-tx/6.2.11/spring-tx-6.2.11.pom (2.2 kB at 67 kB/s)
2025-Nov-07 15:43:20.094025
#20 39.13 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hibernate/orm/hibernate-core/6.6.29.Final/hibernate-core-6.6.29.Final.pom
2025-Nov-07 15:43:20.094025
#20 39.17 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hibernate/orm/hibernate-core/6.6.29.Final/hibernate-core-6.6.29.Final.pom (5.8 kB at 169 kB/s)
2025-Nov-07 15:43:20.191986
#20 39.17 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.pom
2025-Nov-07 15:43:20.191986
#20 39.21 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.pom (16 kB at 370 kB/s)
2025-Nov-07 15:43:20.191986
#20 39.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.pom
2025-Nov-07 15:43:20.191986
#20 39.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.pom (14 kB at 296 kB/s)
2025-Nov-07 15:43:20.191986
#20 39.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/ee4j/project/1.0.6/project-1.0.6.pom
2025-Nov-07 15:43:20.304178
#20 39.31 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/ee4j/project/1.0.6/project-1.0.6.pom (13 kB at 351 kB/s)
2025-Nov-07 15:43:20.304178
#20 39.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.5.0.Final/jboss-logging-3.5.0.Final.pom
2025-Nov-07 15:43:20.304178
#20 39.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.5.0.Final/jboss-logging-3.5.0.Final.pom (18 kB at 502 kB/s)
2025-Nov-07 15:43:20.304178
#20 39.35 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/jboss-parent/39/jboss-parent-39.pom
2025-Nov-07 15:43:20.304178
#20 39.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/jboss-parent/39/jboss-parent-39.pom (68 kB at 2.2 MB/s)
2025-Nov-07 15:43:20.419087
#20 39.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hibernate/common/hibernate-commons-annotations/7.0.3.Final/hibernate-commons-annotations-7.0.3.Final.pom
2025-Nov-07 15:43:20.419087
#20 39.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hibernate/common/hibernate-commons-annotations/7.0.3.Final/hibernate-commons-annotations-7.0.3.Final.pom (2.0 kB at 58 kB/s)
2025-Nov-07 15:43:20.419087
#20 39.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/smallrye/jandex/3.2.0/jandex-3.2.0.pom
2025-Nov-07 15:43:20.419087
#20 39.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/smallrye/jandex/3.2.0/jandex-3.2.0.pom (7.0 kB at 225 kB/s)
2025-Nov-07 15:43:20.419087
#20 39.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/smallrye/jandex-parent/3.2.0/jandex-parent-3.2.0.pom
2025-Nov-07 15:43:20.419087
#20 39.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/smallrye/jandex-parent/3.2.0/jandex-parent-3.2.0.pom (7.2 kB at 190 kB/s)
2025-Nov-07 15:43:20.536873
#20 39.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/smallrye/smallrye-build-parent/42/smallrye-build-parent-42.pom
2025-Nov-07 15:43:20.536873
#20 39.54 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/smallrye/smallrye-build-parent/42/smallrye-build-parent-42.pom (39 kB at 1.0 MB/s)
2025-Nov-07 15:43:20.536873
#20 39.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/classmate/1.5.1/classmate-1.5.1.pom
2025-Nov-07 15:43:20.536873
#20 39.58 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/classmate/1.5.1/classmate-1.5.1.pom (7.3 kB at 208 kB/s)
2025-Nov-07 15:43:20.536873
#20 39.58 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/35/oss-parent-35.pom
2025-Nov-07 15:43:20.536873
#20 39.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/35/oss-parent-35.pom (23 kB at 691 kB/s)
2025-Nov-07 15:43:20.640020
#20 39.62 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy/1.15.11/byte-buddy-1.15.11.pom
2025-Nov-07 15:43:20.640020
#20 39.66 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy/1.15.11/byte-buddy-1.15.11.pom (17 kB at 413 kB/s)
2025-Nov-07 15:43:20.640020
#20 39.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-parent/1.15.11/byte-buddy-parent-1.15.11.pom
2025-Nov-07 15:43:20.640020
#20 39.70 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-parent/1.15.11/byte-buddy-parent-1.15.11.pom (63 kB at 2.0 MB/s)
2025-Nov-07 15:43:20.640020
#20 39.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/4.0.0/jakarta.xml.bind-api-4.0.0.pom
2025-Nov-07 15:43:20.750137
#20 39.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/4.0.0/jakarta.xml.bind-api-4.0.0.pom (12 kB at 308 kB/s)
2025-Nov-07 15:43:20.750137
#20 39.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api-parent/4.0.0/jakarta.xml.bind-api-parent-4.0.0.pom
2025-Nov-07 15:43:20.750137
#20 39.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api-parent/4.0.0/jakarta.xml.bind-api-parent-4.0.0.pom (9.2 kB at 235 kB/s)
2025-Nov-07 15:43:20.750137
#20 39.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.0/jakarta.activation-api-2.1.0.pom
2025-Nov-07 15:43:20.750137
#20 39.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.0/jakarta.activation-api-2.1.0.pom (18 kB at 641 kB/s)
2025-Nov-07 15:43:20.855055
#20 39.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-runtime/4.0.2/jaxb-runtime-4.0.2.pom
2025-Nov-07 15:43:20.865988
#20 39.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-runtime/4.0.2/jaxb-runtime-4.0.2.pom (4.8 kB at 156 kB/s)
2025-Nov-07 15:43:20.865988
#20 39.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-runtime-parent/4.0.2/jaxb-runtime-parent-4.0.2.pom
2025-Nov-07 15:43:20.865988
#20 39.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-runtime-parent/4.0.2/jaxb-runtime-parent-4.0.2.pom (1.2 kB at 30 kB/s)
2025-Nov-07 15:43:20.865988
#20 39.90 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-parent/4.0.2/jaxb-parent-4.0.2.pom
2025-Nov-07 15:43:20.865988
#20 39.93 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-parent/4.0.2/jaxb-parent-4.0.2.pom (33 kB at 1.2 MB/s)
2025-Nov-07 15:43:20.974553
#20 39.93 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/jaxb-bom-ext/4.0.2/jaxb-bom-ext-4.0.2.pom
2025-Nov-07 15:43:20.974553
#20 39.97 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/jaxb-bom-ext/4.0.2/jaxb-bom-ext-4.0.2.pom (3.5 kB at 112 kB/s)
2025-Nov-07 15:43:20.974553
#20 39.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-bom/4.0.2/jaxb-bom-4.0.2.pom
2025-Nov-07 15:43:20.974553
#20 40.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-bom/4.0.2/jaxb-bom-4.0.2.pom (11 kB at 302 kB/s)
2025-Nov-07 15:43:20.974553
#20 40.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/ee4j/project/1.0.8/project-1.0.8.pom
2025-Nov-07 15:43:20.974553
#20 40.05 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/ee4j/project/1.0.8/project-1.0.8.pom (15 kB at 339 kB/s)
2025-Nov-07 15:43:21.109155
#20 40.05 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-core/4.0.2/jaxb-core-4.0.2.pom
2025-Nov-07 15:43:21.109155
#20 40.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-core/4.0.2/jaxb-core-4.0.2.pom (3.7 kB at 133 kB/s)
2025-Nov-07 15:43:21.109155
#20 40.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.1/jakarta.activation-api-2.1.1.pom
2025-Nov-07 15:43:21.109155
#20 40.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.1/jakarta.activation-api-2.1.1.pom (18 kB at 613 kB/s)
2025-Nov-07 15:43:21.109155
#20 40.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation/2.0.0/angus-activation-2.0.0.pom
2025-Nov-07 15:43:21.109155
#20 40.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation/2.0.0/angus-activation-2.0.0.pom (4.1 kB at 142 kB/s)
2025-Nov-07 15:43:21.109155
#20 40.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation-project/2.0.0/angus-activation-project-2.0.0.pom
2025-Nov-07 15:43:21.109155
#20 40.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation-project/2.0.0/angus-activation-project-2.0.0.pom (20 kB at 531 kB/s)
2025-Nov-07 15:43:21.208334
#20 40.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/txw2/4.0.2/txw2-4.0.2.pom
2025-Nov-07 15:43:21.208334
#20 40.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/txw2/4.0.2/txw2-4.0.2.pom (1.8 kB at 56 kB/s)
2025-Nov-07 15:43:21.208334
#20 40.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-txw-parent/4.0.2/jaxb-txw-parent-4.0.2.pom
2025-Nov-07 15:43:21.208334
#20 40.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-txw-parent/4.0.2/jaxb-txw-parent-4.0.2.pom (1.2 kB at 37 kB/s)
2025-Nov-07 15:43:21.208334
#20 40.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons-runtime/4.1.1/istack-commons-runtime-4.1.1.pom
2025-Nov-07 15:43:21.208334
#20 40.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons-runtime/4.1.1/istack-commons-runtime-4.1.1.pom (2.3 kB at 81 kB/s)
2025-Nov-07 15:43:21.319044
#20 40.29 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons/4.1.1/istack-commons-4.1.1.pom
2025-Nov-07 15:43:21.319044
#20 40.32 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons/4.1.1/istack-commons-4.1.1.pom (24 kB at 782 kB/s)
2025-Nov-07 15:43:21.319044
#20 40.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.pom
2025-Nov-07 15:43:21.319044
#20 40.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.pom (5.9 kB at 197 kB/s)
2025-Nov-07 15:43:21.319044
#20 40.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.pom
2025-Nov-07 15:43:21.319044
#20 40.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.pom (3.6 kB at 101 kB/s)
2025-Nov-07 15:43:21.319044
#20 40.40 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-master/4.13.0/antlr4-master-4.13.0.pom
2025-Nov-07 15:43:21.449941
#20 40.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-master/4.13.0/antlr4-master-4.13.0.pom (4.8 kB at 155 kB/s)
2025-Nov-07 15:43:21.449941
#20 40.43 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-jpa/3.5.4/spring-data-jpa-3.5.4.pom
2025-Nov-07 15:43:21.449941
#20 40.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-jpa/3.5.4/spring-data-jpa-3.5.4.pom (12 kB at 480 kB/s)
2025-Nov-07 15:43:21.449941
#20 40.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-jpa-parent/3.5.4/spring-data-jpa-parent-3.5.4.pom
2025-Nov-07 15:43:21.449941
#20 40.49 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-jpa-parent/3.5.4/spring-data-jpa-parent-3.5.4.pom (5.2 kB at 158 kB/s)
2025-Nov-07 15:43:21.449941
#20 40.49 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/data/build/spring-data-parent/3.5.4/spring-data-parent-3.5.4.pom
2025-Nov-07 15:43:21.449941
#20 40.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/data/build/spring-data-parent/3.5.4/spring-data-parent-3.5.4.pom (43 kB at 1.3 MB/s)
2025-Nov-07 15:43:21.569215
#20 40.53 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/data/build/spring-data-build/3.5.4/spring-data-build-3.5.4.pom
2025-Nov-07 15:43:21.569215
#20 40.56 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/data/build/spring-data-build/3.5.4/spring-data-build-3.5.4.pom (7.1 kB at 237 kB/s)
2025-Nov-07 15:43:21.569215
#20 40.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/testcontainers/testcontainers-bom/1.20.6/testcontainers-bom-1.20.6.pom
2025-Nov-07 15:43:21.569215
#20 40.61 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/testcontainers/testcontainers-bom/1.20.6/testcontainers-bom-1.20.6.pom (12 kB at 296 kB/s)
2025-Nov-07 15:43:21.569215
#20 40.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlinx/kotlinx-coroutines-bom/1.9.0/kotlinx-coroutines-bom-1.9.0.pom
2025-Nov-07 15:43:21.569215
#20 40.65 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jetbrains/kotlinx/kotlinx-coroutines-bom/1.9.0/kotlinx-coroutines-bom-1.9.0.pom (4.3 kB at 138 kB/s)
2025-Nov-07 15:43:21.684609
#20 40.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-bom/2.19.0/jackson-bom-2.19.0.pom
2025-Nov-07 15:43:21.684609
#20 40.68 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-bom/2.19.0/jackson-bom-2.19.0.pom (20 kB at 636 kB/s)
2025-Nov-07 15:43:21.684609
#20 40.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-parent/2.19/jackson-parent-2.19.pom
2025-Nov-07 15:43:21.684609
#20 40.72 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-parent/2.19/jackson-parent-2.19.pom (6.7 kB at 181 kB/s)
2025-Nov-07 15:43:21.684609
#20 40.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/65/oss-parent-65.pom
2025-Nov-07 15:43:21.684609
#20 40.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/65/oss-parent-65.pom (23 kB at 645 kB/s)
2025-Nov-07 15:43:21.786727
#20 40.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-commons/3.5.4/spring-data-commons-3.5.4.pom
2025-Nov-07 15:43:21.786727
#20 40.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-commons/3.5.4/spring-data-commons-3.5.4.pom (9.9 kB at 292 kB/s)
2025-Nov-07 15:43:21.786727
#20 40.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.2/slf4j-api-2.0.2.pom
2025-Nov-07 15:43:21.786727
#20 40.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.2/slf4j-api-2.0.2.pom (1.6 kB at 58 kB/s)
2025-Nov-07 15:43:21.786727
#20 40.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/2.0.2/slf4j-parent-2.0.2.pom
2025-Nov-07 15:43:21.786727
#20 40.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/2.0.2/slf4j-parent-2.0.2.pom (16 kB at 489 kB/s)
2025-Nov-07 15:43:21.896669
#20 40.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-orm/6.2.11/spring-orm-6.2.11.pom
2025-Nov-07 15:43:21.896669
#20 40.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-orm/6.2.11/spring-orm-6.2.11.pom (2.6 kB at 85 kB/s)
2025-Nov-07 15:43:21.896669
#20 40.90 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/annotation/jakarta.annotation-api/2.0.0/jakarta.annotation-api-2.0.0.pom
2025-Nov-07 15:43:21.896669
#20 40.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/annotation/jakarta.annotation-api/2.0.0/jakarta.annotation-api-2.0.0.pom (16 kB at 423 kB/s)
2025-Nov-07 15:43:21.896669
#20 40.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-aspects/6.2.11/spring-aspects-6.2.11.pom
2025-Nov-07 15:43:21.896669
#20 40.97 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-aspects/6.2.11/spring-aspects-6.2.11.pom (2.0 kB at 78 kB/s)
2025-Nov-07 15:43:22.027082
#20 40.98 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/aspectj/aspectjweaver/1.9.22.1/aspectjweaver-1.9.22.1.pom
2025-Nov-07 15:43:22.027082
#20 41.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/aspectj/aspectjweaver/1.9.22.1/aspectjweaver-1.9.22.1.pom (2.2 kB at 74 kB/s)
2025-Nov-07 15:43:22.027082
#20 41.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-data-jpa/3.5.6/spring-boot-starter-data-jpa-3.5.6.jar
2025-Nov-07 15:43:22.065578
#20 41.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-data-jpa/3.5.6/spring-boot-starter-data-jpa-3.5.6.jar (4.8 kB at 136 kB/s)
2025-Nov-07 15:43:22.065578
#20 41.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-jdbc/3.5.6/spring-boot-starter-jdbc-3.5.6.jar
2025-Nov-07 15:43:22.065578
#20 41.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/zaxxer/HikariCP/6.3.3/HikariCP-6.3.3.jar
2025-Nov-07 15:43:22.065578
#20 41.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-jdbc/6.2.11/spring-jdbc-6.2.11.jar
2025-Nov-07 15:43:22.065578
#20 41.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hibernate/orm/hibernate-core/6.6.29.Final/hibernate-core-6.6.29.Final.jar
2025-Nov-07 15:43:22.065578
#20 41.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar
2025-Nov-07 15:43:22.065578
#20 41.10 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-jdbc/3.5.6/spring-boot-starter-jdbc-3.5.6.jar (4.8 kB at 122 kB/s)
2025-Nov-07 15:43:22.143288
#20 41.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar
2025-Nov-07 15:43:22.143288
#20 41.12 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/zaxxer/HikariCP/6.3.3/HikariCP-6.3.3.jar (172 kB at 3.3 MB/s)
2025-Nov-07 15:43:22.143288
#20 41.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.5.0.Final/jboss-logging-3.5.0.Final.jar
2025-Nov-07 15:43:22.143288
#20 41.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-jdbc/6.2.11/spring-jdbc-6.2.11.jar (472 kB at 7.7 MB/s)
2025-Nov-07 15:43:22.143288
#20 41.13 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hibernate/common/hibernate-commons-annotations/7.0.3.Final/hibernate-commons-annotations-7.0.3.Final.jar
2025-Nov-07 15:43:22.143288
#20 41.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar (165 kB at 2.5 MB/s)
2025-Nov-07 15:43:22.143288
#20 41.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/smallrye/jandex/3.2.0/jandex-3.2.0.jar
2025-Nov-07 15:43:22.143288
#20 41.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar (29 kB at 329 kB/s)
2025-Nov-07 15:43:22.143288
#20 41.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/classmate/1.5.1/classmate-1.5.1.jar
2025-Nov-07 15:43:22.143288
#20 41.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.5.0.Final/jboss-logging-3.5.0.Final.jar (63 kB at 703 kB/s)
2025-Nov-07 15:43:22.143288
#20 41.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy/1.15.11/byte-buddy-1.15.11.jar
2025-Nov-07 15:43:22.143288
#20 41.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/smallrye/jandex/3.2.0/jandex-3.2.0.jar (375 kB at 3.3 MB/s)
2025-Nov-07 15:43:22.143288
#20 41.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/4.0.0/jakarta.xml.bind-api-4.0.0.jar
2025-Nov-07 15:43:22.143288
#20 41.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/classmate/1.5.1/classmate-1.5.1.jar (68 kB at 551 kB/s)
2025-Nov-07 15:43:22.143288
#20 41.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.0/jakarta.activation-api-2.1.0.jar
2025-Nov-07 15:43:22.143288
#20 41.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/4.0.0/jakarta.xml.bind-api-4.0.0.jar (127 kB at 859 kB/s)
2025-Nov-07 15:43:22.260034
#20 41.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-runtime/4.0.2/jaxb-runtime-4.0.2.jar
2025-Nov-07 15:43:22.260034
#20 41.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.0/jakarta.activation-api-2.1.0.jar (63 kB at 389 kB/s)
2025-Nov-07 15:43:22.260034
#20 41.23 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-core/4.0.2/jaxb-core-4.0.2.jar
2025-Nov-07 15:43:22.260034
#20 41.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hibernate/common/hibernate-commons-annotations/7.0.3.Final/hibernate-commons-annotations-7.0.3.Final.jar (68 kB at 386 kB/s)
2025-Nov-07 15:43:22.260034
#20 41.25 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation/2.0.0/angus-activation-2.0.0.jar
2025-Nov-07 15:43:22.260034
#20 41.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-runtime/4.0.2/jaxb-runtime-4.0.2.jar (908 kB at 4.7 MB/s)
2025-Nov-07 15:43:22.260034
#20 41.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/txw2/4.0.2/txw2-4.0.2.jar
2025-Nov-07 15:43:22.260034
#20 41.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-core/4.0.2/jaxb-core-4.0.2.jar (139 kB at 679 kB/s)
2025-Nov-07 15:43:22.260034
#20 41.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons-runtime/4.1.1/istack-commons-runtime-4.1.1.jar
2025-Nov-07 15:43:22.260034
#20 41.29 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation/2.0.0/angus-activation-2.0.0.jar (27 kB at 123 kB/s)
2025-Nov-07 15:43:22.260034
#20 41.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar
2025-Nov-07 15:43:22.260034
#20 41.31 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/txw2/4.0.2/txw2-4.0.2.jar (73 kB at 313 kB/s)
2025-Nov-07 15:43:22.260034
#20 41.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar
2025-Nov-07 15:43:22.260034
#20 41.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons-runtime/4.1.1/istack-commons-runtime-4.1.1.jar (26 kB at 99 kB/s)
2025-Nov-07 15:43:22.364490
#20 41.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-jpa/3.5.4/spring-data-jpa-3.5.4.jar
2025-Nov-07 15:43:22.364490
#20 41.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar (11 kB at 37 kB/s)
2025-Nov-07 15:43:22.364490
#20 41.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-commons/3.5.4/spring-data-commons-3.5.4.jar
2025-Nov-07 15:43:22.364490
#20 41.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar (326 kB at 1.1 MB/s)
2025-Nov-07 15:43:22.364490
#20 41.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-orm/6.2.11/spring-orm-6.2.11.jar
2025-Nov-07 15:43:22.364490
#20 41.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hibernate/orm/hibernate-core/6.6.29.Final/hibernate-core-6.6.29.Final.jar (12 MB at 40 MB/s)
2025-Nov-07 15:43:22.364490
#20 41.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-tx/6.2.11/spring-tx-6.2.11.jar
2025-Nov-07 15:43:22.364490
#20 41.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy/1.15.11/byte-buddy-1.15.11.jar (8.5 MB at 27 MB/s)
2025-Nov-07 15:43:22.364490
#20 41.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.2/slf4j-api-2.0.2.jar
2025-Nov-07 15:43:22.364490
#20 41.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-jpa/3.5.4/spring-data-jpa-3.5.4.jar (1.8 MB at 5.5 MB/s)
2025-Nov-07 15:43:22.364490
#20 41.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-aspects/6.2.11/spring-aspects-6.2.11.jar
2025-Nov-07 15:43:22.364490
#20 41.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-orm/6.2.11/spring-orm-6.2.11.jar (235 kB at 675 kB/s)
2025-Nov-07 15:43:22.364490
#20 41.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/aspectj/aspectjweaver/1.9.22.1/aspectjweaver-1.9.22.1.jar
2025-Nov-07 15:43:22.364490
#20 41.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.2/slf4j-api-2.0.2.jar (61 kB at 176 kB/s)
2025-Nov-07 15:43:22.364490
#20 41.43 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-tx/6.2.11/spring-tx-6.2.11.jar (286 kB at 802 kB/s)
2025-Nov-07 15:43:22.364490
#20 41.44 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-aspects/6.2.11/spring-aspects-6.2.11.jar (50 kB at 136 kB/s)
2025-Nov-07 15:43:22.494522
#20 41.44 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/data/spring-data-commons/3.5.4/spring-data-commons-3.5.4.jar (1.5 MB at 4.1 MB/s)
2025-Nov-07 15:43:22.494522
#20 41.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/aspectj/aspectjweaver/1.9.22.1/aspectjweaver-1.9.22.1.jar (2.2 MB at 5.3 MB/s)
2025-Nov-07 15:43:22.494522
#20 41.53 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/zxing/javase/3.5.2/javase-3.5.2.pom
2025-Nov-07 15:43:22.494522
#20 41.57 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/zxing/javase/3.5.2/javase-3.5.2.pom (2.7 kB at 65 kB/s)
2025-Nov-07 15:43:22.596626
#20 41.59 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/zxing/zxing-parent/3.5.2/zxing-parent-3.5.2.pom
2025-Nov-07 15:43:22.596626
#20 41.63 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/zxing/zxing-parent/3.5.2/zxing-parent-3.5.2.pom (28 kB at 677 kB/s)
2025-Nov-07 15:43:22.596626
#20 41.64 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/zxing/core/3.5.2/core-3.5.2.pom
2025-Nov-07 15:43:22.596626
#20 41.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/zxing/core/3.5.2/core-3.5.2.pom (2.8 kB at 85 kB/s)
2025-Nov-07 15:43:22.596626
#20 41.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/beust/jcommander/1.82/jcommander-1.82.pom
2025-Nov-07 15:43:22.707951
#20 41.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/beust/jcommander/1.82/jcommander-1.82.pom (1.5 kB at 49 kB/s)
2025-Nov-07 15:43:22.707951
#20 41.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/jai-imageio/jai-imageio-core/1.4.0/jai-imageio-core-1.4.0.pom
2025-Nov-07 15:43:22.707951
#20 41.74 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/jai-imageio/jai-imageio-core/1.4.0/jai-imageio-core-1.4.0.pom (12 kB at 356 kB/s)
2025-Nov-07 15:43:22.707951
#20 41.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/zxing/javase/3.5.2/javase-3.5.2.jar
2025-Nov-07 15:43:22.707951
#20 41.78 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/zxing/javase/3.5.2/javase-3.5.2.jar (38 kB at 1.1 MB/s)
2025-Nov-07 15:43:22.837646
#20 41.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/google/zxing/core/3.5.2/core-3.5.2.jar
2025-Nov-07 15:43:22.837646
#20 41.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/beust/jcommander/1.82/jcommander-1.82.jar
2025-Nov-07 15:43:22.837646
#20 41.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/jai-imageio/jai-imageio-core/1.4.0/jai-imageio-core-1.4.0.jar
2025-Nov-07 15:43:22.837646
#20 41.82 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/beust/jcommander/1.82/jcommander-1.82.jar (88 kB at 3.0 MB/s)
2025-Nov-07 15:43:22.837646
#20 41.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/google/zxing/core/3.5.2/core-3.5.2.jar (609 kB at 12 MB/s)
2025-Nov-07 15:43:22.837646
#20 41.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/jai-imageio/jai-imageio-core/1.4.0/jai-imageio-core-1.4.0.jar (628 kB at 13 MB/s)
2025-Nov-07 15:43:22.837646
#20 41.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-impl/0.12.3/jjwt-impl-0.12.3.pom
2025-Nov-07 15:43:22.837646
#20 41.87 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-impl/0.12.3/jjwt-impl-0.12.3.pom (2.5 kB at 90 kB/s)
2025-Nov-07 15:43:22.837646
#20 41.87 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-root/0.12.3/jjwt-root-0.12.3.pom
2025-Nov-07 15:43:22.837646
#20 41.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-root/0.12.3/jjwt-root-0.12.3.pom (37 kB at 966 kB/s)
2025-Nov-07 15:43:22.937969
#20 41.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-api/0.12.3/jjwt-api-0.12.3.pom
2025-Nov-07 15:43:22.937969
#20 41.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-api/0.12.3/jjwt-api-0.12.3.pom (1.8 kB at 59 kB/s)
2025-Nov-07 15:43:22.937969
#20 41.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-impl/0.12.3/jjwt-impl-0.12.3.jar
2025-Nov-07 15:43:22.937969
#20 41.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-impl/0.12.3/jjwt-impl-0.12.3.jar (470 kB at 14 MB/s)
2025-Nov-07 15:43:22.937969
#20 41.98 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-api/0.12.3/jjwt-api-0.12.3.jar
2025-Nov-07 15:43:22.937969
#20 42.01 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-api/0.12.3/jjwt-api-0.12.3.jar (140 kB at 4.7 MB/s)
2025-Nov-07 15:43:23.066433
#20 42.02 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-jackson/0.12.3/jjwt-jackson-0.12.3.pom
2025-Nov-07 15:43:23.087515
#20 42.05 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-jackson/0.12.3/jjwt-jackson-0.12.3.pom (2.9 kB at 99 kB/s)
2025-Nov-07 15:43:23.087515
#20 42.05 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.12.7.1/jackson-databind-2.12.7.1.pom
2025-Nov-07 15:43:23.087515
#20 42.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.12.7.1/jackson-databind-2.12.7.1.pom (15 kB at 533 kB/s)
2025-Nov-07 15:43:23.087515
#20 42.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-base/2.12.7/jackson-base-2.12.7.pom
2025-Nov-07 15:43:23.087515
#20 42.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-base/2.12.7/jackson-base-2.12.7.pom (9.3 kB at 300 kB/s)
2025-Nov-07 15:43:23.087515
#20 42.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-bom/2.12.7/jackson-bom-2.12.7.pom
2025-Nov-07 15:43:23.087515
#20 42.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-bom/2.12.7/jackson-bom-2.12.7.pom (17 kB at 574 kB/s)
2025-Nov-07 15:43:23.174346
#20 42.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-parent/2.12/jackson-parent-2.12.pom
2025-Nov-07 15:43:23.174346
#20 42.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/jackson-parent/2.12/jackson-parent-2.12.pom (7.5 kB at 242 kB/s)
2025-Nov-07 15:43:23.174346
#20 42.18 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/41/oss-parent-41.pom
2025-Nov-07 15:43:23.174346
#20 42.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/41/oss-parent-41.pom (23 kB at 708 kB/s)
2025-Nov-07 15:43:23.174346
#20 42.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.12.7/jackson-annotations-2.12.7.pom
2025-Nov-07 15:43:23.174346
#20 42.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.12.7/jackson-annotations-2.12.7.pom (6.0 kB at 216 kB/s)
2025-Nov-07 15:43:23.293865
#20 42.25 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-core/2.12.7/jackson-core-2.12.7.pom
2025-Nov-07 15:43:23.293865
#20 42.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-core/2.12.7/jackson-core-2.12.7.pom (5.5 kB at 168 kB/s)
2025-Nov-07 15:43:23.293865
#20 42.29 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-jackson/0.12.3/jjwt-jackson-0.12.3.jar
2025-Nov-07 15:43:23.293865
#20 42.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/jsonwebtoken/jjwt-jackson/0.12.3/jjwt-jackson-0.12.3.jar (9.1 kB at 234 kB/s)
2025-Nov-07 15:43:23.293865
#20 42.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.12.7.1/jackson-databind-2.12.7.1.jar
2025-Nov-07 15:43:23.293865
#20 42.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.12.7/jackson-annotations-2.12.7.jar
2025-Nov-07 15:43:23.293865
#20 42.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-core/2.12.7/jackson-core-2.12.7.jar
2025-Nov-07 15:43:23.293865
#20 42.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-core/2.12.7/jackson-core-2.12.7.jar (366 kB at 9.6 MB/s)
2025-Nov-07 15:43:23.438693
#20 42.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.12.7/jackson-annotations-2.12.7.jar (76 kB at 1.5 MB/s)
2025-Nov-07 15:43:23.438693
#20 42.39 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.12.7.1/jackson-databind-2.12.7.1.jar (1.5 MB at 24 MB/s)
2025-Nov-07 15:43:23.438693
#20 42.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/projectlombok/lombok/1.18.40/lombok-1.18.40.pom
2025-Nov-07 15:43:23.438693
#20 42.46 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/projectlombok/lombok/1.18.40/lombok-1.18.40.pom (1.5 kB at 33 kB/s)
2025-Nov-07 15:43:23.438693
#20 42.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/projectlombok/lombok/1.18.40/lombok-1.18.40.jar
2025-Nov-07 15:43:23.438693
#20 42.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/projectlombok/lombok/1.18.40/lombok-1.18.40.jar (2.0 MB at 41 MB/s)
2025-Nov-07 15:43:23.568153
#20 42.56 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-validation/3.5.6/spring-boot-starter-validation-3.5.6.pom
2025-Nov-07 15:43:23.568153
#20 42.60 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-validation/3.5.6/spring-boot-starter-validation-3.5.6.pom (2.5 kB at 60 kB/s)
2025-Nov-07 15:43:23.568153
#20 42.61 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hibernate/validator/hibernate-validator/8.0.3.Final/hibernate-validator-8.0.3.Final.pom
2025-Nov-07 15:43:23.568153
#20 42.64 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hibernate/validator/hibernate-validator/8.0.3.Final/hibernate-validator-8.0.3.Final.pom (5.3 kB at 161 kB/s)
2025-Nov-07 15:43:23.678863
#20 42.65 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.pom
2025-Nov-07 15:43:23.678863
#20 42.68 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.pom (11 kB at 379 kB/s)
2025-Nov-07 15:43:23.678863
#20 42.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.4.3.Final/jboss-logging-3.4.3.Final.pom
2025-Nov-07 15:43:23.678863
#20 42.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.4.3.Final/jboss-logging-3.4.3.Final.pom (15 kB at 566 kB/s)
2025-Nov-07 15:43:23.678863
#20 42.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-validation/3.5.6/spring-boot-starter-validation-3.5.6.jar
2025-Nov-07 15:43:23.678863
#20 42.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-validation/3.5.6/spring-boot-starter-validation-3.5.6.jar (4.8 kB at 125 kB/s)
2025-Nov-07 15:43:23.783202
#20 42.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hibernate/validator/hibernate-validator/8.0.3.Final/hibernate-validator-8.0.3.Final.jar
2025-Nov-07 15:43:23.783202
#20 42.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar
2025-Nov-07 15:43:23.783202
#20 42.77 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.4.3.Final/jboss-logging-3.4.3.Final.jar
2025-Nov-07 15:43:23.783202
#20 42.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.4.3.Final/jboss-logging-3.4.3.Final.jar (61 kB at 1.8 MB/s)
2025-Nov-07 15:43:23.783202
#20 42.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar (93 kB at 2.1 MB/s)
2025-Nov-07 15:43:23.783202
#20 42.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hibernate/validator/hibernate-validator/8.0.3.Final/hibernate-validator-8.0.3.Final.jar (1.3 MB at 25 MB/s)
2025-Nov-07 15:43:23.783202
#20 42.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/postgresql/postgresql/42.7.7/postgresql-42.7.7.pom
2025-Nov-07 15:43:23.783202
#20 42.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/postgresql/postgresql/42.7.7/postgresql-42.7.7.pom (3.3 kB at 108 kB/s)
2025-Nov-07 15:43:23.783202
#20 42.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/checkerframework/checker-qual/3.49.3/checker-qual-3.49.3.pom
2025-Nov-07 15:43:23.906475
#20 42.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/checkerframework/checker-qual/3.49.3/checker-qual-3.49.3.pom (2.1 kB at 52 kB/s)
2025-Nov-07 15:43:23.906475
#20 42.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/junit/junit/4.13.2/junit-4.13.2.pom
2025-Nov-07 15:43:23.906475
#20 42.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/junit/junit/4.13.2/junit-4.13.2.pom (27 kB at 819 kB/s)
2025-Nov-07 15:43:23.906475
#20 42.94 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.pom
2025-Nov-07 15:43:23.906475
#20 42.98 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.pom (766 B at 20 kB/s)
2025-Nov-07 15:43:24.032941
#20 42.99 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest-parent/1.3/hamcrest-parent-1.3.pom
2025-Nov-07 15:43:24.032941
#20 43.03 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest-parent/1.3/hamcrest-parent-1.3.pom (2.0 kB at 51 kB/s)
2025-Nov-07 15:43:24.032941
#20 43.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-api/5.12.2/junit-jupiter-api-5.12.2.pom
2025-Nov-07 15:43:24.032941
#20 43.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-api/5.12.2/junit-jupiter-api-5.12.2.pom (3.2 kB at 76 kB/s)
2025-Nov-07 15:43:24.032941
#20 43.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.pom
2025-Nov-07 15:43:24.032941
#20 43.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.pom (2.0 kB at 64 kB/s)
2025-Nov-07 15:43:24.158073
#20 43.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-commons/1.12.2/junit-platform-commons-1.12.2.pom
2025-Nov-07 15:43:24.158073
#20 43.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-commons/1.12.2/junit-platform-commons-1.12.2.pom (2.8 kB at 77 kB/s)
2025-Nov-07 15:43:24.158073
#20 43.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.pom
2025-Nov-07 15:43:24.158073
#20 43.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.pom (1.5 kB at 49 kB/s)
2025-Nov-07 15:43:24.158073
#20 43.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-engine/5.12.2/junit-jupiter-engine-5.12.2.pom
2025-Nov-07 15:43:24.158073
#20 43.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-engine/5.12.2/junit-jupiter-engine-5.12.2.pom (3.2 kB at 87 kB/s)
2025-Nov-07 15:43:24.283141
#20 43.24 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-engine/1.12.2/junit-platform-engine-1.12.2.pom
2025-Nov-07 15:43:24.283141
#20 43.27 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-engine/1.12.2/junit-platform-engine-1.12.2.pom (3.2 kB at 97 kB/s)
2025-Nov-07 15:43:24.283141
#20 43.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/waffle/waffle-jna/1.9.1/waffle-jna-1.9.1.pom
2025-Nov-07 15:43:24.283141
#20 43.32 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/waffle/waffle-jna/1.9.1/waffle-jna-1.9.1.pom (3.1 kB at 64 kB/s)
2025-Nov-07 15:43:24.283141
#20 43.32 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/waffle/waffle-parent/1.9.1/waffle-parent-1.9.1.pom
2025-Nov-07 15:43:24.283141
#20 43.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/waffle/waffle-parent/1.9.1/waffle-parent-1.9.1.pom (67 kB at 1.8 MB/s)
2025-Nov-07 15:43:24.395385
#20 43.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna/4.5.1/jna-4.5.1.pom
2025-Nov-07 15:43:24.395385
#20 43.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna/4.5.1/jna-4.5.1.pom (1.6 kB at 41 kB/s)
2025-Nov-07 15:43:24.395385
#20 43.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna-platform/4.5.1/jna-platform-4.5.1.pom
2025-Nov-07 15:43:24.395385
#20 43.47 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna-platform/4.5.1/jna-platform-4.5.1.pom (1.8 kB at 31 kB/s)
2025-Nov-07 15:43:24.496200
#20 43.47 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/jcl-over-slf4j/1.7.25/jcl-over-slf4j-1.7.25.pom
2025-Nov-07 15:43:24.496200
#20 43.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/jcl-over-slf4j/1.7.25/jcl-over-slf4j-1.7.25.pom (959 B at 25 kB/s)
2025-Nov-07 15:43:24.496200
#20 43.51 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/1.7.25/slf4j-parent-1.7.25.pom
2025-Nov-07 15:43:24.496200
#20 43.57 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/1.7.25/slf4j-parent-1.7.25.pom (14 kB at 233 kB/s)
2025-Nov-07 15:43:24.628649
#20 43.58 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.25/slf4j-api-1.7.25.pom
2025-Nov-07 15:43:24.628649
#20 43.63 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.25/slf4j-api-1.7.25.pom (3.8 kB at 77 kB/s)
2025-Nov-07 15:43:24.628649
#20 43.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/ben-manes/caffeine/caffeine/2.6.2/caffeine-2.6.2.pom
2025-Nov-07 15:43:24.628649
#20 43.70 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/ben-manes/caffeine/caffeine/2.6.2/caffeine-2.6.2.pom (5.6 kB at 80 kB/s)
2025-Nov-07 15:43:24.730622
#20 43.71 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/postgresql/postgresql/42.7.7/postgresql-42.7.7.jar
2025-Nov-07 15:43:24.730622
#20 43.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/postgresql/postgresql/42.7.7/postgresql-42.7.7.jar (1.1 MB at 24 MB/s)
2025-Nov-07 15:43:24.730622
#20 43.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/checkerframework/checker-qual/3.49.3/checker-qual-3.49.3.jar
2025-Nov-07 15:43:24.730622
#20 43.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar
2025-Nov-07 15:43:24.730622
#20 43.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar
2025-Nov-07 15:43:24.730622
#20 43.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-api/5.12.2/junit-jupiter-api-5.12.2.jar
2025-Nov-07 15:43:24.730622
#20 43.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar
2025-Nov-07 15:43:24.730622
#20 43.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar (14 kB at 511 kB/s)
2025-Nov-07 15:43:24.730622
#20 43.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-commons/1.12.2/junit-platform-commons-1.12.2.jar
2025-Nov-07 15:43:24.730622
#20 43.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-api/5.12.2/junit-jupiter-api-5.12.2.jar (233 kB at 6.5 MB/s)
2025-Nov-07 15:43:24.730622
#20 43.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar
2025-Nov-07 15:43:24.730622
#20 43.80 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar (45 kB at 1.0 MB/s)
2025-Nov-07 15:43:24.730622
#20 43.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-engine/5.12.2/junit-jupiter-engine-5.12.2.jar
2025-Nov-07 15:43:24.834015
#20 43.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/checkerframework/checker-qual/3.49.3/checker-qual-3.49.3.jar (238 kB at 4.8 MB/s)
2025-Nov-07 15:43:24.834015
#20 43.82 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar (385 kB at 7.1 MB/s)
2025-Nov-07 15:43:24.834015
#20 43.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-engine/1.12.2/junit-platform-engine-1.12.2.jar
2025-Nov-07 15:43:24.834015
#20 43.82 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/waffle/waffle-jna/1.9.1/waffle-jna-1.9.1.jar
2025-Nov-07 15:43:24.834015
#20 43.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar (6.8 kB at 93 kB/s)
2025-Nov-07 15:43:24.834015
#20 43.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-commons/1.12.2/junit-platform-commons-1.12.2.jar (152 kB at 2.1 MB/s)
2025-Nov-07 15:43:24.834015
#20 43.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna/4.5.1/jna-4.5.1.jar
2025-Nov-07 15:43:24.834015
#20 43.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna-platform/4.5.1/jna-platform-4.5.1.jar
2025-Nov-07 15:43:24.834015
#20 43.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-engine/5.12.2/junit-jupiter-engine-5.12.2.jar (292 kB at 3.8 MB/s)
2025-Nov-07 15:43:24.834015
#20 43.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/jcl-over-slf4j/1.7.25/jcl-over-slf4j-1.7.25.jar
2025-Nov-07 15:43:24.834015
#20 43.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-engine/1.12.2/junit-platform-engine-1.12.2.jar (256 kB at 3.0 MB/s)
2025-Nov-07 15:43:24.834015
#20 43.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.25/slf4j-api-1.7.25.jar
2025-Nov-07 15:43:24.834015
#20 43.85 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/waffle/waffle-jna/1.9.1/waffle-jna-1.9.1.jar (68 kB at 777 kB/s)
2025-Nov-07 15:43:24.834015
#20 43.85 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/github/ben-manes/caffeine/caffeine/2.6.2/caffeine-2.6.2.jar
2025-Nov-07 15:43:24.834015
#20 43.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/1.7.25/slf4j-api-1.7.25.jar (41 kB at 352 kB/s)
2025-Nov-07 15:43:24.834015
#20 43.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna-platform/4.5.1/jna-platform-4.5.1.jar (2.3 MB at 18 MB/s)
2025-Nov-07 15:43:24.834015
#20 43.89 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/jcl-over-slf4j/1.7.25/jcl-over-slf4j-1.7.25.jar (17 kB at 125 kB/s)
2025-Nov-07 15:43:24.834015
#20 43.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/java/dev/jna/jna/4.5.1/jna-4.5.1.jar (1.4 MB at 11 MB/s)
2025-Nov-07 15:43:24.834015
#20 43.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/github/ben-manes/caffeine/caffeine/2.6.2/caffeine-2.6.2.jar (660 kB at 4.8 MB/s)
2025-Nov-07 15:43:24.834015
#20 43.91 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-actuator/3.5.6/spring-boot-starter-actuator-3.5.6.pom
2025-Nov-07 15:43:24.961250
#20 43.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-actuator/3.5.6/spring-boot-starter-actuator-3.5.6.pom (2.8 kB at 89 kB/s)
2025-Nov-07 15:43:24.961250
#20 43.95 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-actuator-autoconfigure/3.5.6/spring-boot-actuator-autoconfigure-3.5.6.pom
2025-Nov-07 15:43:24.961250
#20 44.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-actuator-autoconfigure/3.5.6/spring-boot-actuator-autoconfigure-3.5.6.pom (2.9 kB at 56 kB/s)
2025-Nov-07 15:43:24.961250
#20 44.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-actuator/3.5.6/spring-boot-actuator-3.5.6.pom
2025-Nov-07 15:43:24.961250
#20 44.04 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-actuator/3.5.6/spring-boot-actuator-3.5.6.pom (2.0 kB at 64 kB/s)
2025-Nov-07 15:43:25.082982
#20 44.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-observation/1.15.4/micrometer-observation-1.15.4.pom
2025-Nov-07 15:43:25.082982
#20 44.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-observation/1.15.4/micrometer-observation-1.15.4.pom (3.8 kB at 87 kB/s)
2025-Nov-07 15:43:25.082982
#20 44.09 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-commons/1.15.4/micrometer-commons-1.15.4.pom
2025-Nov-07 15:43:25.082982
#20 44.13 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-commons/1.15.4/micrometer-commons-1.15.4.pom (3.4 kB at 87 kB/s)
2025-Nov-07 15:43:25.082982
#20 44.13 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-jakarta9/1.15.4/micrometer-jakarta9-1.15.4.pom
2025-Nov-07 15:43:25.082982
#20 44.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-jakarta9/1.15.4/micrometer-jakarta9-1.15.4.pom (3.8 kB at 130 kB/s)
2025-Nov-07 15:43:25.208143
#20 44.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-core/1.15.4/micrometer-core-1.15.4.pom
2025-Nov-07 15:43:25.208143
#20 44.21 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-core/1.15.4/micrometer-core-1.15.4.pom (11 kB at 224 kB/s)
2025-Nov-07 15:43:25.208143
#20 44.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hdrhistogram/HdrHistogram/2.2.2/HdrHistogram-2.2.2.pom
2025-Nov-07 15:43:25.208143
#20 44.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hdrhistogram/HdrHistogram/2.2.2/HdrHistogram-2.2.2.pom (13 kB at 362 kB/s)
2025-Nov-07 15:43:25.208143
#20 44.25 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/latencyutils/LatencyUtils/2.0.3/LatencyUtils-2.0.3.pom
2025-Nov-07 15:43:25.208143
#20 44.28 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/latencyutils/LatencyUtils/2.0.3/LatencyUtils-2.0.3.pom (7.2 kB at 241 kB/s)
2025-Nov-07 15:43:25.330103
#20 44.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-actuator/3.5.6/spring-boot-starter-actuator-3.5.6.jar
2025-Nov-07 15:43:25.330103
#20 44.33 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-actuator/3.5.6/spring-boot-starter-actuator-3.5.6.jar (4.8 kB at 160 kB/s)
2025-Nov-07 15:43:25.330103
#20 44.33 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-actuator-autoconfigure/3.5.6/spring-boot-actuator-autoconfigure-3.5.6.jar
2025-Nov-07 15:43:25.330103
#20 44.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-observation/1.15.4/micrometer-observation-1.15.4.jar
2025-Nov-07 15:43:25.330103
#20 44.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-actuator/3.5.6/spring-boot-actuator-3.5.6.jar
2025-Nov-07 15:43:25.330103
#20 44.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-commons/1.15.4/micrometer-commons-1.15.4.jar
2025-Nov-07 15:43:25.330103
#20 44.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-jakarta9/1.15.4/micrometer-jakarta9-1.15.4.jar
2025-Nov-07 15:43:25.330103
#20 44.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-observation/1.15.4/micrometer-observation-1.15.4.jar (75 kB at 2.1 MB/s)
2025-Nov-07 15:43:25.330103
#20 44.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-core/1.15.4/micrometer-core-1.15.4.jar
2025-Nov-07 15:43:25.330103
#20 44.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-commons/1.15.4/micrometer-commons-1.15.4.jar (49 kB at 1.3 MB/s)
2025-Nov-07 15:43:25.330103
#20 44.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hdrhistogram/HdrHistogram/2.2.2/HdrHistogram-2.2.2.jar
2025-Nov-07 15:43:25.330103
#20 44.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-actuator-autoconfigure/3.5.6/spring-boot-actuator-autoconfigure-3.5.6.jar (835 kB at 20 MB/s)
2025-Nov-07 15:43:25.330103
#20 44.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/latencyutils/LatencyUtils/2.0.3/LatencyUtils-2.0.3.jar
2025-Nov-07 15:43:25.330103
#20 44.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-jakarta9/1.15.4/micrometer-jakarta9-1.15.4.jar (33 kB at 821 kB/s)
2025-Nov-07 15:43:25.330103
#20 44.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-actuator/3.5.6/spring-boot-actuator-3.5.6.jar (704 kB at 15 MB/s)
2025-Nov-07 15:43:25.330103
#20 44.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hdrhistogram/HdrHistogram/2.2.2/HdrHistogram-2.2.2.jar (177 kB at 2.6 MB/s)
2025-Nov-07 15:43:25.437957
2025-Nov-07 15:43:25.460472
#20 44.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/io/micrometer/micrometer-core/1.15.4/micrometer-core-1.15.4.jar (865 kB at 12 MB/s)
2025-Nov-07 15:43:25.460472
#20 44.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/latencyutils/LatencyUtils/2.0.3/LatencyUtils-2.0.3.jar (30 kB at 414 kB/s)
2025-Nov-07 15:43:25.460472
#20 44.43 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-test/6.5.5/spring-security-test-6.5.5.pom
2025-Nov-07 15:43:25.460472
#20 44.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-test/6.5.5/spring-security-test-6.5.5.pom (2.7 kB at 54 kB/s)
2025-Nov-07 15:43:25.460472
#20 44.48 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-core/6.5.5/spring-security-core-6.5.5.pom
2025-Nov-07 15:43:25.460472
#20 44.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-core/6.5.5/spring-security-core-6.5.5.pom (3.2 kB at 92 kB/s)
2025-Nov-07 15:43:25.550166
#20 44.52 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-crypto/6.5.5/spring-security-crypto-6.5.5.pom
2025-Nov-07 15:43:25.550166
#20 44.55 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-crypto/6.5.5/spring-security-crypto-6.5.5.pom (1.9 kB at 55 kB/s)
2025-Nov-07 15:43:25.550166
#20 44.56 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-web/6.5.5/spring-security-web-6.5.5.pom
2025-Nov-07 15:43:25.550166
#20 44.59 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-web/6.5.5/spring-security-web-6.5.5.pom (3.2 kB at 87 kB/s)
2025-Nov-07 15:43:25.550166
#20 44.60 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-test/6.2.11/spring-test-6.2.11.pom
2025-Nov-07 15:43:25.550166
#20 44.62 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-test/6.2.11/spring-test-6.2.11.pom (2.1 kB at 74 kB/s)
2025-Nov-07 15:43:25.648974
#20 44.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-test/6.5.5/spring-security-test-6.5.5.jar
2025-Nov-07 15:43:25.648974
#20 44.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-test/6.5.5/spring-security-test-6.5.5.jar (136 kB at 3.6 MB/s)
2025-Nov-07 15:43:25.648974
#20 44.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-core/6.5.5/spring-security-core-6.5.5.jar
2025-Nov-07 15:43:25.648974
#20 44.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-crypto/6.5.5/spring-security-crypto-6.5.5.jar
2025-Nov-07 15:43:25.648974
#20 44.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-web/6.5.5/spring-security-web-6.5.5.jar
2025-Nov-07 15:43:25.648974
#20 44.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/spring-test/6.2.11/spring-test-6.2.11.jar
2025-Nov-07 15:43:25.648974
#20 44.70 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-crypto/6.5.5/spring-security-crypto-6.5.5.jar (105 kB at 3.6 MB/s)
2025-Nov-07 15:43:25.648974
#20 44.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-core/6.5.5/spring-security-core-6.5.5.jar (623 kB at 16 MB/s)
2025-Nov-07 15:43:25.648974
#20 44.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-web/6.5.5/spring-security-web-6.5.5.jar (1.1 MB at 26 MB/s)
2025-Nov-07 15:43:25.648974
#20 44.73 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/spring-test/6.2.11/spring-test-6.2.11.jar (1.0 MB at 19 MB/s)
2025-Nov-07 15:43:25.765191
#20 44.74 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-test/3.5.6/spring-boot-starter-test-3.5.6.pom
2025-Nov-07 15:43:25.765191
#20 44.77 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-test/3.5.6/spring-boot-starter-test-3.5.6.pom (4.9 kB at 140 kB/s)
2025-Nov-07 15:43:25.765191
#20 44.77 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-test/3.5.6/spring-boot-test-3.5.6.pom
2025-Nov-07 15:43:25.765191
#20 44.81 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-test/3.5.6/spring-boot-test-3.5.6.pom (2.2 kB at 58 kB/s)
2025-Nov-07 15:43:25.765191
#20 44.81 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-test-autoconfigure/3.5.6/spring-boot-test-autoconfigure-3.5.6.pom
2025-Nov-07 15:43:25.765191
#20 44.84 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-test-autoconfigure/3.5.6/spring-boot-test-autoconfigure-3.5.6.pom (2.5 kB at 88 kB/s)
2025-Nov-07 15:43:25.880750
#20 44.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.pom
2025-Nov-07 15:43:25.880750
#20 44.88 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.pom (1.9 kB at 60 kB/s)
2025-Nov-07 15:43:25.880750
#20 44.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/minidev/json-smart/2.5.0/json-smart-2.5.0.pom
2025-Nov-07 15:43:25.880750
#20 44.91 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/minidev/json-smart/2.5.0/json-smart-2.5.0.pom (9.2 kB at 262 kB/s)
2025-Nov-07 15:43:25.880750
#20 44.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/minidev/accessors-smart/2.5.0/accessors-smart-2.5.0.pom
2025-Nov-07 15:43:25.880750
#20 44.95 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/minidev/accessors-smart/2.5.0/accessors-smart-2.5.0.pom (11 kB at 294 kB/s)
2025-Nov-07 15:43:25.996750
#20 44.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.3/asm-9.3.pom
2025-Nov-07 15:43:25.996750
#20 44.99 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/asm/asm/9.3/asm-9.3.pom (2.4 kB at 88 kB/s)
2025-Nov-07 15:43:25.996750
#20 44.99 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/ow2/ow2/1.5/ow2-1.5.pom
2025-Nov-07 15:43:25.996750
#20 45.03 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/ow2/ow2/1.5/ow2-1.5.pom (11 kB at 281 kB/s)
2025-Nov-07 15:43:25.996750
#20 45.04 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.11/slf4j-api-2.0.11.pom
2025-Nov-07 15:43:25.996750
#20 45.07 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.11/slf4j-api-2.0.11.pom (2.8 kB at 78 kB/s)
2025-Nov-07 15:43:26.107293
#20 45.07 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/2.0.11/slf4j-parent-2.0.11.pom
2025-Nov-07 15:43:26.107293
#20 45.10 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-parent/2.0.11/slf4j-parent-2.0.11.pom (15 kB at 514 kB/s)
2025-Nov-07 15:43:26.107293
#20 45.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-bom/2.0.11/slf4j-bom-2.0.11.pom
2025-Nov-07 15:43:26.107293
#20 45.15 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-bom/2.0.11/slf4j-bom-2.0.11.pom (7.3 kB at 188 kB/s)
2025-Nov-07 15:43:26.107293
#20 45.15 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.pom
2025-Nov-07 15:43:26.107293
#20 45.18 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.pom (13 kB at 385 kB/s)
2025-Nov-07 15:43:26.232150
#20 45.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api-parent/4.0.2/jakarta.xml.bind-api-parent-4.0.2.pom
2025-Nov-07 15:43:26.232150
#20 45.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api-parent/4.0.2/jakarta.xml.bind-api-parent-4.0.2.pom (9.1 kB at 286 kB/s)
2025-Nov-07 15:43:26.232150
#20 45.22 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.pom
2025-Nov-07 15:43:26.232150
#20 45.25 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.pom (19 kB at 638 kB/s)
2025-Nov-07 15:43:26.232150
#20 45.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/minidev/json-smart/2.5.2/json-smart-2.5.2.pom
2025-Nov-07 15:43:26.232150
#20 45.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/minidev/json-smart/2.5.2/json-smart-2.5.2.pom (10 kB at 261 kB/s)
2025-Nov-07 15:43:26.341920
#20 45.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/minidev/accessors-smart/2.5.2/accessors-smart-2.5.2.pom
2025-Nov-07 15:43:26.341920
#20 45.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/minidev/accessors-smart/2.5.2/accessors-smart-2.5.2.pom (12 kB at 349 kB/s)
2025-Nov-07 15:43:26.341920
#20 45.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/assertj/assertj-core/3.27.4/assertj-core-3.27.4.pom
2025-Nov-07 15:43:26.341920
#20 45.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/assertj/assertj-core/3.27.4/assertj-core-3.27.4.pom (3.8 kB at 86 kB/s)
2025-Nov-07 15:43:26.341920
#20 45.39 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/awaitility/awaitility/4.2.2/awaitility-4.2.2.pom
2025-Nov-07 15:43:26.341920
#20 45.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/awaitility/awaitility/4.2.2/awaitility-4.2.2.pom (3.5 kB at 118 kB/s)
2025-Nov-07 15:43:26.471132
#20 45.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/awaitility/awaitility-parent/4.2.2/awaitility-parent-4.2.2.pom
2025-Nov-07 15:43:26.471132
#20 45.46 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/awaitility/awaitility-parent/4.2.2/awaitility-parent-4.2.2.pom (11 kB at 278 kB/s)
2025-Nov-07 15:43:26.471132
#20 45.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest/2.1/hamcrest-2.1.pom
2025-Nov-07 15:43:26.471132
#20 45.49 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest/2.1/hamcrest-2.1.pom (1.1 kB at 36 kB/s)
2025-Nov-07 15:43:26.471132
#20 45.51 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest/3.0/hamcrest-3.0.pom
2025-Nov-07 15:43:26.471132
#20 45.54 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest/3.0/hamcrest-3.0.pom (1.6 kB at 56 kB/s)
2025-Nov-07 15:43:26.596317
#20 45.55 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter/5.12.2/junit-jupiter-5.12.2.pom
2025-Nov-07 15:43:26.596317
#20 45.59 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter/5.12.2/junit-jupiter-5.12.2.pom (3.2 kB at 68 kB/s)
2025-Nov-07 15:43:26.596317
#20 45.60 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-params/5.12.2/junit-jupiter-params-5.12.2.pom
2025-Nov-07 15:43:26.596317
#20 45.63 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-params/5.12.2/junit-jupiter-params-5.12.2.pom (3.0 kB at 86 kB/s)
2025-Nov-07 15:43:26.596317
#20 45.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-core/5.17.0/mockito-core-5.17.0.pom
2025-Nov-07 15:43:26.596317
#20 45.67 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-core/5.17.0/mockito-core-5.17.0.pom (2.5 kB at 77 kB/s)
2025-Nov-07 15:43:26.717286
#20 45.68 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-agent/1.15.11/byte-buddy-agent-1.15.11.pom
2025-Nov-07 15:43:26.717286
#20 45.71 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-agent/1.15.11/byte-buddy-agent-1.15.11.pom (12 kB at 316 kB/s)
2025-Nov-07 15:43:26.717286
#20 45.72 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/objenesis/objenesis/3.3/objenesis-3.3.pom
2025-Nov-07 15:43:26.717286
#20 45.75 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/objenesis/objenesis/3.3/objenesis-3.3.pom (3.0 kB at 91 kB/s)
2025-Nov-07 15:43:26.717286
#20 45.75 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/objenesis/objenesis-parent/3.3/objenesis-parent-3.3.pom
2025-Nov-07 15:43:26.717286
#20 45.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/objenesis/objenesis-parent/3.3/objenesis-parent-3.3.pom (19 kB at 518 kB/s)
2025-Nov-07 15:43:26.840945
#20 45.80 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-junit-jupiter/5.17.0/mockito-junit-jupiter-5.17.0.pom
2025-Nov-07 15:43:26.840945
#20 45.83 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-junit-jupiter/5.17.0/mockito-junit-jupiter-5.17.0.pom (2.3 kB at 79 kB/s)
2025-Nov-07 15:43:26.840945
#20 45.84 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-api/5.11.4/junit-jupiter-api-5.11.4.pom
2025-Nov-07 15:43:26.840945
#20 45.87 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-api/5.11.4/junit-jupiter-api-5.11.4.pom (3.2 kB at 84 kB/s)
2025-Nov-07 15:43:26.840945
#20 45.88 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-commons/1.11.4/junit-platform-commons-1.11.4.pom
2025-Nov-07 15:43:26.840945
#20 45.92 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-commons/1.11.4/junit-platform-commons-1.11.4.pom (2.8 kB at 91 kB/s)
2025-Nov-07 15:43:26.951978
#20 45.92 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/skyscreamer/jsonassert/1.5.3/jsonassert-1.5.3.pom
2025-Nov-07 15:43:26.951978
#20 45.96 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/skyscreamer/jsonassert/1.5.3/jsonassert-1.5.3.pom (7.0 kB at 194 kB/s)
2025-Nov-07 15:43:26.951978
#20 45.96 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.pom
2025-Nov-07 15:43:26.951978
#20 46.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.pom (2.8 kB at 82 kB/s)
2025-Nov-07 15:43:26.951978
#20 46.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/xmlunit/xmlunit-core/2.10.4/xmlunit-core-2.10.4.pom
2025-Nov-07 15:43:26.951978
#20 46.03 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/xmlunit/xmlunit-core/2.10.4/xmlunit-core-2.10.4.pom (2.8 kB at 100 kB/s)
2025-Nov-07 15:43:27.060077
#20 46.03 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/xmlunit/xmlunit-parent/2.10.4/xmlunit-parent-2.10.4.pom
2025-Nov-07 15:43:27.060077
#20 46.06 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/xmlunit/xmlunit-parent/2.10.4/xmlunit-parent-2.10.4.pom (23 kB at 832 kB/s)
2025-Nov-07 15:43:27.060077
#20 46.06 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/2.3.3/jakarta.xml.bind-api-2.3.3.pom
2025-Nov-07 15:43:27.060077
#20 46.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/2.3.3/jakarta.xml.bind-api-2.3.3.pom (13 kB at 298 kB/s)
2025-Nov-07 15:43:27.060077
#20 46.11 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api-parent/2.3.3/jakarta.xml.bind-api-parent-2.3.3.pom
2025-Nov-07 15:43:27.060077
#20 46.14 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api-parent/2.3.3/jakarta.xml.bind-api-parent-2.3.3.pom (9.0 kB at 321 kB/s)
2025-Nov-07 15:43:27.060077
#20 46.14 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/1.2.2/jakarta.activation-api-1.2.2.pom
2025-Nov-07 15:43:27.188188
#20 46.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/1.2.2/jakarta.activation-api-1.2.2.pom (5.3 kB at 111 kB/s)
2025-Nov-07 15:43:27.188188
#20 46.19 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/activation/all/1.2.2/all-1.2.2.pom
2025-Nov-07 15:43:27.188188
#20 46.22 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/activation/all/1.2.2/all-1.2.2.pom (15 kB at 505 kB/s)
2025-Nov-07 15:43:27.188188
#20 46.23 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-test/3.5.6/spring-boot-starter-test-3.5.6.jar
2025-Nov-07 15:43:27.188188
#20 46.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-test/3.5.6/spring-boot-starter-test-3.5.6.jar (4.8 kB at 145 kB/s)
2025-Nov-07 15:43:27.188188
#20 46.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-test/3.5.6/spring-boot-test-3.5.6.jar
2025-Nov-07 15:43:27.301987
#20 46.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-test-autoconfigure/3.5.6/spring-boot-test-autoconfigure-3.5.6.jar
2025-Nov-07 15:43:27.301987
#20 46.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar
2025-Nov-07 15:43:27.301987
#20 46.27 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.11/slf4j-api-2.0.11.jar
2025-Nov-07 15:43:27.301987
#20 46.28 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar
2025-Nov-07 15:43:27.301987
#20 46.30 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-test/3.5.6/spring-boot-test-3.5.6.jar (257 kB at 6.1 MB/s)
2025-Nov-07 15:43:27.301987
#20 46.30 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar
2025-Nov-07 15:43:27.301987
#20 46.31 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar (277 kB at 7.1 MB/s)
2025-Nov-07 15:43:27.301987
#20 46.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/minidev/json-smart/2.5.2/json-smart-2.5.2.jar
2025-Nov-07 15:43:27.301987
#20 46.31 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-test-autoconfigure/3.5.6/spring-boot-test-autoconfigure-3.5.6.jar (229 kB at 5.0 MB/s)
2025-Nov-07 15:43:27.301987
#20 46.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/minidev/accessors-smart/2.5.2/accessors-smart-2.5.2.jar
2025-Nov-07 15:43:27.301987
#20 46.31 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar (131 kB at 3.3 MB/s)
2025-Nov-07 15:43:27.301987
#20 46.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/assertj/assertj-core/3.27.4/assertj-core-3.27.4.jar
2025-Nov-07 15:43:27.301987
#20 46.32 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/2.0.11/slf4j-api-2.0.11.jar (68 kB at 1.4 MB/s)
2025-Nov-07 15:43:27.301987
#20 46.32 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/awaitility/awaitility/4.2.2/awaitility-4.2.2.jar
2025-Nov-07 15:43:27.301987
#20 46.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/minidev/accessors-smart/2.5.2/accessors-smart-2.5.2.jar (30 kB at 482 kB/s)
2025-Nov-07 15:43:27.301987
#20 46.34 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar (67 kB at 1.1 MB/s)
2025-Nov-07 15:43:27.301987
#20 46.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest/3.0/hamcrest-3.0.jar
2025-Nov-07 15:43:27.301987
#20 46.34 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter/5.12.2/junit-jupiter-5.12.2.jar
2025-Nov-07 15:43:27.301987
#20 46.35 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/minidev/json-smart/2.5.2/json-smart-2.5.2.jar (122 kB at 1.8 MB/s)
2025-Nov-07 15:43:27.301987
#20 46.35 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-params/5.12.2/junit-jupiter-params-5.12.2.jar
2025-Nov-07 15:43:27.301987
#20 46.35 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/awaitility/awaitility/4.2.2/awaitility-4.2.2.jar (97 kB at 1.3 MB/s)
2025-Nov-07 15:43:27.301987
#20 46.35 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-core/5.17.0/mockito-core-5.17.0.jar
2025-Nov-07 15:43:27.301987
#20 46.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/assertj/assertj-core/3.27.4/assertj-core-3.27.4.jar (1.4 MB at 17 MB/s)
2025-Nov-07 15:43:27.301987
#20 46.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-agent/1.15.11/byte-buddy-agent-1.15.11.jar
2025-Nov-07 15:43:27.301987
#20 46.37 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter/5.12.2/junit-jupiter-5.12.2.jar (6.4 kB at 68 kB/s)
2025-Nov-07 15:43:27.301987
#20 46.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/objenesis/objenesis/3.3/objenesis-3.3.jar
2025-Nov-07 15:43:27.421256
#20 ...
2025-Nov-07 15:43:27.421256
2025-Nov-07 15:43:27.421256
#22 [frontend-builder 6/6] RUN npm run build -- --configuration production
2025-Nov-07 15:43:27.421256
#22 30.56 ✔ Building...
2025-Nov-07 15:43:27.421256
#22 30.56 Initial chunk files   | Names                        |  Raw size | Estimated transfer size
2025-Nov-07 15:43:27.421256
#22 30.56 main-FRL2UA27.js      | main                         | 348.11 kB |                57.23 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-PSUXYDOU.js     | -                            | 200.43 kB |                57.67 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-ZJX64P6T.js     | -                            |  92.28 kB |                23.29 kB
2025-Nov-07 15:43:27.421256
#22 30.56 styles-TQZYBAIC.css   | styles                       |  49.03 kB |                 6.67 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-YRINKWGA.js     | -                            |  46.62 kB |                 9.54 kB
2025-Nov-07 15:43:27.421256
#22 30.56 polyfills-5CFQRCPP.js | polyfills                    |  34.59 kB |                11.33 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-VTVUKKZY.js     | -                            |  13.84 kB |                 2.51 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-RBSXOYAN.js     | -                            |   2.26 kB |               771 bytes
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-YTNHQDYO.js     | -                            |   1.55 kB |               456 bytes
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-WEQE5ES6.js     | -                            | 756 bytes |               756 bytes
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-QSDZHC3G.js     | -                            | 647 bytes |               647 bytes
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-KFMBRQK2.js     | -                            | 324 bytes |               324 bytes
2025-Nov-07 15:43:27.421256
#22 30.56
2025-Nov-07 15:43:27.421256
#22 30.56                       | Initial total                | 790.42 kB |               171.20 kB
2025-Nov-07 15:43:27.421256
#22 30.56
2025-Nov-07 15:43:27.421256
#22 30.56 Lazy chunk files      | Names                        |  Raw size | Estimated transfer size
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-IX4CADQA.js     | analytics-component          | 219.31 kB |                65.11 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-FSWR2AMN.js     | menus-component              |  27.24 kB |                 6.23 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-KYUAUH3O.js     | admin-layout-component       |  20.17 kB |                 5.45 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-HIKLOENR.js     | active-orders-component      |  19.38 kB |                 4.79 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-MYLELQ6E.js     | stock-alerts-component       |  14.74 kB |                 3.78 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-VAGQRUEW.js     | tables-component             |  14.20 kB |                 3.88 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-WJG74D5Y.js     | cash-operations-component    |  13.80 kB |                 3.60 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-AMP5O6AC.js     | categories-list-component    |  12.49 kB |                 3.49 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-J5YR7TXX.js     | active-sessions-component    |   7.88 kB |                 2.57 kB
2025-Nov-07 15:43:27.421256
#22 30.56 chunk-LPAYH3FI.js     | cashier-assignment-component |   7.78 kB |                 2.52 kB
2025-Nov-07 15:43:27.421256
#22 30.56
2025-Nov-07 15:43:27.421256
#22 30.56 Application bundle generation complete. [28.853 seconds] - 2025-11-07T15:43:27.206Z
2025-Nov-07 15:43:27.421256
#22 30.56
2025-Nov-07 15:43:27.421256
#22 30.57 ▲ [WARNING] bundle initial exceeded maximum budget. Budget 500.00 kB was not met by 290.42 kB with a total of 790.42 kB.
2025-Nov-07 15:43:27.421256
#22 30.57
2025-Nov-07 15:43:27.421256
#22 30.57
2025-Nov-07 15:43:27.421256
#22 30.57 ▲ [WARNING] src/app/features/public/public-menu.component.css exceeded maximum budget. Budget 10.00 kB was not met by 929 bytes with a total of 10.93 kB.
2025-Nov-07 15:43:27.421256
#22 30.57
2025-Nov-07 15:43:27.421256
#22 30.57
2025-Nov-07 15:43:27.421256
#22 30.58 Output location: /app/frontend/dist/sellia-app
2025-Nov-07 15:43:27.421256
#22 30.58
2025-Nov-07 15:43:27.421256
#22 DONE 30.7s
2025-Nov-07 15:43:27.421256
2025-Nov-07 15:43:27.421256
#20 [backend-builder 6/9] RUN mvn dependency:go-offline -B
2025-Nov-07 15:43:27.421256
#20 46.38 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest/3.0/hamcrest-3.0.jar (126 kB at 1.3 MB/s)
2025-Nov-07 15:43:27.421256
#20 46.38 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-junit-jupiter/5.17.0/mockito-junit-jupiter-5.17.0.jar
2025-Nov-07 15:43:27.421256
#20 46.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-agent/1.15.11/byte-buddy-agent-1.15.11.jar (365 kB at 3.0 MB/s)
2025-Nov-07 15:43:27.421256
#20 46.40 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/skyscreamer/jsonassert/1.5.3/jsonassert-1.5.3.jar
2025-Nov-07 15:43:27.421256
#20 46.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/junit/jupiter/junit-jupiter-params/5.12.2/junit-jupiter-params-5.12.2.jar (602 kB at 4.7 MB/s)
2025-Nov-07 15:43:27.421256
#20 46.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-core/5.17.0/mockito-core-5.17.0.jar (709 kB at 5.6 MB/s)
2025-Nov-07 15:43:27.421256
#20 46.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar
2025-Nov-07 15:43:27.421256
#20 46.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/xmlunit/xmlunit-core/2.10.4/xmlunit-core-2.10.4.jar
2025-Nov-07 15:43:27.421256
#20 46.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/objenesis/objenesis/3.3/objenesis-3.3.jar (49 kB at 383 kB/s)
2025-Nov-07 15:43:27.421256
#20 46.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/mockito/mockito-junit-jupiter/5.17.0/mockito-junit-jupiter-5.17.0.jar (9.4 kB at 67 kB/s)
2025-Nov-07 15:43:27.421256
#20 46.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar (18 kB at 109 kB/s)
2025-Nov-07 15:43:27.421256
#20 46.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/skyscreamer/jsonassert/1.5.3/jsonassert-1.5.3.jar (31 kB at 179 kB/s)
2025-Nov-07 15:43:27.421256
#20 46.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/xmlunit/xmlunit-core/2.10.4/xmlunit-core-2.10.4.jar (178 kB at 1.0 MB/s)
2025-Nov-07 15:43:27.421256
#20 46.47 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-security/3.5.6/spring-boot-starter-security-3.5.6.pom
2025-Nov-07 15:43:27.421256
#20 46.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-security/3.5.6/spring-boot-starter-security-3.5.6.pom (2.7 kB at 92 kB/s)
2025-Nov-07 15:43:27.543312
#20 46.50 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-config/6.5.5/spring-security-config-6.5.5.pom
2025-Nov-07 15:43:27.543312
#20 46.53 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-config/6.5.5/spring-security-config-6.5.5.pom (2.8 kB at 95 kB/s)
2025-Nov-07 15:43:27.543312
#20 46.54 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-security/3.5.6/spring-boot-starter-security-3.5.6.jar
2025-Nov-07 15:43:27.543312
#20 46.57 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-security/3.5.6/spring-boot-starter-security-3.5.6.jar (4.7 kB at 153 kB/s)
2025-Nov-07 15:43:27.543312
#20 46.57 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-config/6.5.5/spring-security-config-6.5.5.jar
2025-Nov-07 15:43:27.543312
#20 46.62 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-config/6.5.5/spring-security-config-6.5.5.jar (2.1 MB at 42 MB/s)
2025-Nov-07 15:43:27.683631
#20 46.63 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/itext7-core/7.2.5/itext7-core-7.2.5.pom
2025-Nov-07 15:43:27.683631
#20 46.66 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/itext7-core/7.2.5/itext7-core-7.2.5.pom (4.6 kB at 159 kB/s)
2025-Nov-07 15:43:27.683631
#20 46.67 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/barcodes/7.2.5/barcodes-7.2.5.pom
2025-Nov-07 15:43:27.683631
#20 46.69 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/barcodes/7.2.5/barcodes-7.2.5.pom (1.5 kB at 62 kB/s)
2025-Nov-07 15:43:27.683631
#20 46.69 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/root/7.2.5/root-7.2.5.pom
2025-Nov-07 15:43:27.683631
#20 46.76 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/root/7.2.5/root-7.2.5.pom (26 kB at 395 kB/s)
2025-Nov-07 15:43:27.786906
#20 46.76 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/kernel/7.2.5/kernel-7.2.5.pom
2025-Nov-07 15:43:27.812694
#20 46.79 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/kernel/7.2.5/kernel-7.2.5.pom (2.1 kB at 78 kB/s)
2025-Nov-07 15:43:27.812694
#20 46.79 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/io/7.2.5/io-7.2.5.pom
2025-Nov-07 15:43:27.812694
#20 46.82 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/io/7.2.5/io-7.2.5.pom (1.5 kB at 49 kB/s)
2025-Nov-07 15:43:27.812694
#20 46.83 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/commons/7.2.5/commons-7.2.5.pom
2025-Nov-07 15:43:27.812694
#20 46.86 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/commons/7.2.5/commons-7.2.5.pom (1.6 kB at 59 kB/s)
2025-Nov-07 15:43:27.812694
#20 46.86 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcpkix-jdk15on/1.70/bcpkix-jdk15on-1.70.pom
2025-Nov-07 15:43:27.891616
#20 46.90 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcpkix-jdk15on/1.70/bcpkix-jdk15on-1.70.pom (1.6 kB at 50 kB/s)
2025-Nov-07 15:43:27.891616
#20 46.90 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcprov-jdk15on/1.70/bcprov-jdk15on-1.70.pom
2025-Nov-07 15:43:27.891616
#20 46.94 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcprov-jdk15on/1.70/bcprov-jdk15on-1.70.pom (1.1 kB at 30 kB/s)
2025-Nov-07 15:43:27.891616
#20 46.94 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcutil-jdk15on/1.70/bcutil-jdk15on-1.70.pom
2025-Nov-07 15:43:27.891616
#20 46.97 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcutil-jdk15on/1.70/bcutil-jdk15on-1.70.pom (1.3 kB at 49 kB/s)
2025-Nov-07 15:43:28.005498
#20 46.97 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/font-asian/7.2.5/font-asian-7.2.5.pom
2025-Nov-07 15:43:28.005498
#20 47.00 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/font-asian/7.2.5/font-asian-7.2.5.pom (1.5 kB at 50 kB/s)
2025-Nov-07 15:43:28.005498
#20 47.00 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/forms/7.2.5/forms-7.2.5.pom
2025-Nov-07 15:43:28.005498
#20 47.08 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/forms/7.2.5/forms-7.2.5.pom (2.3 kB at 29 kB/s)
2025-Nov-07 15:43:28.116457
#20 47.08 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/layout/7.2.5/layout-7.2.5.pom
2025-Nov-07 15:43:28.116457
#20 47.11 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/layout/7.2.5/layout-7.2.5.pom (1.7 kB at 54 kB/s)
2025-Nov-07 15:43:28.116457
#20 47.12 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/hyph/7.2.5/hyph-7.2.5.pom
2025-Nov-07 15:43:28.116457
#20 47.16 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/hyph/7.2.5/hyph-7.2.5.pom (1.5 kB at 38 kB/s)
2025-Nov-07 15:43:28.116457
#20 47.16 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/pdfa/7.2.5/pdfa-7.2.5.pom
2025-Nov-07 15:43:28.116457
#20 47.19 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/pdfa/7.2.5/pdfa-7.2.5.pom (1.8 kB at 64 kB/s)
2025-Nov-07 15:43:28.219277
#20 47.20 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/sign/7.2.5/sign-7.2.5.pom
2025-Nov-07 15:43:28.219277
#20 47.23 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/sign/7.2.5/sign-7.2.5.pom (2.4 kB at 71 kB/s)
2025-Nov-07 15:43:28.219277
#20 47.23 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/styled-xml-parser/7.2.5/styled-xml-parser-7.2.5.pom
2025-Nov-07 15:43:28.219277
#20 47.26 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/styled-xml-parser/7.2.5/styled-xml-parser-7.2.5.pom (1.9 kB at 66 kB/s)
2025-Nov-07 15:43:28.219277
#20 47.26 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/svg/7.2.5/svg-7.2.5.pom
2025-Nov-07 15:43:28.219277
#20 47.29 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/svg/7.2.5/svg-7.2.5.pom (2.0 kB at 62 kB/s)
2025-Nov-07 15:43:28.327389
#20 47.31 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/barcodes/7.2.5/barcodes-7.2.5.jar
2025-Nov-07 15:43:28.327389
#20 47.36 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/barcodes/7.2.5/barcodes-7.2.5.jar (151 kB at 3.0 MB/s)
2025-Nov-07 15:43:28.327389
#20 47.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/font-asian/7.2.5/font-asian-7.2.5.jar
2025-Nov-07 15:43:28.327389
#20 47.36 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/forms/7.2.5/forms-7.2.5.jar
2025-Nov-07 15:43:28.327389
#20 47.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/hyph/7.2.5/hyph-7.2.5.jar
2025-Nov-07 15:43:28.327389
#20 47.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/io/7.2.5/io-7.2.5.jar
2025-Nov-07 15:43:28.327389
#20 47.37 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/commons/7.2.5/commons-7.2.5.jar
2025-Nov-07 15:43:28.327389
#20 47.40 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/forms/7.2.5/forms-7.2.5.jar (134 kB at 3.4 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/kernel/7.2.5/kernel-7.2.5.jar
2025-Nov-07 15:43:28.433078
#20 47.41 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/commons/7.2.5/commons-7.2.5.jar (92 kB at 2.6 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.41 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcpkix-jdk15on/1.70/bcpkix-jdk15on-1.70.jar
2025-Nov-07 15:43:28.433078
#20 47.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/hyph/7.2.5/hyph-7.2.5.jar (984 kB at 21 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcutil-jdk15on/1.70/bcutil-jdk15on-1.70.jar
2025-Nov-07 15:43:28.433078
#20 47.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/io/7.2.5/io-7.2.5.jar (807 kB at 16 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcprov-jdk15on/1.70/bcprov-jdk15on-1.70.jar
2025-Nov-07 15:43:28.433078
#20 47.42 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/font-asian/7.2.5/font-asian-7.2.5.jar (2.4 MB at 40 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.42 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/layout/7.2.5/layout-7.2.5.jar
2025-Nov-07 15:43:28.433078
#20 47.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcpkix-jdk15on/1.70/bcpkix-jdk15on-1.70.jar (964 kB at 12 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/pdfa/7.2.5/pdfa-7.2.5.jar
2025-Nov-07 15:43:28.433078
#20 47.45 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcutil-jdk15on/1.70/bcutil-jdk15on-1.70.jar (483 kB at 5.8 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.45 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/sign/7.2.5/sign-7.2.5.jar
2025-Nov-07 15:43:28.433078
#20 47.46 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/kernel/7.2.5/kernel-7.2.5.jar (1.2 MB at 14 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.46 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/styled-xml-parser/7.2.5/styled-xml-parser-7.2.5.jar
2025-Nov-07 15:43:28.433078
#20 47.47 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/layout/7.2.5/layout-7.2.5.jar (548 kB at 5.3 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.47 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/itextpdf/svg/7.2.5/svg-7.2.5.jar
2025-Nov-07 15:43:28.433078
#20 47.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/pdfa/7.2.5/pdfa-7.2.5.jar (57 kB at 505 kB/s)
2025-Nov-07 15:43:28.433078
#20 47.48 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/sign/7.2.5/sign-7.2.5.jar (132 kB at 1.2 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/bouncycastle/bcprov-jdk15on/1.70/bcprov-jdk15on-1.70.jar (5.9 MB at 46 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.50 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/styled-xml-parser/7.2.5/styled-xml-parser-7.2.5.jar (613 kB at 4.7 MB/s)
2025-Nov-07 15:43:28.433078
#20 47.51 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/itextpdf/svg/7.2.5/svg-7.2.5.jar (166 kB at 1.2 MB/s)
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: jetty-servlet-9.4.46.v20220331.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-install-plugin-3.1.4.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: spring-boot-buildpack-platform-3.5.6.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: asm-9.7.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: doxia-module-twiki-1.11.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: velocity-tools-2.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-gfm-tasklist-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-resolver-api-1.9.22.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-admonition-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: jackson-databind-2.19.2.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-core-3.2.5.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-footnotes-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-gfm-strikethrough-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-media-tags-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: doxia-module-xhtml-1.11.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: spring-aop-6.2.11.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-util-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-anchorlink-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-resolver-util-1.9.22.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: aether-api-1.0.0.v20140518.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: autolink-0.6.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-filtering-3.3.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: asm-commons-9.7.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: spring-expression-6.2.11.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-archiver-3.6.2.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: doxia-skin-model-1.11.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: dom4j-1.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: plexus-compiler-api-2.15.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: spring-jcl-6.2.11.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: commons-io-2.16.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-youtrack-converter-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: httpclient5-5.5.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: surefire-extensions-api-3.5.4.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: tomlj-1.0.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: httpclient-4.5.13.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-toc-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: surefire-api-3.5.4.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: asm-9.8.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: jetty-http-9.4.46.v20220331.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-jira-converter-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-reporting-api-3.1.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-plugin-api-3.2.5.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: sisu-guice-3.2.3-no_aop.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: commons-codec-1.17.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-attributes-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: commons-lang3-3.8.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-aether-provider-3.2.5.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: aether-util-1.0.0.v20140518.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: jetty-security-9.4.46.v20220331.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: httpcore5-5.3.4.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-common-artifact-filters-3.4.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: org.eclipse.sisu.plexus-0.3.5.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: spring-context-6.2.11.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: doxia-core-1.11.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-ins-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: google-collections-1.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-emoji-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: doxia-integration-tools-1.11.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-resolver-api-1.4.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: plexus-compiler-manager-2.15.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-repository-metadata-3.2.5.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-ext-jekyll-front-matter-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: doxia-decoration-model-1.11.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: flexmark-all-0.42.14.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: asm-9.7.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-shared-incremental-1.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: file-management-3.1.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: commons-compress-1.26.1.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: jetty-webapp-9.4.46.v20220331.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: plexus-io-3.2.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: xbean-reflect-3.7.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: maven-reporting-exec-1.6.0.jar
2025-Nov-07 15:43:28.535911
#20 47.52 [INFO] Resolved plugin: doxia-sink-api-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jetty-xml-9.4.46.v20220331.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-velocity-1.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-container-default-2.1.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-codec-1.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: snappy-0.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-deploy-plugin-3.1.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jsr305-3.0.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jackson-core-2.19.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-build-api-0.0.7.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: doxia-module-fml-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-digester-1.8.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jetty-server-9.4.46.v20220331.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-shared-utils-3.4.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-abbreviation-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-archiver-3.5.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-definition-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: zstd-jni-1.5.5-11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: doxia-logging-api-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-xml-3.0.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-yaml-front-matter-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-surefire-plugin-3.5.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-site-plugin-3.12.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jna-5.17.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-superscript-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-collections-3.2.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: surefire-shared-utils-3.5.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: doxia-module-markdown-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-xwiki-macros-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-java-1.4.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-compress-1.20.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: velocity-1.7.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-resources-plugin-3.3.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-utils-3.5.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: spring-core-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: surefire-extensions-spi-3.5.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: aopalliance-1.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: aether-spi-1.0.0.v20140518.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-interpolation-1.26.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-settings-builder-3.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: httpcore-4.4.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: micrometer-commons-1.14.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-lang3-3.12.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-surefire-common-3.5.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-artifact-3.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-compiler-javac-2.15.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-enumerated-reference-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-component-annotations-2.1.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: asm-tree-9.7.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-logging-1.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-escaped-character-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: spring-boot-maven-plugin-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jdependency-2.10.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-cipher-1.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-utils-3.4.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-aside-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-wikilink-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: surefire-logger-api-3.5.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: org.eclipse.sisu.inject-0.3.5.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-io-3.4.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-gfm-tables-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: micrometer-observation-1.14.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: antlr4-runtime-4.7.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-interpolation-1.27.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-io-2.11.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jetty-io-9.4.46.v20220331.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: cdi-api-1.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-chain-1.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-compiler-plugin-3.14.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-codec-1.16.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-html-parser-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: javax.inject-1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-shared-utils-3.3.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: javax.servlet-api-3.1.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jetty-util-ajax-9.4.46.v20220331.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-settings-3.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jackson-module-parameter-names-2.19.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jsoup-1.10.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: oro-2.0.8.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: xz-1.9.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: aether-impl-1.0.0.v20140518.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-text-1.3.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-lang-2.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: slf4j-api-1.7.36.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: doxia-module-apt-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-resolver-util-1.4.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-gfm-issues-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jetty-util-9.4.46.v20220331.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-model-builder-3.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-archiver-4.2.7.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-jar-plugin-3.4.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-io-2.6.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-shade-plugin-3.6.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-youtube-embedded-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-formatter-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-model-3.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-utils-4.0.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jdom2-2.0.6.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-profile-pegdown-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: doxia-module-docbook-simple-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jackson-annotations-2.19.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-lang3-3.16.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: guava-16.0.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-typographic-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-autolink-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-jekyll-tag-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-gitlab-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-compress-1.27.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: doxia-module-xdoc-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: doxia-site-renderer-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-beanutils-1.7.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: commons-lang3-3.14.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-classworlds-2.5.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: doxia-module-confluence-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: doxia-module-xhtml5-1.11.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-tables-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: javax.annotation-api-1.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: httpcore5-h2-5.3.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-macros-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: jna-platform-5.17.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-sec-dispatcher-1.3.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-java-1.5.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-i18n-1.0-beta-10.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: flexmark-ext-gfm-users-0.42.14.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: qdox-2.2.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: spring-boot-loader-tools-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: maven-clean-plugin-3.4.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: plexus-archiver-4.9.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: surefire-booter-3.5.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved plugin: spring-beans-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-core-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-aspects-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: tomcat-embed-websocket-10.1.46.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: lombok-1.18.40.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: sign-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: hamcrest-3.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: bcprov-jdk15on-1.70.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-data-jpa-3.5.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: json-smart-2.5.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jai-imageio-core-1.4.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: log4j-to-slf4j-2.24.3.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: slf4j-api-2.0.17.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: junit-jupiter-params-5.12.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: micrometer-commons-1.14.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jaxb-core-4.0.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: styled-xml-parser-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-boot-starter-data-jpa-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jackson-databind-2.19.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jakarta.activation-api-2.1.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: accessors-smart-2.5.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jcommander-1.82.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: junit-jupiter-api-5.12.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: mockito-core-5.17.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jul-to-slf4j-2.0.17.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-aop-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-boot-starter-websocket-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: micrometer-observation-1.15.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-messaging-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: opentest4j-1.3.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-boot-starter-tomcat-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-expression-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jandex-3.2.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-security-crypto-6.5.5.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: junit-jupiter-engine-5.12.2.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: micrometer-commons-1.15.4.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-boot-test-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-boot-starter-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-jcl-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jakarta.transaction-api-2.0.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jna-4.5.1.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: angus-activation-2.0.0.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-jdbc-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: spring-websocket-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: jackson-core-2.12.7.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: hibernate-validator-8.0.3.Final.jar
2025-Nov-07 15:43:28.551344
#20 47.52 [INFO] Resolved dependency: micrometer-observation-1.14.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-security-test-6.5.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-security-core-6.5.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: junit-jupiter-5.12.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jackson-datatype-jdk8-2.19.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-actuator-autoconfigure-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: assertj-core-3.27.4.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: txw2-4.0.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-security-web-6.5.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: junit-platform-commons-1.12.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-data-commons-3.5.4.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: HdrHistogram-2.2.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: waffle-jna-1.9.1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: font-asian-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: pdfa-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: istack-commons-runtime-4.1.1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jboss-logging-3.5.0.Final.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: layout-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: micrometer-core-1.15.4.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: junit-platform-engine-1.12.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-security-config-6.5.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: slf4j-api-2.0.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jackson-module-parameter-names-2.19.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jackson-databind-2.12.7.1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-web-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jjwt-impl-0.12.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-autoconfigure-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-tx-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: log4j-api-2.24.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: classmate-1.5.1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jakarta.xml.bind-api-4.0.0.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-starter-security-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-actuator-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-context-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: commons-lang3-3.17.0.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: slf4j-api-2.0.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jboss-logging-3.4.3.Final.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: snakeyaml-2.4.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-webmvc-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: aspectjweaver-1.9.22.1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jackson-datatype-jsr310-2.19.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: objenesis-3.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: slf4j-api-1.7.36.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: antlr4-runtime-4.13.0.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-starter-logging-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: core-3.5.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: tomcat-embed-el-10.1.46.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: hyph-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jcl-over-slf4j-1.7.25.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: barcodes-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: io-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: asm-9.7.1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: mockito-junit-jupiter-5.17.0.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: caffeine-2.6.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: junit-4.13.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: hibernate-core-6.6.29.Final.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: hamcrest-core-1.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: logback-classic-1.5.18.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: commons-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jakarta.persistence-api-3.1.0.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: javase-3.5.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jackson-annotations-2.19.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-starter-jdbc-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-test-autoconfigure-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jakarta.activation-api-2.1.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: bcpkix-jdk15on-1.70.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jsonassert-1.5.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-starter-actuator-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: logback-core-1.5.18.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jakarta.validation-api-3.0.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jackson-core-2.19.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: micrometer-jakarta9-1.15.4.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jakarta.xml.bind-api-4.0.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: forms-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: tomcat-embed-core-10.1.46.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: xmlunit-core-2.10.4.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: svg-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jakarta.annotation-api-2.1.1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-starter-json-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jaxb-runtime-4.0.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: awaitility-4.2.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jakarta.inject-api-2.0.1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-starter-test-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jackson-annotations-2.12.7.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jna-platform-4.5.1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: postgresql-42.7.7.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-starter-web-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: itext7-core-7.2.5.pom
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jjwt-api-0.12.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: json-path-2.9.0.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: hibernate-commons-annotations-7.0.3.Final.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: apiguardian-api-1.1.2.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: byte-buddy-agent-1.15.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: byte-buddy-1.15.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: slf4j-api-1.7.25.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: LatencyUtils-2.0.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: checker-qual-3.49.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-orm-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-boot-starter-validation-3.5.6.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: android-json-0.0.20131108.vaadin1.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: jjwt-jackson-0.12.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-beans-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: HikariCP-6.3.3.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: kernel-7.2.5.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: bcutil-jdk15on-1.70.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Resolved dependency: spring-test-6.2.11.jar
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] ------------------------------------------------------------------------
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] BUILD SUCCESS
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] ------------------------------------------------------------------------
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Total time:  44.470 s
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] Finished at: 2025-11-07T15:43:28Z
2025-Nov-07 15:43:28.551344
#20 47.53 [INFO] ------------------------------------------------------------------------
2025-Nov-07 15:43:28.551344
#20 DONE 47.6s
2025-Nov-07 15:43:28.551344
2025-Nov-07 15:43:28.551344
#23 [backend-builder 7/9] COPY sellia-backend/src ./src
2025-Nov-07 15:43:28.652234
#23 DONE 0.1s
2025-Nov-07 15:43:28.841676
#24 [backend-builder 8/9] COPY --from=frontend-builder /app/frontend/dist/sellia-app/browser ./src/main/resources/static
2025-Nov-07 15:43:28.841676
#24 DONE 0.0s
2025-Nov-07 15:43:28.841676
2025-Nov-07 15:43:28.841676
#25 [backend-builder 9/9] RUN mvn clean package -DskipTests -B
2025-Nov-07 15:43:30.496310
#25 1.804 [INFO] Scanning for projects...
2025-Nov-07 15:43:30.903380
#25 2.213 [INFO]
2025-Nov-07 15:43:31.057486
#25 2.216 [INFO] -------------------< com.follysitou:sellia-backend >--------------------
2025-Nov-07 15:43:31.057486
#25 2.216 [INFO] Building sellia-backend 0.0.1-SNAPSHOT
2025-Nov-07 15:43:31.057486
#25 2.216 [INFO]   from pom.xml
2025-Nov-07 15:43:31.057486
#25 2.216 [INFO] --------------------------------[ jar ]---------------------------------
2025-Nov-07 15:43:31.521328
#25 2.831 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.6.1.Final/jboss-logging-3.6.1.Final.pom
2025-Nov-07 15:43:32.299610
#25 3.609 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.6.1.Final/jboss-logging-3.6.1.Final.pom (18 kB at 23 kB/s)
2025-Nov-07 15:43:32.311578
2025-Nov-07 15:43:32.408174
#25 3.631 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/logging/logging-parent/1.0.3.Final/logging-parent-1.0.3.Final.pom
2025-Nov-07 15:43:32.408174
#25 3.671 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/logging/logging-parent/1.0.3.Final/logging-parent-1.0.3.Final.pom (5.7 kB at 142 kB/s)
2025-Nov-07 15:43:32.408174
#25 3.673 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/jboss-parent/42/jboss-parent-42.pom
2025-Nov-07 15:43:32.408174
#25 3.717 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/jboss-parent/42/jboss-parent-42.pom (76 kB at 1.8 MB/s)
2025-Nov-07 15:43:32.529220
#25 3.748 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/classmate/1.7.0/classmate-1.7.0.pom
2025-Nov-07 15:43:32.529220
#25 3.793 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/classmate/1.7.0/classmate-1.7.0.pom (7.0 kB at 157 kB/s)
2025-Nov-07 15:43:32.529220
#25 3.797 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/56/oss-parent-56.pom
2025-Nov-07 15:43:32.529220
#25 3.838 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/oss-parent/56/oss-parent-56.pom (24 kB at 575 kB/s)
2025-Nov-07 15:43:32.634860
#25 3.847 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy/1.17.7/byte-buddy-1.17.7.pom
2025-Nov-07 15:43:32.634860
#25 3.885 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy/1.17.7/byte-buddy-1.17.7.pom (19 kB at 497 kB/s)
2025-Nov-07 15:43:32.634860
#25 3.889 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-parent/1.17.7/byte-buddy-parent-1.17.7.pom
2025-Nov-07 15:43:32.634860
#25 3.932 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-parent/1.17.7/byte-buddy-parent-1.17.7.pom (65 kB at 1.5 MB/s)
2025-Nov-07 15:43:32.634860
#25 3.942 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.4/jakarta.activation-api-2.1.4.pom
2025-Nov-07 15:43:32.737696
#25 3.998 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.4/jakarta.activation-api-2.1.4.pom (19 kB at 331 kB/s)
2025-Nov-07 15:43:32.737696
#25 4.007 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.pom
2025-Nov-07 15:43:32.737696
#25 4.047 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.pom (11 kB at 278 kB/s)
2025-Nov-07 15:43:32.845041
#25 4.057 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-runtime-parent/4.0.5/jaxb-runtime-parent-4.0.5.pom
2025-Nov-07 15:43:32.845041
#25 4.109 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-runtime-parent/4.0.5/jaxb-runtime-parent-4.0.5.pom (1.2 kB at 21 kB/s)
2025-Nov-07 15:43:32.845041
#25 4.112 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-parent/4.0.5/jaxb-parent-4.0.5.pom
2025-Nov-07 15:43:32.845041
#25 4.152 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-parent/4.0.5/jaxb-parent-4.0.5.pom (35 kB at 875 kB/s)
2025-Nov-07 15:43:32.957858
#25 4.165 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/jaxb-bom-ext/4.0.5/jaxb-bom-ext-4.0.5.pom
2025-Nov-07 15:43:32.957858
#25 4.213 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/jaxb-bom-ext/4.0.5/jaxb-bom-ext-4.0.5.pom (3.5 kB at 76 kB/s)
2025-Nov-07 15:43:32.957858
#25 4.229 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.pom
2025-Nov-07 15:43:32.957858
#25 4.266 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.pom (3.7 kB at 98 kB/s)
2025-Nov-07 15:43:33.093277
#25 4.276 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.pom
2025-Nov-07 15:43:33.093277
#25 4.317 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.pom (4.0 kB at 95 kB/s)
2025-Nov-07 15:43:33.093277
#25 4.320 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation-project/2.0.2/angus-activation-project-2.0.2.pom
2025-Nov-07 15:43:33.093277
#25 4.360 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation-project/2.0.2/angus-activation-project-2.0.2.pom (21 kB at 522 kB/s)
2025-Nov-07 15:43:33.093277
#25 4.365 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.pom
2025-Nov-07 15:43:33.093277
#25 4.403 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.pom (1.8 kB at 47 kB/s)
2025-Nov-07 15:43:33.215286
#25 4.406 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-txw-parent/4.0.5/jaxb-txw-parent-4.0.5.pom
2025-Nov-07 15:43:33.215286
#25 4.438 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/xml/bind/mvn/jaxb-txw-parent/4.0.5/jaxb-txw-parent-4.0.5.pom (1.2 kB at 36 kB/s)
2025-Nov-07 15:43:33.215286
#25 4.447 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.pom
2025-Nov-07 15:43:33.215286
#25 4.483 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.pom (1.6 kB at 45 kB/s)
2025-Nov-07 15:43:33.215286
#25 4.488 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons/4.1.2/istack-commons-4.1.2.pom
2025-Nov-07 15:43:33.215286
#25 4.524 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons/4.1.2/istack-commons-4.1.2.pom (26 kB at 731 kB/s)
2025-Nov-07 15:43:33.336721
#25 4.601 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/aspectj/aspectjweaver/1.9.24/aspectjweaver-1.9.24.pom
2025-Nov-07 15:43:33.336721
#25 4.646 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/aspectj/aspectjweaver/1.9.24/aspectjweaver-1.9.24.pom (2.2 kB at 49 kB/s)
2025-Nov-07 15:43:33.589498
#25 4.899 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-agent/1.17.7/byte-buddy-agent-1.17.7.pom
2025-Nov-07 15:43:33.744580
#25 4.931 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-agent/1.17.7/byte-buddy-agent-1.17.7.pom (14 kB at 399 kB/s)
2025-Nov-07 15:43:33.744580
#25 5.054 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.6.1.Final/jboss-logging-3.6.1.Final.jar
2025-Nov-07 15:43:33.899412
#25 5.097 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/jboss/logging/jboss-logging/3.6.1.Final/jboss-logging-3.6.1.Final.jar (62 kB at 1.4 MB/s)
2025-Nov-07 15:43:33.899412
#25 5.099 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/fasterxml/classmate/1.7.0/classmate-1.7.0.jar
2025-Nov-07 15:43:33.899412
#25 5.100 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy/1.17.7/byte-buddy-1.17.7.jar
2025-Nov-07 15:43:33.899412
#25 5.100 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar
2025-Nov-07 15:43:33.899412
#25 5.102 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar
2025-Nov-07 15:43:33.899412
#25 5.103 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar
2025-Nov-07 15:43:33.899412
#25 5.207 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar (139 kB at 1.3 MB/s)
2025-Nov-07 15:43:34.002632
#25 5.211 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar
2025-Nov-07 15:43:34.002632
#25 5.212 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar (27 kB at 248 kB/s)
2025-Nov-07 15:43:34.002632
#25 5.212 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar
2025-Nov-07 15:43:34.002632
#25 5.238 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/fasterxml/classmate/1.7.0/classmate-1.7.0.jar (69 kB at 489 kB/s)
2025-Nov-07 15:43:34.002632
#25 5.238 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/org/aspectj/aspectjweaver/1.9.24/aspectjweaver-1.9.24.jar
2025-Nov-07 15:43:34.002632
#25 5.270 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar (73 kB at 436 kB/s)
2025-Nov-07 15:43:34.002632
#25 5.271 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.4/jakarta.activation-api-2.1.4.jar
2025-Nov-07 15:43:34.002632
#25 5.278 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar (26 kB at 147 kB/s)
2025-Nov-07 15:43:34.002632
#25 5.278 [INFO] Downloading from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-agent/1.17.7/byte-buddy-agent-1.17.7.jar
2025-Nov-07 15:43:34.002632
#25 5.303 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar (920 kB at 4.5 MB/s)
2025-Nov-07 15:43:34.002632
#25 5.312 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/jakarta/activation/jakarta.activation-api/2.1.4/jakarta.activation-api-2.1.4.jar (67 kB at 324 kB/s)
2025-Nov-07 15:43:34.144594
#25 5.365 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy-agent/1.17.7/byte-buddy-agent-1.17.7.jar (366 kB at 1.4 MB/s)
2025-Nov-07 15:43:34.144594
#25 5.453 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/org/aspectj/aspectjweaver/1.9.24/aspectjweaver-1.9.24.jar (2.2 MB at 6.3 MB/s)
2025-Nov-07 15:43:34.286265
#25 5.482 [INFO] Downloaded from central: https://repo.maven.apache.org/maven2/net/bytebuddy/byte-buddy/1.17.7/byte-buddy-1.17.7.jar (9.0 MB at 24 MB/s)
2025-Nov-07 15:43:34.286265
#25 5.493 [INFO]
2025-Nov-07 15:43:34.286265
#25 5.493 [INFO] --- clean:3.4.1:clean (default-clean) @ sellia-backend ---
2025-Nov-07 15:43:34.286265
#25 5.595 [INFO]
2025-Nov-07 15:43:34.436057
#25 5.595 [INFO] --- resources:3.3.1:resources (default-resources) @ sellia-backend ---
2025-Nov-07 15:43:34.448983
#25 5.753 [INFO] Copying 1 resource from src/main/resources to target/classes
2025-Nov-07 15:43:34.628230
#25 5.781 [INFO] Copying 27 resources from src/main/resources to target/classes
2025-Nov-07 15:43:34.628230
#25 5.787 [INFO]
2025-Nov-07 15:43:34.628230
#25 5.787 [INFO] --- compiler:3.14.0:compile (default-compile) @ sellia-backend ---
2025-Nov-07 15:43:34.663925
#25 5.973 [INFO] Recompiling the module because of changed source code.
2025-Nov-07 15:43:34.830242
#25 5.988 [INFO] Compiling 218 source files with javac [debug parameters release 21] to target/classes
2025-Nov-07 15:43:45.570002
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Role.java:[27,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Order.java:[39,23] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Order.java:[58,25] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Order.java:[72,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Setting.java:[34,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/User.java:[58,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/User.java:[61,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/User.java:[74,26] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/MenuItem.java:[38,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/MenuItem.java:[49,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/MenuItem.java:[52,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Ticket.java:[38,26] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Cashier.java:[40,27] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Cashier.java:[43,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Category.java:[31,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Category.java:[34,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/OrderItem.java:[63,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/OrderItem.java:[70,25] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/OrderItem.java:[74,29] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Invoice.java:[51,27] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Stock.java:[48,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Product.java:[45,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Product.java:[54,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Product.java:[63,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Product.java:[67,25] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/CashierSession.java:[38,34] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/CashierSession.java:[53,18] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/CashierSession.java:[59,18] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/CashierSession.java:[65,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/GlobalSession.java:[23,33] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/GlobalSession.java:[40,18] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/GlobalSession.java:[46,18] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/CustomerSession.java:[33,23] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/CustomerSession.java:[42,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/CustomerSession.java:[54,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/CustomerSession.java:[69,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/ActiveToken.java:[29,20] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/ActiveToken.java:[35,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[43,20] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[46,20] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[49,20] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[52,20] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[58,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[61,20] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[64,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[67,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[70,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Restaurant.java:[73,18] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/RestaurantTable.java:[38,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/RestaurantTable.java:[41,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/RestaurantTable.java:[53,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Notification.java:[42,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Notification.java:[51,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Menu.java:[43,21] @Builder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default. If it is not supposed to be settable during building, make the field final.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Payment.java:[22,1] Generating equals/hashCode implementation but without a call to superclass, even though this class does not extend java.lang.Object. If this is intentional, add '@EqualsAndHashCode(callSuper=false)' to your type.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/AuditLog.java:[18,1] Generating equals/hashCode implementation but without a call to superclass, even though this class does not extend java.lang.Object. If this is intentional, add '@EqualsAndHashCode(callSuper=false)' to your type.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/MenuItem.java:[18,1] Generating equals/hashCode implementation but without a call to superclass, even though this class does not extend java.lang.Object. If this is intentional, add '@EqualsAndHashCode(callSuper=false)' to your type.
2025-Nov-07 15:43:45.783596
#25 16.88 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/InventoryMovement.java:[19,1] Generating equals/hashCode implementation but without a call to superclass, even though this class does not extend java.lang.Object. If this is intentional, add '@EqualsAndHashCode(callSuper=false)' to your type.
2025-Nov-07 15:43:45.783596
#25 16.89 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/OrderItem.java:[22,1] Generating equals/hashCode implementation but without a call to superclass, even though this class does not extend java.lang.Object. If this is intentional, add '@EqualsAndHashCode(callSuper=false)' to your type.
2025-Nov-07 15:43:45.783596
#25 16.89 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Invoice.java:[19,1] Generating equals/hashCode implementation but without a call to superclass, even though this class does not extend java.lang.Object. If this is intentional, add '@EqualsAndHashCode(callSuper=false)' to your type.
2025-Nov-07 15:43:45.783596
#25 16.89 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Stock.java:[15,1] Generating equals/hashCode implementation but without a call to superclass, even though this class does not extend java.lang.Object. If this is intentional, add '@EqualsAndHashCode(callSuper=false)' to your type.
2025-Nov-07 15:43:45.783596
#25 16.89 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/CustomerSession.java:[21,1] Generating equals/hashCode implementation but without a call to superclass, even though this class does not extend java.lang.Object. If this is intentional, add '@EqualsAndHashCode(callSuper=false)' to your type.
2025-Nov-07 15:43:45.783596
#25 16.89 [WARNING] /app/backend/src/main/java/com/follysitou/sellia_backend/model/Menu.java:[21,1] Generating equals/hashCode implementation but without a call to superclass, even though this class does not extend java.lang.Object. If this is intentional, add '@EqualsAndHashCode(callSuper=false)' to your type.
2025-Nov-07 15:43:45.783596
#25 16.89 [INFO] /app/backend/src/main/java/com/follysitou/sellia_backend/config/SecurityConfig.java: Some input files use or override a deprecated API.
2025-Nov-07 15:43:45.783596
#25 16.89 [INFO] /app/backend/src/main/java/com/follysitou/sellia_backend/config/SecurityConfig.java: Recompile with -Xlint:deprecation for details.
2025-Nov-07 15:43:45.783596
#25 16.89 [INFO]
2025-Nov-07 15:43:45.783596
#25 16.89 [INFO] --- resources:3.3.1:testResources (default-testResources) @ sellia-backend ---
2025-Nov-07 15:43:45.783596
#25 16.91 [INFO] skip non existing resourceDirectory /app/backend/src/test/resources
2025-Nov-07 15:43:45.783596
#25 16.92 [INFO]
2025-Nov-07 15:43:45.783596
#25 16.92 [INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ sellia-backend ---
2025-Nov-07 15:43:45.783596
#25 16.94 [INFO] No sources to compile
2025-Nov-07 15:43:45.783596
#25 16.94 [INFO]
2025-Nov-07 15:43:45.783596
#25 16.94 [INFO] --- surefire:3.5.4:test (default-test) @ sellia-backend ---
2025-Nov-07 15:43:45.877443
#25 17.18 [INFO] Tests are skipped.
2025-Nov-07 15:43:46.029511
#25 17.19 [INFO]
2025-Nov-07 15:43:46.029511
#25 17.19 [INFO] --- jar:3.4.2:jar (default-jar) @ sellia-backend ---
2025-Nov-07 15:43:46.288740
#25 17.60 [INFO] Building jar: /app/backend/target/sellia-backend-0.0.1-SNAPSHOT.jar
2025-Nov-07 15:43:46.590672
#25 17.90 [INFO]
2025-Nov-07 15:43:46.746338
#25 17.91 [INFO] --- spring-boot:3.5.6:repackage (repackage) @ sellia-backend ---
2025-Nov-07 15:43:47.397862
#25 18.71 [INFO] Replacing main artifact /app/backend/target/sellia-backend-0.0.1-SNAPSHOT.jar with repackaged archive, adding nested dependencies in BOOT-INF/.
2025-Nov-07 15:43:47.397862
#25 18.71 [INFO] The original artifact has been renamed to /app/backend/target/sellia-backend-0.0.1-SNAPSHOT.jar.original
2025-Nov-07 15:43:47.397862
#25 18.71 [INFO] ------------------------------------------------------------------------
2025-Nov-07 15:43:47.397862
#25 18.71 [INFO] BUILD SUCCESS
2025-Nov-07 15:43:47.397862
#25 18.71 [INFO] ------------------------------------------------------------------------
2025-Nov-07 15:43:47.528331
#25 18.71 [INFO] Total time:  16.931 s
2025-Nov-07 15:43:47.528331
#25 18.71 [INFO] Finished at: 2025-11-07T15:43:47Z
2025-Nov-07 15:43:47.528331
#25 18.71 [INFO] ------------------------------------------------------------------------
2025-Nov-07 15:43:47.528331
#25 DONE 18.8s
2025-Nov-07 15:43:48.557566
#26 [stage-2 5/6] COPY --from=backend-builder /app/backend/target/*.jar app.jar
2025-Nov-07 15:43:48.663239
#26 DONE 0.1s
2025-Nov-07 15:43:48.818601
#27 [stage-2 6/6] RUN chown -R spring:spring /app
2025-Nov-07 15:43:48.866749
#27 DONE 0.2s
2025-Nov-07 15:43:48.995077
#28 exporting to image
2025-Nov-07 15:43:48.995077
#28 exporting layers
2025-Nov-07 15:43:49.044479
#28 exporting layers 0.2s done
2025-Nov-07 15:43:49.090986
#28 writing image sha256:f8518124c6acd88f91164e2537e5b6cb4628282e9631384b3e7a1cd2e7e4ce51 done
2025-Nov-07 15:43:49.090986
#28 naming to docker.io/library/t8c04oo8g8sggwoos8w080kk:bd69b8c17ade674649948c0b4eb71ea1279a9fc6 done
2025-Nov-07 15:43:49.090986
#28 DONE 0.2s
2025-Nov-07 15:43:49.124045
Building docker image completed.
2025-Nov-07 15:43:49.165920
Creating .env file with runtime variables for build phase.
2025-Nov-07 15:43:49.562572
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'cat /artifacts/fsc8s8ww8ow0484s8sgkg00s/.env'
2025-Nov-07 15:43:49.562572
SOURCE_COMMIT=bd69b8c17ade674649948c0b4eb71ea1279a9fc6
2025-Nov-07 15:43:49.562572
COOLIFY_URL=http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io
2025-Nov-07 15:43:49.562572
COOLIFY_FQDN=t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io
2025-Nov-07 15:43:49.562572
COOLIFY_BRANCH=master
2025-Nov-07 15:43:49.562572
COOLIFY_RESOURCE_UUID=t8c04oo8g8sggwoos8w080kk
2025-Nov-07 15:43:49.562572
COOLIFY_CONTAINER_NAME=t8c04oo8g8sggwoos8w080kk-154231487214
2025-Nov-07 15:43:49.562572
DATABASE_PORT=5432
2025-Nov-07 15:43:49.562572
DATABASE_NAME=sellia_db
2025-Nov-07 15:43:49.562572
DATABASE_USERNAME=postgres
2025-Nov-07 15:43:49.562572
DATABASE_URL=jdbc:postgresql://ooscow04gkw0cgssskso0440:5432/sellia_db
2025-Nov-07 15:43:49.562572
DATABASE_PASSWORD=6zYWYZ3Uvu8OtcA1sok2iwQyRf1YiaZYPJwXLcicggRxF3oDz8kgB8q3IIfLJA2h
2025-Nov-07 15:43:49.562572
HIBERNATE_DDL_AUTO=update
2025-Nov-07 15:43:49.562572
APP_SERVER_URL=http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io
2025-Nov-07 15:43:49.562572
APP_BASE_URL=http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io
2025-Nov-07 15:43:49.562572
JWT_SECRET=LqLWpbUj3rjLLBXe+ju6ebB9fPQKwCOCreNg31EK06Yj+52XyBBBXZKva5eUQtqFVH0S3IgVls7aBkdMeJ1C3g
2025-Nov-07 15:43:49.562572
JWT_ACCESS_TOKEN_EXPIRATION=3600000
2025-Nov-07 15:43:49.562572
JWT_REFRESH_TOKEN_EXPIRATION=432000000
2025-Nov-07 15:43:49.562572
JAVA_OPTS=-Xms512m -Xmx1024m
2025-Nov-07 15:43:49.562572
DOCKER_BUILDKIT_NO_CACHE=1
2025-Nov-07 15:43:49.562572
PORT=8080
2025-Nov-07 15:43:49.562572
HOST=0.0.0.0
2025-Nov-07 15:43:49.712350
----------------------------------------
2025-Nov-07 15:43:49.733998
Rolling update started.
2025-Nov-07 15:43:50.267502
[CMD]: docker exec fsc8s8ww8ow0484s8sgkg00s bash -c 'SOURCE_COMMIT=bd69b8c17ade674649948c0b4eb71ea1279a9fc6 COOLIFY_URL=http://t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io COOLIFY_FQDN=t8c04oo8g8sggwoos8w080kk.91.98.130.144.sslip.io COOLIFY_BRANCH=master COOLIFY_RESOURCE_UUID=t8c04oo8g8sggwoos8w080kk COOLIFY_CONTAINER_NAME=t8c04oo8g8sggwoos8w080kk-154231487214  docker compose --project-name t8c04oo8g8sggwoos8w080kk --project-directory /artifacts/fsc8s8ww8ow0484s8sgkg00s -f /artifacts/fsc8s8ww8ow0484s8sgkg00s/docker-compose.yaml up --build -d'
2025-Nov-07 15:43:50.267502
time="2025-11-07T15:43:50Z" level=warning msg="Found orphan containers ([t8c04oo8g8sggwoos8w080kk-152430510114]) for this project. If you removed or renamed this service in your compose file, you can run this command with the --remove-orphans flag to clean it up."
2025-Nov-07 15:43:50.287154
Container t8c04oo8g8sggwoos8w080kk-154231487214  Creating
2025-Nov-07 15:43:50.304990
t8c04oo8g8sggwoos8w080kk-154231487214 Your kernel does not support memory swappiness capabilities or the cgroup is not mounted. Memory swappiness discarded.
2025-Nov-07 15:43:50.324284
Container t8c04oo8g8sggwoos8w080kk-154231487214  Created
2025-Nov-07 15:43:50.324284
Container t8c04oo8g8sggwoos8w080kk-154231487214  Starting
2025-Nov-07 15:43:50.595178
Container t8c04oo8g8sggwoos8w080kk-154231487214  Started
2025-Nov-07 15:43:50.620319
New container started.
2025-Nov-07 15:43:50.642153
Custom healthcheck found in Dockerfile.
2025-Nov-07 15:43:50.660682
Waiting for healthcheck to pass on the new container.
2025-Nov-07 15:43:50.678614
Waiting for the start period (60 seconds) before starting healthcheck.
2025-Nov-07 15:44:50.850514
[CMD]: docker inspect --format='{{json .State.Health.Status}}' t8c04oo8g8sggwoos8w080kk-154231487214
2025-Nov-07 15:44:50.850514
"healthy"
2025-Nov-07 15:44:50.978860
[CMD]: docker inspect --format='{{json .State.Health.Log}}' t8c04oo8g8sggwoos8w080kk-154231487214
2025-Nov-07 15:44:50.978860
[{"Start":"2025-11-07T15:43:55.594087839Z","End":"2025-11-07T15:43:55.687660646Z","ExitCode":1,"Output":"Connecting to localhost:8080 ([::1]:8080)\nwget: can't connect to remote host: Connection refused\n"},{"Start":"2025-11-07T15:44:00.688295651Z","End":"2025-11-07T15:44:00.752962324Z","ExitCode":1,"Output":"Connecting to localhost:8080 ([::1]:8080)\nwget: can't connect to remote host: Connection refused\n"},{"Start":"2025-11-07T15:44:05.753491494Z","End":"2025-11-07T15:44:05.943442321Z","ExitCode":1,"Output":"Connecting to localhost:8080 ([::1]:8080)\nwget: can't connect to remote host: Connection refused\n"},{"Start":"2025-11-07T15:44:10.946539456Z","End":"2025-11-07T15:44:11.31097129Z","ExitCode":0,"Output":"Connecting to localhost:8080 ([::1]:8080)\nremote file exists\n"},{"Start":"2025-11-07T15:44:41.311810648Z","End":"2025-11-07T15:44:41.396699422Z","ExitCode":0,"Output":"Connecting to localhost:8080 ([::1]:8080)\nremote file exists\n"}]
2025-Nov-07 15:44:50.998200
Attempt 1 of 3 | Healthcheck status: "healthy"
2025-Nov-07 15:44:51.019752
Healthcheck logs: Connecting to localhost:8080 ([::1]:8080)
2025-Nov-07 15:44:51.019752
remote file exists
2025-Nov-07 15:44:51.019752
| Return code: 0
2025-Nov-07 15:44:51.048370
New container is healthy.
2025-Nov-07 15:44:51.067833
Removing old containers.
2025-Nov-07 15:44:51.522614
[CMD]: docker stop --time=30 t8c04oo8g8sggwoos8w080kk-152430510114
2025-Nov-07 15:44:51.522614
t8c04oo8g8sggwoos8w080kk-152430510114
2025-Nov-07 15:44:51.658857
[CMD]: docker rm -f t8c04oo8g8sggwoos8w080kk-152430510114
2025-Nov-07 15:44:51.658857
t8c04oo8g8sggwoos8w080kk-152430510114
2025-Nov-07 15:44:51.677172
Rolling update completed.
2025-Nov-07 15:44:52.061266
Gracefully shutting down build container: fsc8s8ww8ow0484s8sgkg00s
2025-Nov-07 15:44:52.287475
[CMD]: docker stop --time=30 fsc8s8ww8ow0484s8sgkg00s
2025-Nov-07 15:44:52.287475
fsc8s8ww8ow0484s8sgkg00s
2025-Nov-07 15:44:52.444300
[CMD]: docker rm -f fsc8s8ww8ow0484s8sgkg00s
2025-Nov-07 15:44:52.444300
Error response from daemon: No such container: fsc8s8ww8ow0484s8sgkg00s