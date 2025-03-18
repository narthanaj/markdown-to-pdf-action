# Development Guide

This document provides instructions for local development and testing of the Markdown to PDF Converter Action.

## Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/markdown-to-pdf-action.git
   cd markdown-to-pdf-action
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the setup script to ensure everything is configured properly:
   ```
   node local-setup.js
   ```

## Local Testing

To test the conversion script locally:

```
node convert.js <markdown_dir> <markdown_file> <output_dir>
```

Example:
```
node convert.js ./ README.md ./output
```

### Advanced Local Testing

You can test with additional options:

```
node convert.js ./ README.md ./output '{"format":"A4"}' ./custom.css true true github custom-name
```

The parameters are:
1. Markdown directory
2. Markdown file (relative to markdown directory)
3. Output directory
4. PDF options (JSON string)
5. Custom CSS file
6. Table of contents (true/false)
7. Include metadata (true/false)
8. Highlight style
9. Custom output filename

## Troubleshooting

### Puppeteer Issues

If you encounter issues with Puppeteer:

1. Make sure you have a compatible browser installed
2. Check if there are any permission issues
3. Try running with the `--no-sandbox` flag (done automatically in the script)

The script will automatically detect if it's running locally or in the GitHub Action environment and adjust the browser path accordingly.

### CSS or Styling Issues

To debug styling issues:

1. Generate an HTML file instead for inspection:
   ```javascript
   // Add this to convert.js for debugging
   await fs.writeFile('debug-output.html', html);
   ```

2. Open the HTML file in a browser to check styling

## Building Docker Image Locally

To test the Docker image locally:

1. Build the image:
   ```
   docker build -t markdown-to-pdf .
   ```

2. Run the container:
   ```
   docker run -v $(pwd):/workspace markdown-to-pdf /workspace/README.md /workspace/output
   ```

## CI Testing

To test changes in GitHub Actions:

1. Push changes to a branch
2. Create a pull request
3. The workflow in `.github/workflows/test.yml` will run automatically to test the action

## Publishing a New Version

1. Update version in `package.json`
2. Commit and push changes
3. Create a new tag and release on GitHub:
   ```
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. Create a release on GitHub with release notes