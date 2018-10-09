properties([
    buildDiscarder(logRotator(numToKeepStr: '3'))
])
node('docker&&linux') {
    stage('Fetch SCM') {
        checkout scm
    }
    stage('Website Build') {
        docker.build('pilgrims/pilgrims')
    }
    stage('Deploy') {
        sh 'docker-compose up -d'
    }
}