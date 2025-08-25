#!/bin/sh

docker login ghrc.io -u SheepTester

docker build -t hello-world:latest .
docker tag hello-world:latest ghrc.io/SheepTester/hello-world:1.0.0
docker push ghrc.io/SheepTester/hello-world:1.0.0

# make sure it works
docker pull ghrc.io/SheepTester/hello-world:1.0.0
