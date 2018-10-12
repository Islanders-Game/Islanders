properties([
    buildDiscarder(logRotator(numToKeepStr: '3'))
])
node('docker&&linux') {
    stage('Fetch SCM') {
        checkout scm
    }
    stage('Website Build') {
        def client = docker.build('pilgrims/pilgrims-client', './pilgrims-client')
        def client = docker.build('pilgrims/pilgrims-server', './pilgrims-server')
    }
    stage('Deploy') {
        sh 'docker-compose up -d'
    }
}