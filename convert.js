const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const puppeteer = require('puppeteer');
const markdownIt = require('markdown-it');
const highlightjs = require('markdown-it-highlightjs');
const anchor = require('markdown-it-anchor');
const toc = require('markdown-it-table-of-contents');

// Parse input arguments
const markdownDir = process.argv[2] || '.';
const markdownFile = process.argv[3];
const outputDir = process.argv[4] || './pdf-output';
const pdfOptionsString = process.argv[5] || '{}';
const cssFile = process.argv[6];
const tableOfContents = process.argv[7] === 'true';
const includeMetadata = process.argv[8] === 'true';
const highlightStyle = process.argv[9] || 'github';
const customOutputFilename = process.argv[10];

// Log execution start with parameters
console.log('Starting Markdown to PDF conversion with the following parameters:');
console.log(`- Markdown Directory: ${markdownDir}`);
console.log(`- Specific Markdown File: ${markdownFile || 'Not specified (converting all)'}`);
console.log(`- Output Directory: ${outputDir}`);
console.log(`- Custom CSS: ${cssFile || 'None'}`);
console.log(`- Table of Contents: ${tableOfContents}`);
console.log(`- Include Metadata: ${includeMetadata}`);
console.log(`- Highlight Style: ${highlightStyle}`);
console.log(`- Custom Output Filename: ${customOutputFilename || 'None (using input filename)'}`);

// Make sure output directory exists
fs.ensureDirSync(outputDir);

// Parse PDF options
let pdfOptions = {};
try {
  pdfOptions = JSON.parse(pdfOptionsString);
} catch (err) {
  console.error('Error parsing PDF options:', err.message);
  console.log('Using default PDF options instead');
}

// Default PDF generation options
const defaultOptions = {
  format: 'A4',
  margin: {
    top: '40px',
    right: '50px',
    bottom: '40px',
    left: '50px'
  },
  printBackground: true
};

// Merge default options with user-provided options
const finalPdfOptions = { ...defaultOptions, ...pdfOptions };

// Default highlight styles
const highlightStyles = {
  github: path.join(__dirname, 'node_modules/highlight.js/styles/github.css'),
  vs: path.join(__dirname, 'node_modules/highlight.js/styles/vs.css'),
  'atom-one': path.join(__dirname, 'node_modules/highlight.js/styles/atom-one-light.css')
};

// Create a custom CSS for the PDF
const createCustomCss = async () => {
  let css = '';
  
  // Add syntax highlighting styles
  if (highlightStyle && highlightStyles[highlightStyle]) {
    try {
      css += await fs.readFile(highlightStyles[highlightStyle], 'utf8');
    } catch (err) {
      console.warn(`Could not load highlight style: ${highlightStyle}`, err);
    }
  }
  
  // Add custom CSS if provided
  if (cssFile) {
    try {
      const customCss = await fs.readFile(path.resolve(cssFile), 'utf8');
      css += `\n${customCss}`;
    } catch (err) {
      console.error(`Error reading custom CSS file: ${cssFile}`, err);
    }
  }
  
  // Add default styling with better emoji support
  css += `
    body {
      font-family: 'Noto Sans', 'Noto Color Emoji', 'Symbola', sans-serif;
      line-height: 1.5;
      color: #24292e;
      max-width: 100%;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
      font-family: 'Noto Sans', 'Noto Color Emoji', 'Symbola', sans-serif;
    }
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
    code { background-color: rgba(27,31,35,.05); padding: .2em .4em; border-radius: 3px; }
    pre { padding: 16px; overflow: auto; line-height: 1.45; background-color: #f6f8fa; border-radius: 3px; }
    blockquote { padding: 0 1em; color: #6a737d; border-left: .25em solid #dfe2e5; }
    table { border-collapse: collapse; width: 100%; }
    table, th, td { border: 1px solid #dfe2e5; }
    th, td { padding: 6px 13px; }
    img { max-width: 100%; height: auto; }
    
    .hljs { display: block; overflow-x: auto; padding: 0.5em; background: #f6f8fa; }
    
    /* Table of contents styling */
    .table-of-contents { 
      background-color: #f8f9fa;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    .table-of-contents ul { padding-left: 20px; }
    .table-of-contents a { text-decoration: none; }
  `;
  
  // Create a temporary CSS file
  const tempCssPath = path.join('/tmp', `md-to-pdf-${Date.now()}.css`);
  await fs.writeFile(tempCssPath, css);
  return tempCssPath;
};

