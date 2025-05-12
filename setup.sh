#!/bin/bash
cp admin/.env.example admin/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.example .env
docker-compose up mongodb -d --build

