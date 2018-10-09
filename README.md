# Pilgrims
A clone of the popular "Settlers of Catan", written in Typescript.

To play run: 

    docker network create traefik_proxy
    docker build -t pilgrims .
    docker-compose up -d

If you have a running traefik service you can access the app at pilgrims.localhost. 
Otherwise, run `docker inspect pilgrims | grep IPAddress` to find the ip adress of the app.