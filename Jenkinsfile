pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    tools {
        jdk 'JDK17'
        maven 'Maven'
    }

    environment {
        EUREKA_PORT = '8761'
        USER_PORT = '8091'
        COMPANY_PORT = '8092'
        POST_PORT = '8093'
        JOB_PORT = '8094'
        APPLICATION_PORT = '8095'
        GATEWAY_PORT = '8000'
    }

    stages {

        // ============================================================
        // CHECKOUT
        // ============================================================

        stage('Checkout') {
            steps {
                echo '========================================'
                echo 'CHECKOUT'
                echo '========================================'

                git(
                    branch: 'main',
                    url: 'https://github.com/NagarajGolai/PinkedIn.git'
                )
            }
        }


        // ============================================================
        // STOP OLD JAVA SERVICES
        // ============================================================

        stage('Stop Existing Services') {
            steps {
                bat '''
                    @echo off

                    echo ========================================
                    echo STOPPING OLD SERVICES
                    echo ========================================

                    echo.
                    echo Killing Java processes...
                    taskkill /F /IM java.exe >nul 2>&1

                    echo Waiting for processes to terminate...
                    powershell -NoProfile -Command "Start-Sleep -Seconds 5"

                    echo.
                    echo Checking required ports...

                    netstat -ano | findstr ":8761"
                    netstat -ano | findstr ":8091"
                    netstat -ano | findstr ":8092"
                    netstat -ano | findstr ":8093"
                    netstat -ano | findstr ":8094"
                    netstat -ano | findstr ":8095"
                    netstat -ano | findstr ":8000"

                    echo.
                    echo OLD SERVICES STOPPED
                    echo ========================================
                '''
            }
        }


        // ============================================================
        // BUILD
        // ============================================================

        stage('Build') {
            steps {

                dir('backend') {

                    bat '''
                        @echo off

                        echo ========================================
                        echo BUILDING ALL MICROSERVICES
                        echo ========================================

                        for /d %%i in (*) do (

                            if exist "%%i\\pom.xml" (

                                echo.
                                echo ========================================
                                echo Building %%i
                                echo ========================================

                                call mvn -f "%%i\\pom.xml" clean package -DskipTests

                                if errorlevel 1 (
                                    echo.
                                    echo BUILD FAILED: %%i
                                    exit /b 1
                                )

                            )

                        )

                        echo.
                        echo ========================================
                        echo ALL MICROSERVICES BUILT
                        echo ========================================
                    '''
                }
            }
        }


        // ============================================================
        // TEST
        // ============================================================

        stage('Test') {
            steps {

                dir('backend') {

                    bat '''
                        @echo off

                        echo ========================================
                        echo RUNNING TESTS
                        echo ========================================

                        for /d %%i in (*) do (

                            if exist "%%i\\pom.xml" (

                                echo.
                                echo Testing %%i

                                call mvn -f "%%i\\pom.xml" test

                                if errorlevel 1 (
                                    echo.
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


        // ============================================================
        // START EUREKA
        // ============================================================

        stage('Start Eureka') {
            steps {

                bat '''
                    @echo off

                    echo ========================================
                    echo STARTING EUREKA
                    echo ========================================

                    if not exist "backend\\eureka\\target\\eureka-0.0.1-SNAPSHOT.jar" (
                        echo Eureka JAR NOT FOUND
                        exit /b 1
                    )

                    echo Eureka JAR found.

                    echo Starting Eureka...

                    start "EUREKA" /MIN cmd /c ^
                    "cd /d "%WORKSPACE%" && java -jar "backend\\eureka\\target\\eureka-0.0.1-SNAPSHOT.jar" > "eureka.log" 2>&1"

                    echo Eureka process started.

                    echo.
                    echo Waiting for Eureka to become available...

                    powershell -NoProfile -Command ^
                    "$timeout=90; $elapsed=0; while($elapsed -lt $timeout) { try { $tcp=New-Object System.Net.Sockets.TcpClient; $tcp.Connect('127.0.0.1',8761); $tcp.Close(); Write-Host 'EUREKA IS UP'; exit 0 } catch { Start-Sleep -Seconds 3; $elapsed += 3 } }; Write-Host 'EUREKA DID NOT START'; exit 1"

                    if errorlevel 1 (
                        echo.
                        echo ========================================
                        echo EUREKA FAILED TO START
                        echo ========================================
                        echo.
                        echo ===== EUREKA LOG =====
                        if exist "eureka.log" (
                            type "eureka.log"
                        ) else (
                            echo eureka.log was not created.
                        )
                        echo.
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo EUREKA STARTED SUCCESSFULLY
                    echo ========================================
                '''
            }
        }


        // ============================================================
        // START MICROSERVICES
        // ============================================================

        stage('Start Services') {
            steps {

                bat '''
                    @echo off

                    echo ========================================
                    echo STARTING USER SERVICE
                    echo ========================================

                    start "USER-SERVICE" /MIN cmd /c ^
                    "cd /d "%WORKSPACE%" && java -jar "backend\\user-service\\target\\user-service-0.0.1-SNAPSHOT.jar" > "user-service.log" 2>&1"


                    echo ========================================
                    echo STARTING COMPANY SERVICE
                    echo ========================================

                    start "COMPANY-SERVICE" /MIN cmd /c ^
                    "cd /d "%WORKSPACE%" && java -jar "backend\\company-service\\target\\company-service-0.0.1-SNAPSHOT.jar" > "company-service.log" 2>&1"


                    echo ========================================
                    echo STARTING POST SERVICE
                    echo ========================================

                    start "POST-SERVICE" /MIN cmd /c ^
                    "cd /d "%WORKSPACE%" && java -jar "backend\\post-service\\target\\post-service-0.0.1-SNAPSHOT.jar" > "post-service.log" 2>&1"


                    echo ========================================
                    echo STARTING JOB SERVICE
                    echo ========================================

                    start "JOB-SERVICE" /MIN cmd /c ^
                    "cd /d "%WORKSPACE%" && java -jar "backend\\job-service\\target\\job-service-0.0.1-SNAPSHOT.jar" > "job-service.log" 2>&1"


                    echo ========================================
                    echo STARTING APPLICATION SERVICE
                    echo ========================================

                    start "APPLICATION-SERVICE" /MIN cmd /c ^
                    "cd /d "%WORKSPACE%" && java -jar "backend\\application-service\\target\\application-service-0.0.1-SNAPSHOT.jar" > "application-service.log" 2>&1"


                    echo ========================================
                    echo STARTING API GATEWAY
                    echo ========================================

                    start "API-GATEWAY" /MIN cmd /c ^
                    "cd /d "%WORKSPACE%" && java -jar "backend\\api-gateway\\target\\api-gateway-0.0.1-SNAPSHOT.jar" > "api-gateway.log" 2>&1"


                    echo.
                    echo ========================================
                    echo ALL JAVA PROCESSES STARTED
                    echo ========================================

                    powershell -NoProfile -Command "Start-Sleep -Seconds 20"
                '''
            }
        }


        // ============================================================
        // VERIFY
        // ============================================================

        stage('Verify Deployment') {
            steps {

                bat '''
                    @echo off

                    echo ========================================
                    echo VERIFYING DEPLOYMENT
                    echo ========================================

                    echo.
                    echo EUREKA:
                    netstat -ano | findstr ":8761" | findstr "LISTENING"

                    echo.
                    echo USER SERVICE:
                    netstat -ano | findstr ":8091" | findstr "LISTENING"

                    echo.
                    echo COMPANY SERVICE:
                    netstat -ano | findstr ":8092" | findstr "LISTENING"

                    echo.
                    echo POST SERVICE:
                    netstat -ano | findstr ":8093" | findstr "LISTENING"

                    echo.
                    echo JOB SERVICE:
                    netstat -ano | findstr ":8094" | findstr "LISTENING"

                    echo.
                    echo APPLICATION SERVICE:
                    netstat -ano | findstr ":8095" | findstr "LISTENING"

                    echo.
                    echo API GATEWAY:
                    netstat -ano | findstr ":8000" | findstr "LISTENING"

                    echo.
                    echo ========================================
                    echo DEPLOYMENT CHECK FINISHED
                    echo ========================================
                '''
            }
        }
    }


    // ================================================================
    // POST ACTIONS
    // ================================================================

    post {

        success {
            echo '========================================'
            echo 'BUILD AND DEPLOYMENT SUCCESSFUL'
            echo '========================================'

            echo 'Eureka: http://localhost:8761'
            echo 'API Gateway: http://localhost:8000'
        }

        failure {
            echo '========================================'
            echo 'BUILD OR DEPLOYMENT FAILED'
            echo '========================================'

            echo 'Check Jenkins Console Output.'
            echo 'Also check eureka.log and service log files.'
        }
    }
}