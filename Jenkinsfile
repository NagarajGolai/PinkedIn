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
                    bat 'for /d %%i in (*) do if exist "%%i\\pom.xml" mvn -f "%%i\\pom.xml" clean package'
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    bat 'for /d %%i in (*) do if exist "%%i\\pom.xml" mvn -f "%%i\\pom.xml" test'
                }
            }
        }
    }
}