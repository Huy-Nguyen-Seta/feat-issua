pipeline {

  agent {
    node {
          label 'seta-timesheet'
          customWorkspace '/home/ubuntu/jenkins/multi-branch/'
      }
  }

  stages {
    stage('Build') {
      steps {
        script {
          if (env.BRANCH_NAME=="dev/develop"){
            sh "cp config_dev.json config.json"
            sh "docker build -t timesheet-app-${env.BRANCH_NAME} ."
          }
          if (env.BRANCH_NAME=="master"){
            sh "cp config_prod.json config.json"
            sh "docker build -t timesheet-app-${env.BRANCH_NAME} ."
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          if (env.BRANCH_NAME=="dev/develop"){
            CONTAINER_ID = sh(returnStdout: true, script: "docker ps -a | grep timesheet-app-${env.BRANCH_NAME} | awk '{print \$1}'").trim()
            sh "echo ${CONTAINER_ID} ${env.BRANCH_NAME}"
            if (CONTAINER_ID != ''){
              sh "docker container rm ${CONTAINER_ID} --force"
            }
            sh "docker run -d -e BRANCH_SOURCE_DEPLOY=${env.BRANCH_NAME} --name timesheet-app-${env.BRANCH_NAME} --network=host timesheet-app-${env.BRANCH_NAME}"
            sh 'return'
          }
        }

      }
    }
  }
}
