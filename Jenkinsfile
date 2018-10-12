properties([
    buildDiscarder(logRotator(numToKeepStr: '3'))
])
node('docker&&linux') {
    stage('Fetch SCM') {
        checkout scm
    }
    stage('Website Build') {
        def client = docker.build('pilgrims/pilgrims-client', './pilgrims-client')
        def server = docker.build('pilgrims/pilgrims-server', './pilgrims-server')
    }
    stage('Tests') {
        def test = docker.build('pilgrims/pilgrims-tests', './pilgrims-shared/Dockerfile.test')
        test.inside {
            npm run test
        }
    }
    stage('Deploy') {
        sh 'docker-compose up -d'
    }
}