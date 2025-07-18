// scripts/build-articles.js
// 記事JSONファイルを結合してGitHub Pagesで使用可能にする
const fs = require('fs');
const path = require('path');

// ディレクトリパス
const dataDir = path.join(__dirname, '..', 'data');
const redirectDir = path.join(__dirname, '..', 'redirect');
const imagesDir = path.join(__dirname, '..', 'images');

// GitHub PagesのベースURL
const githubPagesBaseUrl = 'https://png-museum.github.io/png-tablet-app';

// JSONファイルを読み込んでパースする関数
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`ファイル読み込みエラー ${filePath}:`, error);
    return null;
  }
}

// すべての記事ファイルを取得する関数
function getArticleFiles() {
  const files = fs.readdirSync(dataDir);
  return files
    .filter(file => file.match(/^article\d+\.json$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });
}

// ディレクトリが存在することを確認する関数
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// メイン関数
function buildArticlesJson() {
  console.log('articles.jsonをビルド中...');
  
  // ディレクトリの存在確認
  ensureDirectoryExists(redirectDir);
  ensureDirectoryExists(imagesDir);
  
  // すべての記事ファイルを取得
  const articleFiles = getArticleFiles();
  console.log(`${articleFiles.length}個の記事ファイルを検出`);
  
  // すべての記事を読み込んで結合
  const articles = [];
  
  for (const file of articleFiles) {
    const filePath = path.join(dataDir, file);
    const article = readJsonFile(filePath);
    
    if (article) {
      // 元のリダイレクトURLを先に保存（重要：上書き前に保存）
      const originalRedirectUrl = article.redirectUrl;
      
      // imageUrlはそのまま保持（変換しない）
      // article.imageUrl = article.imageUrl;
      
      // リダイレクトURLを追加
      article.redirectUrl = `${githubPagesBaseUrl}/redirect/${article.id}.html`;
      
      // 元のリダイレクトURLをredirectBaseUrlとして保持
      if (originalRedirectUrl) {
        article.redirectBaseUrl = originalRedirectUrl;
      }
      
      articles.push(article);
      console.log(`処理完了: ${article.id} - ${article.title}`);
      
      // リダイレクトHTMLファイルを作成
      createRedirectHtml(article);
    }
  }
  
  // 結合したarticles.jsonを書き込み
  const outputPath = path.join(dataDir, 'articles.json');
  fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2));
  console.log(`\n${outputPath}を作成しました（${articles.length}件の記事）`);
  
  // 必要な画像ファイルの存在確認
  checkImages(articles);
}

// リダイレクトHTMLを作成する関数
function createRedirectHtml(article) {
  const redirectHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting to ${article.title}</title>
    <meta http-equiv="refresh" content="0; url=${article.redirectBaseUrl || article.redirectUrl}">
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
        .redirect-message {
            text-align: center;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="redirect-message">
        <h2>${article.title}</h2>
        <p>リダイレクト中...</p>
        <p>自動的に移動しない場合は<a href="${article.redirectBaseUrl || article.redirectUrl}">こちら</a>をクリックしてください。</p>
    </div>
</body>
</html>`;
  
  const redirectPath = path.join(redirectDir, `${article.id}.html`);
  fs.writeFileSync(redirectPath, redirectHtml);
  console.log(`Created redirect: ${redirectPath}`);
}

// 画像ファイルの存在を確認する関数
function checkImages(articles) {
  console.log('\n画像ファイルを確認中...');
  
  const missingImages = new Set();
  
  for (const article of articles) {
    if (!article.imageUrl) continue;
    
    // 相対パスをそのまま使用してチェック
    const localImagePath = path.join(__dirname, '..', article.imageUrl);
    
    if (!fs.existsSync(localImagePath)) {
      missingImages.add(article.imageUrl);
      console.warn(`⚠️  画像が見つかりません: ${article.id} - ${article.imageUrl}`);
    }
  }
  
  if (missingImages.size > 0) {
    console.warn(`\n${missingImages.size}個の画像ファイルが不足しています`);
  } else {
    console.log('✓ すべての画像ファイルが存在します');
  }
}

// ビルドを実行
buildArticlesJson();