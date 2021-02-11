properties([
    buildDiscarder(logRotator(numToKeepStr: '3'))
])
node('docker&&linux') {
    stage('Fetch SCM') {
        checkout scm
    }
    stage('Build Library') {
        def shared = docker.build("colonists/colonists-shared:${env.BRANCH_NAME}", "--build-arg BRANCH_TAG=${env.BRANCH_NAME} ./colonists-shared")
    }
    stage('Website Build') {
        parallel(
            client: {
                def client = docker.build("colonists/colonists-client:${env.BRANCH_NAME}", "--build-arg BRANCH_TAG=${env.BRANCH_NAME} ./colonists-client")
            },
            server: {
                def server = docker.build("colonists/colonists-server:${env.BRANCH_NAME}", "--build-arg BRANCH_TAG=${env.BRANCH_NAME} ./colonists-server")
            }
        )
    }
    stage('Tests') {
        sh """
            docker run --rm colonists/colonists-shared:${env.BRANCH_NAME}
        """
    }
    stage('Remove Unused docker image') {
        sh "docker rmi colonists/colonists-server:${env.BRANCH_NAME} || echo could not remove image"
        sh "docker rmi colonists/colonists-client:${env.BRANCH_NAME} || echo could not remove image"
        sh "docker rmi colonists/colonists-shared:${env.BRANCH_NAME} || echo could not remove image"
    }
}
