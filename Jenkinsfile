pipeline {
    agent any

    tools {
        // Must match the name you configured in
        // Manage Jenkins > Tools > NodeJS installations
        nodejs 'NodeJS-22'
    }

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Cypress Tests') {
            steps {
                // continue the pipeline even if tests fail, so the
                // report can still be published/archived afterwards
                bat 'npx cypress run --reporter cypress-mochawesome-reporter'
            }
        }
    }

    post {
        always {
            // Publish the Mochawesome HTML report inside Jenkins
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'cypress/reports/html',
                reportFiles: 'index.html',
                reportName: 'Cypress HTML Report'
            ])

            // Keep screenshots/videos as downloadable build artifacts
            archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/reports/**', allowEmptyArchive: true
        }
    }
}
