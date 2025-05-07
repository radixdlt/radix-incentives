#!/bin/bash


docker build --no-cache -f ./dockerfiles/incentives.Dockerfile -t radix-incentives:latest .

docker build --no-cache -f ./dockerfiles/admin.Dockerfile -t radix-admin:latest .

docker build --no-cache -f ./dockerfiles/consultation.Dockerfile -t radix-consultation:latest .