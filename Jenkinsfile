pipeline {
    agent any

    tools {
        jdk 'JDK17'
        maven 'Maven'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/NagarajGolai/PinkedIn.git'
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    bat '''
                        for /d %%i in (*) do (
                            if exist "%%i\\pom.xml" (
                                echo Building %%i
                                mvn -f "%%i\\pom.xml" clean package -DskipTests
                                if errorlevel 1 exit /b 1
                            )
                        )
                    '''
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    bat '''
                        for /d %%i in (*) do (
                            if exist "%%i\\pom.xml" (
                                echo Testing %%i
                                mvn -f "%%i\\pom.xml" test
                                if errorlevel 1 exit /b 1
                            )
                        )
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {

                // Stop old services
                bat '''
                    echo ========================================
                    echo Stopping existing services
                    echo ========================================

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8761 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8091 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8092 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8093 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8094 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8095 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

                    timeout /t 5 /nobreak
                '''

                // Start services
                bat '''
                    echo ========================================
                    echo Starting Eureka
                    echo ========================================

                    start "Eureka" /B java -jar "backend\\eureka\\target\\eureka-0.0.1-SNAPSHOT.jar"

                    timeout /t 10 /nobreak

                    echo ========================================
                    echo Starting User Service
                    echo ========================================

                    start "User Service" /B java -jar "backend\\user-service\\target\\user-service-0.0.1-SNAPSHOT.jar"

                    echo ========================================
                    echo Starting Company Service
                    echo ========================================

                    start "Company Service" /B java -jar "backend\\company-service\\target\\company-service-0.0.1-SNAPSHOT.jar"

                    echo ========================================
                    echo Starting Post Service
                    echo ========================================

                    start "Post Service" /B java -jar "backend\\post-service\\target\\post-service-0.0.1-SNAPSHOT.jar"

                    echo ========================================
                    echo Starting Job Service
                    echo ========================================

                    start "Job Service" /B java -jar "backend\\job-service\\target\\job-service-0.0.1-SNAPSHOT.jar"

                    echo ========================================
                    echo Starting Application Service
                    echo ========================================

                    start "Application Service" /B java -jar "backend\\application-service\\target\\application-service-0.0.1-SNAPSHOT.jar"

                    echo ========================================
                    echo Starting API Gateway
                    echo ========================================

                    start "API Gateway" /B java -jar "backend\\api-gateway\\target\\api-gateway-0.0.1-SNAPSHOT.jar"

                    echo ========================================
                    echo Deployment commands completed
                    echo ========================================
                '''
            }
        }
    }

    post {
        success {
            echo '========================================'
            echo 'BUILD AND DEPLOYMENT SUCCESSFUL'
            echo '========================================'
        }

        failure {
            echo '========================================'
            echo 'BUILD OR DEPLOYMENT FAILED'
            echo '========================================'
        }
    }
}