# wichat_es1b

[![Actions Status](https://github.com/arquisoft/wichat_es1b/workflows/CI%20for%20wichat_es1b/badge.svg)](https://github.com/arquisoft/wichat_es1b/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_es1b&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_es1b)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_es1b&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_es1b)
[![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_es1b&metric=sqale_rating)](https://sonarcloud.io/summary/overall?id=Arquisoft_wichat_es1b&branch=master)
[![CodeScene Average Code Health](https://codescene.io/projects/65362/status-badges/average-code-health)](https://codescene.io/projects/65362)
[![CodeScene Hotspot Code Health](https://codescene.io/projects/65362/status-badges/hotspot-code-health)](https://codescene.io/projects/65362)
[![CodeScene System Mastery](https://codescene.io/projects/65362/status-badges/system-mastery)](https://codescene.io/projects/65362)
[![CodeScene general](https://codescene.io/images/analyzed-by-codescene-badge.svg)](https://codescene.io/projects/65362)

<p float="left">
<img src="https://blog.wildix.com/wp-content/uploads/2020/06/react-logo.jpg" height="100">
<img src="https://miro.medium.com/max/365/1*Jr3NFSKTfQWRUyjblBSKeg.png" height="100">
<img src="https://2024.allthingsopen.org/wp-content/uploads/2024/05/Gold_MongoDB_FG.jpg" height="100">
<img src="https://github.com/Arquisoft/wichat_es1b/blob/master/docs/images/Empathy.gif" height="100">
</p>

![logo - Copy](https://github.com/user-attachments/assets/e06cbf79-130b-40af-8ceb-f23ae51a470b)


## 🐉 Sobre Wichat
Bienvenido a Wichat, una aplicación moderna y escalable para el uso como un Juego Quizz. Este proyecto ha sido desarrollado como parte del grado de Ingeniería Informatica del Software en la Universidad de Oviedo, más en concreto como parte de la asignatura Arquitectura del Software.


![image](https://github.com/user-attachments/assets/3b73b88a-5357-41f7-9510-11d79621638e)



## :brain: ¿Cómo funciona el Quizz?
### ✈️ Generación de preguntas dinámicas:

![Screenshot 2025-04-27 195252](https://github.com/user-attachments/assets/b16ff06c-3f4e-4678-8ea3-28d9170df468)

Las preguntas se generan dinámicamente a partir de consultas a WikiData, utilizando información relevante como imágenes y etiquetas asociadas.
Cada pregunta incluye una imagen y un conjunto de opciones de respuesta, de las cuales solo una es correcta.
### :right_anger_bubble: Categorías temáticas:

Las preguntas se agrupan en categorías como Geografía, Cultura, Personajes, Videojuegos, Aviones y un modo Aleatorio.
Cada categoría tiene un conjunto de consultas específicas para garantizar la relevancia y variedad de las preguntas.
### :space_invader: Modos de juego

![Screenshot 2025-04-27 194642](https://github.com/user-attachments/assets/075f285f-29ab-411e-92bf-4232b7d271ce)

#### SinglePlayer
- Los usuarios pueden iniciar una partida seleccionando una categoría específica o eligiendo todas las categorías.
- Durante el juego, se presentan preguntas únicas y aleatorias para evitar repeticiones.
- Validación y manejo de respuestas.
- Al finalizar, se muestran las estadísticas de la partida:

    ![Screenshot 2025-04-27 201249](https://github.com/user-attachments/assets/da2066cc-13b4-414d-bd5e-47e7942f863a)
  

#### Multiplayer
- Los usuarios podrán poner a prueba sus habilidades contra sus amigos en una batalla de tiempo limitado.
- El objetivo es acertar el mayor número de preguntas para llevarse la victoria.
- En cada partida se generará un 'pool' compartido de preguntas, de tal forma que todos los usuarios tienen las mismas, solo que cada uno las verá en distinto orden para evitar tramposos.
- Dos o más jugadores podrán ser invitados a formar parte de la misma sala y así competir entre ellos:
  
    ![Screenshot 2025-04-27 195833](https://github.com/user-attachments/assets/6fade4af-9cb4-4d38-b473-bd53de5a23a8)

- Al terminar la partida, todos los jugadores verán el ránking final, así como quién ha sido el ganador:

    ![Screenshot 2025-04-27 200157](https://github.com/user-attachments/assets/17c3cfe7-c4f8-40af-a0a0-8bc8f49d31b0)




## Quick start guide

First, clone the project:

```git clone git@github.com:arquisoft/wichat_es1b.git```

### LLM API key configuration

In order to communicate with the LLM integrated in this project, we need to setup an API key. Two integrations are available in this propotipe: gemini and empaphy. The API key provided must match the LLM provider used.

We need to create two .env files. 
- The first one in the webapp directory (for executing the webapp using ```npm start```). The content of this .env file should be as follows:
```
REACT_APP_LLM_API_KEY="YOUR-API-KEY"
```
- The second one located in the root of the project (along the docker-compose.yml). This .env file is used for the docker-compose when launching the app with docker. The content of this .env file should be as follows:
```
LLM_API_KEY="YOUR-API-KEY"
```

Note that these files must NOT be uploaded to the github repository (they are excluded in the .gitignore).

An extra configuration for the LLM to work in the deployed version of the app is to include it as a repository secret (LLM_API_KEY). This secret will be used by GitHub Action when building and deploying the application.


### Launching Using docker
For launching the propotipe using docker compose, just type:
```docker compose --profile dev up --build```

### Component by component start
First, start the database. Either install and run Mongo or run it using docker:

```docker run -d -p 27017:27017 --name=my-mongo mongo:latest```

You can use also services like Mongo Altas for running a Mongo database in the cloud.

Now launch the auth, user and gateway services. Just go to each directory and run `npm install` followed by `npm start`.

Lastly, go to the webapp directory and launch this component with `npm install` followed by `npm start`.

After all the components are launched, the app should be available in localhost in port 3000.

## Deployment
For the deployment, we have several options. The first and more flexible is to deploy to a virtual machine using SSH. This will work with any cloud service (or with our own server). Other options include using the container services that all the cloud services provide. This means, deploying our Docker containers directly. Here I am going to use the first approach. I am going to create a virtual machine in a cloud service and after installing docker and docker-compose, deploy our containers there using GitHub Actions and SSH.

### Machine requirements for deployment
The machine for deployment can be created in services like Microsoft Azure or Amazon AWS. These are in general the settings that it must have:

- Linux machine with Ubuntu > 20.04 (the recommended is 24.04).
- Docker installed.
- Open ports for the applications installed (in this case, ports 3000 for the webapp and 8000 for the gateway service).

Once you have the virtual machine created, you can install **docker** using the following instructions:

```ssh
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
sudo apt install docker-ce
sudo usermod -aG docker ${USER}
```

### Continuous delivery (GitHub Actions)
Once we have our machine ready, we could deploy by hand the application, taking our docker-compose file and executing it in the remote machine. In this repository, this process is done automatically using **GitHub Actions**. The idea is to trigger a series of actions when some condition is met in the repository. The precondition to trigger a deployment is going to be: "create a new release". The actions to execute are the following:

![imagen](https://github.com/user-attachments/assets/7ead6571-0f11-4070-8fe8-1bbc2e327ad2)


As you can see, unitary tests of each module and e2e tests are executed before pushing the docker images and deploying them. Using this approach we avoid deploying versions that do not pass the tests.

The deploy action is the following:

```yml
deploy:
    name: Deploy over SSH
    runs-on: ubuntu-latest
    needs: [docker-push-userservice,docker-push-authservice,docker-push-llmservice,docker-push-gatewayservice,docker-push-webapp]
    steps:
    - name: Deploy over SSH
      uses: fifsky/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        user: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_KEY }}
        command: |
          wget https://raw.githubusercontent.com/arquisoft/wichat_es1b/master/docker-compose.yml -O docker-compose.yml
          docker compose --profile prod down
          docker compose --profile prod up -d --pull always
```

This action uses three secrets that must be configured in the repository:
- DEPLOY_HOST: IP of the remote machine.
- DEPLOY_USER: user with permission to execute the commands in the remote machine.
- DEPLOY_KEY: key to authenticate the user in the remote machine.

Note that this action logs in the remote machine and downloads the docker-compose file from the repository and launches it. Obviously, previous actions have been executed which have uploaded the docker images to the GitHub Packages repository.
