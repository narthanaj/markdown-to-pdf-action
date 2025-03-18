# DockerHub Integration Setup

This document explains how to set up the DockerHub integration for automatic building and publishing of the Docker image used by this GitHub Action.

## Initial Setup

1. **Create a DockerHub Repository**

   - Sign in to your DockerHub account
   - Navigate to "Repositories" > "Create Repository"
   - Name it `markdown-to-pdf-action`
   - Set visibility as needed (public is recommended for GitHub Actions)
   - Click "Create"

2. **Create GitHub Secrets**

   You need to add DockerHub credentials to your GitHub repository secrets:

   - Go to your GitHub repository
   - Navigate to "Settings" > "Secrets and variables" > "Actions"
   - Add the following secrets:
     - `DOCKERHUB_USERNAME`: Your DockerHub username
     - `DOCKERHUB_TOKEN`: A DockerHub access token (not your password)

   To create a DockerHub access token:
   - Log in to DockerHub
   - Go to "Account Settings" > "Security" > "New Access Token"
   - Give it a name like "GitHub Actions"
   - Copy the token and save it as the `DOCKERHUB_TOKEN` secret in GitHub

3. **Initial Image Build**

   After setting up the secrets, go to your GitHub repository and:
   
   - Navigate to "Actions" tab
   - Select the "Build and Push Docker Image" workflow
   - Click "Run workflow" and select the main branch
   - This will build and push the initial Docker image to DockerHub

## How It Works

1. **Automatic Builds**

   The Docker image will be automatically built and pushed to DockerHub whenever:
   
   - Changes are made to `Dockerfile`, `convert.js`, or `package.json` in the main branch
   - A new release is published
   - The workflow is manually triggered

2. **Versioning**

   The workflow creates several tags for your Docker image:
   
   - `latest`: Always points to the most recent build from the main branch
   - `1.0.0`: Specific version tag (when you create a release with a version tag)
   - `1.0`: Major.minor version tag
   - `sha-abc123`: Short commit SHA for each build

3. **Using a Specific Version**

   To use a specific version of the Docker image in your action.yml:
   
   ```yaml
   runs:
     using: 'docker'
     image: 'docker://yourdockerhub/markdown-to-pdf-action:1.0.0'
   ```

## Customization

- **Change the Repository Name**: If you want to use a different name for your DockerHub repository, make sure to update all references to `yourdockerhub/markdown-to-pdf-action` in both `action.yml` and `.github/workflows/docker-build.yml` files.

- **Cache Settings**: The workflow uses Docker's BuildKit cache to speed up builds. You can adjust cache settings in the workflow file if needed.

## Troubleshooting

If the automatic build process fails:

1. Check the GitHub Actions logs for specific error messages
2. Verify that your DockerHub credentials are correct
3. Ensure your DockerHub account has permission to push to the repository
4. Try running the workflow manually to debug issues