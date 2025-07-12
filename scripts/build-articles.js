// This script combines all individual article JSON files into a single articles.json file
// and generates redirect HTML files based on the article data
const fs = require('fs');
const path = require('path');

// Directory paths
const dataDir = path.join(__dirname, '..', 'data');
const redirectDir = path.join(__dirname, '..', 'redirect');
const scriptsDir = path.join(__dirname);

// Base URL for GitHub Pages
const githubPagesBaseUrl = 'https://png-museum.github.io/png-tablet-app';

// Function to read and parse JSON file
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Function to get all article files
function getArticleFiles() {
  const files = fs.readdirSync(dataDir);
  return files
    .filter(file => file.match(/^article\d+\.json$/)) // Only match article1.json, article2.json, etc.
    .map(file => path.join(dataDir, file));
}

// Function to generate redirect HTML from template
function generateRedirectHtml(articleId) {
  // Read the template file
  const templatePath = path.join(scriptsDir, 'base_article.html');
  let templateContent = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders
  templateContent = templateContent.replace(/{{ARTICLE_ID}}/g, articleId);

  return templateContent;
}

// Function to generate redirect HTML files for all articles
function generateRedirectFiles(articles) {
  console.log('Generating redirect HTML files...');

  // Ensure redirect directory exists
  if (!fs.existsSync(redirectDir)) {
    fs.mkdirSync(redirectDir, { recursive: true });
    console.log(`Created redirect directory: ${redirectDir}`);
  }

  // Generate redirect files for each article
  articles.forEach(article => {
    const redirectFilePath = path.join(redirectDir, `${article.id}.html`);
    fs.writeFileSync(redirectFilePath, generateRedirectHtml(article.id));
    console.log(`Generated redirect file: ${article.id}.html`);
  });
}

// Main function to build articles.json and redirect HTML files
function buildArticlesAndRedirects() {
  console.log('Building articles.json and redirect HTML files from individual article files...');

  const articleFiles = getArticleFiles();
  const articles = [];

  for (const filePath of articleFiles) {
    const article = readJsonFile(filePath);
    if (article) {
      // Modify article structure for articles.json
      const modifiedArticle = {
        ...article,
        redirectBaseUrl: article.redirectUrl, // Store original redirect URL as redirectBaseUrl
        redirectUrl: `${githubPagesBaseUrl}/redirect/${article.id}.html` // Set redirectUrl to GitHub Pages redirect page
      };

      articles.push(modifiedArticle);
      console.log(`Added article: ${article.title}`);
    }
  }

  // Sort articles by ID to maintain order
  articles.sort((a, b) => {
    const idA = parseInt(a.id.replace('article', ''));
    const idB = parseInt(b.id.replace('article', ''));
    return idA - idB;
  });

  // Write the combined data to articles.json
  const outputPath = path.join(dataDir, 'articles.json');
  fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2));
  console.log(`Successfully created/updated articles.json with ${articles.length} articles`);

  // Generate redirect HTML files
  generateRedirectFiles(articles);
}

// Execute the main function
buildArticlesAndRedirects();
