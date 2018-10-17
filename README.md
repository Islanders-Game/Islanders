![header](doc/header-simple.jpg "Pilgrims")

[![Build Status](https://jenkins.anderswind.dk/buildStatus/icon?job=Pilgrims/master)](https://jenkins.anderswind.dk/job/Pilgrims/job/master/) 
[![Maintainability](https://api.codeclimate.com/v1/badges/e9e2a40371b22a5460ad/maintainability)](https://codeclimate.com/github/Awia00/Pilgrims/maintainability)

A clone of the popular "Settlers of Catan", written in Typescript.

To play run: 

    docker network create traefik_proxy
    docker build -t pilgrims/pilgrims-shared ./pilgrims-shared
    docker build -t pilgrims/pilgrims-client ./pilgrims-client
    docker build -t pilgrims/pilgrims-server ./pilgrims-server
    docker-compose up -d

If you have a running traefik service you can access the app at pilgrims.localhost. 
Otherwise, run `docker inspect pilgrims-client | grep IPAddress` to find the ip address of the app.
