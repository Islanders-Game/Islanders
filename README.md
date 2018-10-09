# Pilgrims
A clone of the popular "Settlers of Catan", written in Typescript.

Run 'docker network create traefik_proxy'
Run 'docker build -t pilgrims .'
Run 'docker-compose up -d'

If you have a running traefik service you can access the app at pilgrims.localhost, otherwise 'docker inspect pilgrims | grep IPAddress' to find the ip adress of the app.