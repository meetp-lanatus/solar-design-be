#!/bin/bash

# Stop all running Docker containers
echo "Stopping all running Docker containers..."
docker stop $(docker ps -q)

# Remove all stopped containers
echo "Removing all stopped Docker containers..."
docker container prune -f

# Remove all Docker images
echo "Removing all Docker images..."
docker image prune --all -f

# Remove all unused Docker volumes
echo "Cleaning up all Docker volumes..."
docker volume prune -f

# Remove all unused Docker networks
echo "Cleaning up all Docker networks..."
docker network prune -f

echo "Docker prune system..."
docker system prune --all -f

echo "Docker prune completed successfully."

echo "Script executed successfully."
