properties([
    buildDiscarder(logRotator(numToKeepStr: '3'))
])
node('docker&&linux') {
    stage('Fetch SCM') {
        checkout scm
    }
    stage('Build Library') {
        def shared = docker.build("pilgrims/pilgrims-shared:${env.BRANCH_NAME}", "--build-arg BRANCH_TAG=${env.BRANCH_NAME} ./pilgrims-shared")
    }
    stage('Website Build') {
        parallel(
            client: {
                def client = docker.build("pilgrims/pilgrims-client:${env.BRANCH_NAME}", "--build-arg BRANCH_TAG=${env.BRANCH_NAME} ./pilgrims-client")
            },
            server: {
                def server = docker.build("pilgrims/pilgrims-server:${env.BRANCH_NAME}", "--build-arg BRANCH_TAG=${env.BRANCH_NAME} ./pilgrims-server")
            }
        )
    }
    stage('Tests') {
        sh """
            docker run --rm pilgrims/pilgrims-shared-${env.BRANCH_NAME}
        """
    }
}