// This script combines all individual article JSON files into a single articles.json file
const fs = require('fs');
const path = require('path');

// Directory containing article files
const dataDir = path.join(__dirname, '..', 'data');

// Base URL for GitHub Pages
const githubPagesBaseUrl = 'https://dolphiiiin.github.io/png-tablet-app';

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

// Main function to build articles.json
function buildArticlesJson() {
  console.log('Building articles.json from individual article files...');

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
}

// Execute the main function
buildArticlesJson();
