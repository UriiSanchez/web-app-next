def instances = [
    dev: [name: 'MTY-ALE-DECRE000', host: '10.50.57.67', port: 22, allowAnyHosts: true, hostname: 'easycredit-web-dev'],
    qa: [name: 'MTY-ALE-QECRE000', host: '10.50.53.107', port: 22, allowAnyHosts: true, hostname: 'easycredit-web-qa']
]

pipeline {
    agent any
    environment {
        AGENT_IMAGE = "registry.bancobase.net/proxy-cache/node:22-alpine"
        REGISTRY = "mty-ale-qcmn000.dombase.net:8090"
        APP_NAME = "gfb-easycredit-web"
        ENV_FILE = "/srv/easycredit-admin/config/.env"
        EMAIL_RECIPIENTS = "uceron@bancobase.com, mreyesg@bancobase.com"
    }
    parameters {
        booleanParam(name: 'ACTIVE_ISILOANS', defaultValue: false, description: 'Activa o desactiva la consulta al servicio de Isi Loans.')
    }
    options {
        skipDefaultCheckout()
        disableConcurrentBuilds()
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        timeout(time:15, unit: 'MINUTES')
    }
    stages {
        stage('📥 Checkout & Initial Configuration') {
            steps {
                cleanWs(deleteDirs: true, notFailBuild: true)
                checkout scm

                script {
                    echo "Configuración de variables inicial"
                    if(env.BRANCH_NAME == 'qa') {
                        env.IMAGE_SUFFIX = 'qa'
                    }else if(env.BRANCH_NAME == 'develop'){
                        env.IMAGE_SUFFIX = 'dev'
                    }

                    echo "Configuración de sufijo por ambiente '${env.IMAGE_SUFFIX}'"
                    env.DOCKER_REPOSITORY = "${env.REGISTRY}/${env.APP_NAME}:${env.IMAGE_SUFFIX ?: 'latest'}"
                    echo "Rama: ${env.BRANCH_NAME} | Imagen: ${env.DOCKER_REPOSITORY}"
                }
            }
            post{
                always {
                    echo "=== LISTA DE TODAS LAS VARIABLES DE ENTORNO ==="
                    sh 'printenv | sort'
                    echo "=== FIN ==="
                }
                failure{ script { env.FAILED_STAGE = env.STAGE_NAME } }
            }
        }
        stage('⌛ Install dependencies') {
            when {
                beforeAgent true
                anyOf {
                    changeRequest target: 'develop'
                    allOf {
                        anyOf { branch 'develop'; branch 'qa' }
                        not { changeRequest() }
                    }
                }
            }
            agent {
                docker {
                    image "${env.AGENT_IMAGE}"
                    args '-u root'
                    reuseNode true
                }
            }
            steps {
                echo '*** Preparando entorno e instalando dependencias ***'
                sh 'sh scripts/setup-pnpm.sh'
                sh 'pnpm install --frozen-lockfile --prefer-offline --store-dir /tmp/pnpm-store'
            }
            post{
                failure{ script { env.FAILED_STAGE = env.STAGE_NAME } }
            }
        }
        stage('🧪 Unit Testing') {
            when {
                beforeAgent true
                changeRequest target: 'develop'
            }
            agent {
                docker {
                    image "${env.AGENT_IMAGE}"
                    args '-u root'
                    reuseNode true
                }
            }
            steps {
                echo "Ejecutando test"
                sh 'sh scripts/setup-pnpm.sh'
                sh 'pnpm run test'
            }
            post{
                failure{ script { env.FAILED_STAGE = env.STAGE_NAME } }
            }
        }
        stage('📊  Quality SonarQube'){
            when {
                beforeAgent true
                changeRequest target: 'develop'
            }
            steps {
                withSonarQubeEnv('sonarqube00') {
                   script {
                       docker.image('sonarsource/sonar-scanner-cli:10.0').inside{
                            sh "sonar-scanner -Dsonar.userHome=$WORKSPACE/.sonar"
                       }
                   }
                }
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
            post{
                failure{ script { env.FAILED_STAGE = env.STAGE_NAME } }
            }
        }
        stage('🐳 Build and push docker image') {
            when {
                allOf {
                    anyOf { branch 'develop'; branch 'qa' }
                    not { changeRequest()}
                }
            }
            steps {
                script {
                   docker.withRegistry("http://${env.REGISTRY}", 'easycredit-nexus'){
                       def fullNameImage = "${env.APP_NAME}:${env.IMAGE_SUFFIX ?: 'latest'}";
                       echo "Construyendo imagen: ${fullNameImage}"

                       def imgBuild = docker.build(
                            "${fullNameImage}",
                            "--build-arg ARG_ACTIVE_ISILOANS=${env.ACTIVE_ISILOANS} -f Dockerfile ."
                       )

                       retry(3){
                           imgBuild.push()
                       }

                       echo "****** Limpiando imágenes creadas ******"
                       sh "docker rmi ${fullNameImage} || true "
                       sh "docker rmi ${env.DOCKER_REPOSITORY} || true"
                       sh "docker images"
                   }
                }
            }
            post{
                failure{ script { env.FAILED_STAGE = env.STAGE_NAME } }
            }
        }
        stage('🚀 Deploy to instances Web (SSH) - Próximamente Deprecado') {
            when {
                allOf {
                    anyOf { branch 'develop'; branch 'qa' }
                    not { changeRequest()}
                }
            }
            steps {
                script {
                    def remote = instances["${env.IMAGE_SUFFIX}"]
                    withCredentials([sshUserPrivateKey(credentialsId: 'Jenkins-MTY-ALS-TCTN000', keyFileVariable: 'identity', usernameVariable: 'username')]){
                        remote.user = username
                        remote.identityFile = identity

                        stage("Despliegue en ${remote.name}") {
                            sshCommand remote: remote, command: """
                                sudo -u easycredit-admin -i bash -c \
                                'docker stop easycredit-web || true && docker rm easycredit-web || true && docker rmi ${env.DOCKER_REPOSITORY} || true'
                            """
                            sshCommand remote: remote, command: """
                                sudo -u easycredit-admin -i bash -c \
                                'docker run --name=easycredit-web --hostname=${remote.hostname} \
                                 --network=easycredit --restart=unless-stopped \
                                 -dp 3001:3001 --env-file=${env.ENV_FILE} ${env.DOCKER_REPOSITORY}'
                            """
                            sshCommand remote: remote, command: "sudo -u easycredit-admin -i bash -c 'docker ps -a'"
                        }
                    }
                }
            }
            post{
                failure{ script { env.FAILED_STAGE = env.STAGE_NAME } }
            }
        }
    }
    post {
        always {
            echo "¡Ejecución finalizada!"
            cleanWs()
        }
        success {
            echo "Pipeline finalizado con éxito. No se envía correo para evitar spam (opcional)."
        }
        failure {
            emailext (
                    to: "${env.EMAIL_RECIPIENTS}",
                    subject: "❌ PIPELINE FAILURE - ${currentBuild.fullDisplayName}",
                    body: """
                     <h2>Error en el proceso CI/CD</h2>
                     <h3>========= Detalles =========</h3>
                     <p><b>Proyecto:</b> ${env.APP_NAME}</p>
                     <p><b>Job:</b><a href="${env.BUILD_URL}">${env.JOB_NAME}</a></p>
                     <p><b>Rama y autor:</b> ${env.CHANGE_BRANCH} - ${env.CHANGE_AUTHOR_DISPLAY_NAME}</p>
                     <p><b>Etapa que falló:</b> ${env.FAILED_STAGE ?: 'desconocida'}</p>
                     <hr/>
                     <h4>Log</h4>
                     <pre>\${BUILD_LOG, maxLines=40, escapeHtml=true}</pre>
                """,
                mimeType: 'text/html'
            )
        }
    }
}
