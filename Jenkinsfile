pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    tools {
        jdk 'JDK17'
        maven 'Maven'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '========================================'
                echo 'CHECKING OUT SOURCE CODE'
                echo '========================================'

                git branch: 'main',
                    url: 'https://github.com/NagarajGolai/PinkedIn.git'
            }
        }

        stage('Stop Existing Services') {
            steps {
                bat '''
                    echo ========================================
                    echo STOPPING EXISTING SERVICES
                    echo ========================================

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8761" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8091" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8092" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8093" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8094" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8095" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

                    powershell -NoProfile -Command "Start-Sleep -Seconds 3"

                    echo Existing services stopped.
                '''
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    bat '''
                        echo ========================================
                        echo BUILDING ALL SERVICES
                        echo ========================================

                        for /d %%i in (*) do (
                            if exist "%%i\\pom.xml" (
                                echo.
                                echo Building %%i
                                echo ----------------------------------------

                                call mvn -f "%%i\\pom.xml" clean package -DskipTests

                                if errorlevel 1 (
                                    echo BUILD FAILED: %%i
                                    exit /b 1
                                )
                            )
                        )

                        echo.
                        echo ========================================
                        echo ALL SERVICES BUILT SUCCESSFULLY
                        echo ========================================
                    '''
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    bat '''
                        echo ========================================
                        echo RUNNING TESTS
                        echo ========================================

                        for /d %%i in (*) do (
                            if exist "%%i\\pom.xml" (
                                echo.
                                echo Testing %%i
                                echo ----------------------------------------

                                call mvn -f "%%i\\pom.xml" test

                                if errorlevel 1 (
                                    echo TEST FAILED: %%i
                                    exit /b 1
                                )
                            )
                        )

                        echo.
                        echo ========================================
                        echo ALL TESTS PASSED
                        echo ========================================
                    '''
                }
            }
        }

        stage('Start Eureka') {
            steps {
                bat '''
                    echo ========================================
                    echo STARTING EUREKA
                    echo ========================================

                    if not exist "backend\\eureka\\target\\eureka-0.0.1-SNAPSHOT.jar" (
                        echo Eureka JAR NOT FOUND
                        exit /b 1
                    )

                    start "Eureka" /MIN cmd /c "java -jar backend\\eureka\\target\\eureka-0.0.1-SNAPSHOT.jar > eureka.log 2>&1"

                    echo Eureka process started.
                    echo Waiting for Eureka to start...

                    powershell -NoProfile -Command ^
                    "$timeout=60; $elapsed=0; while($elapsed -lt $timeout) { if(Test-NetConnection 127.0.0.1 -Port 8761 -InformationLevel Quiet) { Write-Host 'EUREKA IS UP'; exit 0 }; Start-Sleep -Seconds 2; $elapsed+=2 }; Write-Host 'EUREKA FAILED TO START'; exit 1"

                    if errorlevel 1 (
                        echo.
                        echo ========================================
                        echo EUREKA FAILED
                        echo ========================================
                        echo.
                        if exist eureka.log type eureka.log
                        exit /b 1
                    )

                    echo Eureka is running on port 8761.
                '''
            }
        }

        stage('Start Services') {
            steps {
                bat '''
                    echo ========================================
                    echo STARTING USER SERVICE
                    echo ========================================

                    start "User Service" /MIN cmd /c "java -jar backend\\user-service\\target\\user-service-0.0.1-SNAPSHOT.jar > user-service.log 2>&1"

                    echo ========================================
                    echo STARTING COMPANY SERVICE
                    echo ========================================

                    start "Company Service" /MIN cmd /c "java -jar backend\\company-service\\target\\company-service-0.0.1-SNAPSHOT.jar > company-service.log 2>&1"

                    echo ========================================
                    echo STARTING POST SERVICE
                    echo ========================================

                    start "Post Service" /MIN cmd /c "java -jar backend\\post-service\\target\\post-service-0.0.1-SNAPSHOT.jar > post-service.log 2>&1"

                    echo ========================================
                    echo STARTING JOB SERVICE
                    echo ========================================

                    start "Job Service" /MIN cmd /c "java -jar backend\\job-service\\target\\job-service-0.0.1-SNAPSHOT.jar > job-service.log 2>&1"

                    echo ========================================
                    echo STARTING APPLICATION SERVICE
                    echo ========================================

                    start "Application Service" /MIN cmd /c "java -jar backend\\application-service\\target\\application-service-0.0.1-SNAPSHOT.jar > application-service.log 2>&1"

                    echo ========================================
                    echo STARTING API GATEWAY
                    echo ========================================

                    start "API Gateway" /MIN cmd /c "java -jar backend\\api-gateway\\target\\api-gateway-0.0.1-SNAPSHOT.jar > api-gateway.log 2>&1"

                    echo.
                    echo All service processes started.
                    echo Waiting 30 seconds for Spring Boot applications...
                    
                    powershell -NoProfile -Command "Start-Sleep -Seconds 30"

                    echo ========================================
                    echo SERVICE START COMMANDS COMPLETED
                    echo ========================================
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                bat '''
                    echo ========================================
                    echo VERIFYING DEPLOYMENT
                    echo ========================================

                    echo.
                    echo EUREKA - PORT 8761
                    netstat -ano | findstr ":8761" | findstr "LISTENING"

                    echo.
                    echo USER SERVICE - PORT 8091
                    netstat -ano | findstr ":8091" | findstr "LISTENING"

                    echo.
                    echo COMPANY SERVICE - PORT 8092
                    netstat -ano | findstr ":8092" | findstr "LISTENING"

                    echo.
                    echo POST SERVICE - PORT 8093
                    netstat -ano | findstr ":8093" | findstr "LISTENING"

                    echo.
                    echo JOB SERVICE - PORT 8094
                    netstat -ano | findstr ":8094" | findstr "LISTENING"

                    echo.
                    echo APPLICATION SERVICE - PORT 8095
                    netstat -ano | findstr ":8095" | findstr "LISTENING"

                    echo.
                    echo API GATEWAY - PORT 8000
                    netstat -ano | findstr ":8000" | findstr "LISTENING"

                    echo.
                    echo ========================================
                    echo DEPLOYMENT VERIFICATION COMPLETE
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
            echo ''
            echo 'Eureka: http://localhost:8761'
            echo 'API Gateway: http://localhost:8000'
        }

        failure {
            echo '========================================'
            echo 'BUILD OR DEPLOYMENT FAILED'
            echo '========================================'
            echo ''
            echo 'Check Jenkins Console Output.'
            echo 'Check eureka.log and service log files.'
        }
    }
}