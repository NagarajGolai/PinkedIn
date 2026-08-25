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
                                echo ========================================
                                echo Building %%i
                                echo ========================================

                                mvn -f "%%i\\pom.xml" clean package -DskipTests

                                if errorlevel 1 (
                                    echo BUILD FAILED: %%i
                                    exit /b 1
                                )
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
                                echo ========================================
                                echo Testing %%i
                                echo ========================================

                                mvn -f "%%i\\pom.xml" test

                                if errorlevel 1 (
                                    echo TEST FAILED: %%i
                                    exit /b 1
                                )
                            )
                        )
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {

                /*
                 * ============================================
                 * STOP OLD SERVICES
                 * ============================================
                 */
                bat '''
                    echo ========================================
                    echo STOPPING EXISTING SERVICES
                    echo ========================================

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8761 ^| findstr LISTENING') do (
                        echo Killing Eureka PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8091 ^| findstr LISTENING') do (
                        echo Killing User Service PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8092 ^| findstr LISTENING') do (
                        echo Killing Company Service PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8093 ^| findstr LISTENING') do (
                        echo Killing Post Service PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8094 ^| findstr LISTENING') do (
                        echo Killing Job Service PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8095 ^| findstr LISTENING') do (
                        echo Killing Application Service PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
                        echo Killing API Gateway PID %%a
                        taskkill /F /PID %%a >nul 2>&1
                    )

                    powershell -NoProfile -Command "Start-Sleep -Seconds 5"

                    echo Old services stopped.
                '''

                /*
                 * ============================================
                 * START EUREKA
                 * ============================================
                 */
                bat '''
                    echo ========================================
                    echo STARTING EUREKA
                    echo ========================================

                    start "Eureka" /B cmd /c "java -jar backend\\eureka\\target\\eureka-0.0.1-SNAPSHOT.jar > eureka.log 2>&1"

                    echo Waiting for Eureka on port 8761...

                    powershell -NoProfile -Command ^
                    "$timeout = 60; ^
                     $elapsed = 0; ^
                     while ($elapsed -lt $timeout) { ^
                         try { ^
                             $connection = New-Object System.Net.Sockets.TcpClient; ^
                             $connection.Connect('127.0.0.1',8761); ^
                             $connection.Close(); ^
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
                        type eureka.log
                        exit /b 1
                    )
                '''

                /*
                 * ============================================
                 * START USER SERVICE
                 * ============================================
                 */
                bat '''
                    echo ========================================
                    echo STARTING USER SERVICE
                    echo ========================================

                    start "User Service" /B cmd /c "java -jar backend\\user-service\\target\\user-service-0.0.1-SNAPSHOT.jar > user-service.log 2>&1"
                '''

                /*
                 * ============================================
                 * START COMPANY SERVICE
                 * ============================================
                 */
                bat '''
                    echo ========================================
                    echo STARTING COMPANY SERVICE
                    echo ========================================

                    start "Company Service" /B cmd /c "java -jar backend\\company-service\\target\\company-service-0.0.1-SNAPSHOT.jar > company-service.log 2>&1"
                '''

                /*
                 * ============================================
                 * START POST SERVICE
                 * ============================================
                 */
                bat '''
                    echo ========================================
                    echo STARTING POST SERVICE
                    echo ========================================

                    start "Post Service" /B cmd /c "java -jar backend\\post-service\\target\\post-service-0.0.1-SNAPSHOT.jar > post-service.log 2>&1"
                '''

                /*
                 * ============================================
                 * START JOB SERVICE
                 * ============================================
                 */
                bat '''
                    echo ========================================
                    echo STARTING JOB SERVICE
                    echo ========================================

                    start "Job Service" /B cmd /c "java -jar backend\\job-service\\target\\job-service-0.0.1-SNAPSHOT.jar > job-service.log 2>&1"
                '''

                /*
                 * ============================================
                 * START APPLICATION SERVICE
                 * ============================================
                 */
                bat '''
                    echo ========================================
                    echo STARTING APPLICATION SERVICE
                    echo ========================================

                    start "Application Service" /B cmd /c "java -jar backend\\application-service\\target\\application-service-0.0.1-SNAPSHOT.jar > application-service.log 2>&1"
                '''

                /*
                 * ============================================
                 * START API GATEWAY
                 * ============================================
                 */
                bat '''
                    echo ========================================
                    echo STARTING API GATEWAY
                    echo ========================================

                    start "API Gateway" /B cmd /c "java -jar backend\\api-gateway\\target\\api-gateway-0.0.1-SNAPSHOT.jar > api-gateway.log 2>&1"

                    powershell -NoProfile -Command "Start-Sleep -Seconds 15"

                    echo ========================================
                    echo DEPLOYMENT COMPLETED
                    echo ========================================
                '''

                /*
                 * ============================================
                 * SHOW RUNNING PORTS
                 * ============================================
                 */
                bat '''
                    echo ========================================
                    echo RUNNING SERVICES
                    echo ========================================

                    netstat -ano | findstr LISTENING | findstr ":8761 :8091 :8092 :8093 :8094 :8095 :8000"

                    echo ========================================
                    echo DEPLOYMENT CHECK COMPLETE
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