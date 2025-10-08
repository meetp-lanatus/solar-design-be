#!/bin/bash

# Run Docker Compose
echo "Starting Docker Compose..."
docker-compose --file deployments/compose.yaml --env-file .env up --detach

echo "Script executed successfully."
