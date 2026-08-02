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
                // catchError lets the pipeline continue to the 'post' block
                // (to publish the report) even when tests fail, while still
                // marking the overall build as unstable/failed.
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'npx cypress run --reporter cypress-mochawesome-reporter'
                }
            }
        }
    }

    post {
        always {
            // Publish the Mochawesome HTML report inside Jenkins.
            // NOTE: cypress-mochawesome-reporter writes index.html directly
            // into cypress/reports (see reportDir in cypress.config.js),
            // NOT cypress/reports/html.
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'cypress/reports',
                reportFiles: 'index.html',
                reportName: 'Cypress HTML Report'
            ])

            // Keep screenshots/videos as downloadable build artifacts
            archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/reports/**', allowEmptyArchive: true
        }
    }
}