// Process a single markdown file
const convertMarkdownToPdf = async (markdownFilePath) => {
  try {
    // Read markdown content
    const markdown = await fs.readFile(markdownFilePath, 'utf8');
    
    // Configure markdown parser
    const md = markdownIt({
      html: true,
      xhtmlOut: true,
      breaks: true,
      linkify: true,
      typographer: true
    });
    
    // Add plugins
    md.use(highlightjs);
    md.use(anchor);
    
    if (tableOfContents) {
      md.use(toc, {
        includeLevel: [1, 2, 3],
        containerClass: 'table-of-contents',
        markerPattern: /^\[\[toc\]\]/im
      });
      
      // Add table of contents marker if not already present and TOC is enabled
      if (!markdown.includes('[[toc]]')) {
        const tocMd = '[[toc]]\n\n' + markdown;
        await fs.writeFile(markdownFilePath + '.tmp.md', tocMd);
        markdownFilePath = markdownFilePath + '.tmp.md';
      }
    }
    
    // Get custom CSS
    const cssPath = await createCustomCss();
    
    // Setup PDF file path
    let pdfFileName;
    if (customOutputFilename) {
      pdfFileName = `${customOutputFilename}.pdf`;
    } else {
      const baseName = path.basename(markdownFilePath, path.extname(markdownFilePath));
      pdfFileName = `${baseName}.pdf`;
    }
    
    const outputPath = path.join(outputDir, pdfFileName);
    
    // Check if we're running in a Docker container (GitHub Action) or locally
    const isDocker = fs.existsSync('/.dockerenv') || process.env.GITHUB_ACTIONS;
    
    const puppeteerOptions = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true // Use boolean for better compatibility with older Puppeteer versions
    };
    
    // Only specify executablePath if running in Docker
    if (isDocker) {
      puppeteerOptions.executablePath = '/usr/bin/chromium';
    }
    
    const browser = await puppeteer.launch(puppeteerOptions);
    
    const page = await browser.newPage();
    
    // Read the markdown file and convert to HTML
    const html = md.render(markdown);
    
    // Add CSS to the page
    const css = await fs.readFile(cssPath, 'utf8');
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>${css}</style>
      </head>
      <body>${html}</body>
      </html>
    `);
    
    // Configure the page for better emoji support
    try {
      // Try to wait for fonts to load
      await page.evaluate(() => {
        // This will resolve when fonts are loaded or reject if not supported
        return Promise.resolve(document.fonts.ready).catch(() => Promise.resolve());
      });
    } catch (err) {
      console.log("Font loading check not fully supported, continuing anyway");
    }

    try {
      // Add additional font configuration for emoji support
      await page.addStyleTag({
        content: `
          @font-face {
            font-family: 'Noto Color Emoji';
            src: local('Noto Color Emoji');
          }
          
          @font-face {
            font-family: 'Symbola';
            src: local('Symbola');
          }
        `
      });
    } catch (err) {
      console.log("Could not add font configuration:", err.message);
    }

    // Ensure fonts are loaded before generating PDF
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate PDF
    await page.pdf({
      path: outputPath,
      ...finalPdfOptions
    });
    
    await browser.close();
    
    // Clean up temporary files
    if (markdownFilePath.endsWith('.tmp.md')) {
      await fs.remove(markdownFilePath);
    }
    await fs.remove(cssPath);
    
    console.log(`Successfully converted ${markdownFilePath} to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error converting ${markdownFilePath} to PDF:`, error);
    process.exit(1);
  }
};

// Main execution
(async () => {
  try {
    if (markdownFile) {
      // Convert a specific file
      const filePath = path.join(markdownDir, markdownFile);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Markdown file not found: ${filePath}`);
      }
      await convertMarkdownToPdf(filePath);
    } else {
      // Convert all markdown files in the directory
      const markdownFiles = glob.sync(path.join(markdownDir, '**/*.md'));
      
      if (markdownFiles.length === 0) {
        console.log('No markdown files found in the specified directory.');
        process.exit(0);
      }
      
      console.log(`Found ${markdownFiles.length} markdown files to convert.`);
      
      for (const file of markdownFiles) {
        await convertMarkdownToPdf(file);
      }
    }
    
    console.log('Markdown to PDF conversion completed successfully!');
  } catch (error) {
    console.error('Error in markdown to PDF conversion:', error);
    process.exit(1);
  }
})();