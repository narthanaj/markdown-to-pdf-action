# Markdown to PDF Converter Action

A GitHub Action that converts Markdown files to beautifully formatted PDF documents with customizable styling options.

## Features

- 📄 Convert single Markdown files or entire directories to PDF
- 🎨 Customize PDF appearance with CSS
- 📑 Add automatic table of contents
- 🖌️ Syntax highlighting for code blocks
- 📏 Adjustable page sizes and margins
- 🔄 Configurable conversion options

## Usage

### Basic Usage

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
  
  - name: Convert Markdown to PDF
    uses: your-username/markdown-to-pdf-action@v1
    with:
      markdown_file: 'README.md'
      output_dir: './pdf-output'
```

### Advanced Usage

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
  
  - name: Convert Markdown to PDF
    uses: your-username/markdown-to-pdf-action@v1
    with:
      markdown_dir: './docs'
      markdown_file: 'guide.md'
      output_dir: './pdf-output'
      css_file: './custom/style.css'
      table_of_contents: 'true'
      include_metadata: 'true'
      highlight_style: 'github'
      output_filename: 'user-guide'
      pdf_options: '{"format": "A4", "margin": {"top": "50px", "right": "50px", "bottom": "50px", "left": "50px"}}'
  
  - name: Upload PDFs as artifacts
    uses: actions/upload-artifact@v4
    with:
      name: pdf-files
      path: './pdf-output/*.pdf'
```

### Complete Workflow Example

See [sample-usage.yml](.github/workflows/sample-usage.yml) for a complete workflow example.

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `markdown_dir` | Directory containing markdown files to convert | No | `.` |
| `markdown_file` | Specific markdown file to convert (relative to markdown_dir) | No | |
| `output_dir` | Directory to save the generated PDFs | No | `./pdf-output` |
| `pdf_options` | Additional options for PDF generation in JSON format | No | `{}` |
| `css_file` | Custom CSS file for styling the PDF output | No | |
| `table_of_contents` | Generate table of contents | No | `false` |
| `include_metadata` | Whether to include YAML front matter metadata | No | `true` |
| `highlight_style` | Syntax highlighting style (e.g., github, vs, atom-one) | No | `github` |
| `output_filename` | Custom output filename (without extension) | No | |

## PDF Options

You can customize the PDF output by providing JSON configuration in the `pdf_options` input. This is passed directly to Puppeteer's PDF function. Some common options include:

```json
{
  "format": "A4",
  "landscape": false,
  "margin": {
    "top": "50px",
    "right": "50px",
    "bottom": "50px",
    "left": "50px"
  },
  "printBackground": true,
  "displayHeaderFooter": false
}
```

For the full list of options, see [Puppeteer's documentation](https://pptr.dev/api/puppeteer.pdfoptions).

## Custom CSS

You can provide a custom CSS file to style your PDF output. Example:

```css
body {
  font-family: 'Arial', sans-serif;
  font-size: 12pt;
  line-height: 1.6;
}

h1 {
  color: #003366;
  border-bottom: 1px solid #cccccc;
}

code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
}
```

## Table of Contents

When `table_of_contents` is set to `true`, the action will automatically generate a table of contents at the beginning of your document.

If you want to control where the table of contents appears, you can add the marker `[[toc]]` anywhere in your markdown file.

## Development

To build this action for development:

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Test locally with:
   ```
   node convert.js ./path/to/markdown ./specific-file.md ./output-dir
   ```

## License

This action is released under the [MIT License](LICENSE).