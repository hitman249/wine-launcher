#!/bin/bash

docker-compose up -d --build wl
docker-compose run wl "$@"