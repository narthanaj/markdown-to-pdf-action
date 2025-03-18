# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this GitHub Action, please submit an issue or a pull request. For sensitive vulnerabilities, please contact the maintainer directly.

## Security Measures

This action has been designed with security in mind:

1. **Direct Puppeteer Usage**: We use Puppeteer directly rather than relying on the vulnerable `markdown-pdf` package to avoid security issues related to that package.

2. **Sandbox Disabled**: The `--no-sandbox` flag is used in the Docker container environment for compatibility reasons. This is a common practice for containerized Puppeteer usage and does not pose a significant security risk in the context of a GitHub Action, as the container itself provides isolation.

3. **File System Isolation**: The action only operates on files within the GitHub workspace, and doesn't access files outside of the specified directories.

4. **Regular Dependency Updates**: Dependencies are regularly updated to patch known vulnerabilities.

## Dependency Security

We take dependencies security seriously. We've removed dependencies with known vulnerabilities that were not being actively used in our implementation:

1. Removed `markdown-pdf` which had high severity vulnerabilities
2. Uses only necessary packages for the conversion process

## Best Practices for Users

When using this GitHub Action:

1. Always specify the version tag when using this action (e.g., `uses: username/markdown-to-pdf-action@v1`) rather than using `@main` to ensure you're using a stable, reviewed version.

2. Be cautious about the Markdown content you convert - remember that this action will execute any HTML included in your Markdown as part of the conversion process.

3. If you're using custom CSS files, ensure they come from trusted sources.

4. Regularly update your workflows to use the latest version of this action.