#!/bin/bash
# Script to manually build and push the Docker image to DockerHub

# Replace with your DockerHub username
DOCKERHUB_USERNAME="yourdockerhub"
IMAGE_NAME="markdown-to-pdf-action"
TAG="latest"

# Build the Docker image
echo "Building Docker image: $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG"
docker build -t $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG .

# Verify the build was successful
if [ $? -ne 0 ]; then
  echo "Docker build failed!"
  exit 1
fi

# Log in to DockerHub
echo "Logging in to DockerHub..."
docker login

# Push the image
echo "Pushing image to DockerHub..."
docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG

echo "Image pushed successfully: $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG"

# Optional: Tag with version if provided
if [ ! -z "$1" ]; then
  VERSION_TAG=$1
  echo "Tagging with version: $VERSION_TAG"
  docker tag $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION_TAG
  docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION_TAG
  echo "Version tag pushed successfully: $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION_TAG"
fi

echo "Process completed successfully!"