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

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8761" ^| findstr "LISTENING"') do (
                        echo Killing process on port 8761 - PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8091" ^| findstr "LISTENING"') do (
                        echo Killing process on port 8091 - PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8092" ^| findstr "LISTENING"') do (
                        echo Killing process on port 8092 - PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8093" ^| findstr "LISTENING"') do (
                        echo Killing process on port 8093 - PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8094" ^| findstr "LISTENING"') do (
                        echo Killing process on port 8094 - PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8095" ^| findstr "LISTENING"') do (
                        echo Killing process on port 8095 - PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
                        echo Killing process on port 8000 - PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    echo Waiting for processes to stop...

                    powershell -NoProfile -Command "Start-Sleep -Seconds 5"

                    echo ========================================
                    echo CHECKING PORTS
                    echo ========================================

                    netstat -ano | findstr "LISTENING" | findstr ":8761 :8091 :8092 :8093 :8094 :8095 :8000"

                    echo ========================================
                    echo OLD SERVICES STOPPED
                    echo ========================================
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
                                echo ========================================
                                echo Testing %%i
                                echo ========================================

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

        stage('Start Eureka') {
            steps {
                bat '''
                    echo ========================================
                    echo STARTING EUREKA
                    echo ========================================

                    start "Eureka" /B cmd /c "java -jar backend\\eureka\\target\\eureka-0.0.1-SNAPSHOT.jar > eureka.log 2>&1"

                    echo Waiting for Eureka...

                    powershell -NoProfile -Command ^
                    "$timeout = 60; ^
                     $elapsed = 0; ^
                     while ($elapsed -lt $timeout) { ^
                         try { ^
                             $client = New-Object System.Net.Sockets.TcpClient; ^
                             $client.Connect('127.0.0.1',8761); ^
                             $client.Close(); ^
                             Write-Host 'Eureka is UP'; ^
                             exit 0 ^
                         } catch { ^
                             Start-Sleep -Seconds 2; ^
                             $elapsed += 2 ^
                         } ^
                     }; ^
                     Write-Host 'Eureka FAILED TO START'; ^
                     exit 1"

                    if errorlevel 1 (
                        echo ========================================
                        echo EUREKA FAILED
                        echo ========================================
                        echo.
                        echo Eureka log:
                        type eureka.log
                        exit /b 1
                    )

                    echo ========================================
                    echo EUREKA STARTED SUCCESSFULLY
                    echo ========================================
                '''
            }
        }

        stage('Start Services') {
            steps {
                bat '''
                    echo ========================================
                    echo STARTING USER SERVICE
                    echo ========================================

                    start "User Service" /B cmd /c "java -jar backend\\user-service\\target\\user-service-0.0.1-SNAPSHOT.jar > user-service.log 2>&1"

                    echo ========================================
                    echo STARTING COMPANY SERVICE
                    echo ========================================

                    start "Company Service" /B cmd /c "java -jar backend\\company-service\\target\\company-service-0.0.1-SNAPSHOT.jar > company-service.log 2>&1"

                    echo ========================================
                    echo STARTING POST SERVICE
                    echo ========================================

                    start "Post Service" /B cmd /c "java -jar backend\\post-service\\target\\post-service-0.0.1-SNAPSHOT.jar > post-service.log 2>&1"

                    echo ========================================
                    echo STARTING JOB SERVICE
                    echo ========================================

                    start "Job Service" /B cmd /c "java -jar backend\\job-service\\target\\job-service-0.0.1-SNAPSHOT.jar > job-service.log 2>&1"

                    echo ========================================
                    echo STARTING APPLICATION SERVICE
                    echo ========================================

                    start "Application Service" /B cmd /c "java -jar backend\\application-service\\target\\application-service-0.0.1-SNAPSHOT.jar > application-service.log 2>&1"

                    echo ========================================
                    echo STARTING API GATEWAY
                    echo ========================================

                    start "API Gateway" /B cmd /c "java -jar backend\\api-gateway\\target\\api-gateway-0.0.1-SNAPSHOT.jar > api-gateway.log 2>&1"

                    echo Waiting for services to start...

                    powershell -NoProfile -Command "Start-Sleep -Seconds 20"

                    echo ========================================
                    echo SERVICES STARTED
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
                    echo Active listening ports:
                    echo.

                    netstat -ano | findstr "LISTENING" | findstr ":8761 :8091 :8092 :8093 :8094 :8095 :8000"

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
            echo 'Check the Jenkins console output and service log files.'
        }
    }
}