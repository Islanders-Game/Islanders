properties([
    buildDiscarder(logRotator(numToKeepStr: '3'))
])
node('docker&&linux') {
    stage('Fetch SCM') {
        checkout scm
    }
    stage('Build Library') {
        def shared = docker.build('pilgrims/pilgrims-shared', './pilgrims-shared')
    }
    stage('Website Build') {
        parallel(
            client: {
                def client = docker.build('pilgrims/pilgrims-client', './pilgrims-client')
            },
            server: {
                def server = docker.build('pilgrims/pilgrims-server', './pilgrims-server')
            }
        )
    }
    stage('Tests') {
        sh """
            docker run --rm pilgrims/pilgrims-shared
        """
    }
    stage('Deploy') {
        sh 'docker-compose up -d'
    }
}