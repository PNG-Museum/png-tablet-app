document.addEventListener('DOMContentLoaded', () => {
    // JSONファイルから記事データを取得
    fetch('data/articles.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('JSONデータの読み込みに失敗しました');
            }
            return response.json();
        })
        .then(articles => {
            displayArticles(articles);
        })
        .catch(error => {
            console.error('エラーが発生しました:', error);
            document.getElementById('articles-container').innerHTML =
                `<div class="error">データの読み込みに失敗しました。</div>`;
        });
});

// 記事を表示する関数
function displayArticles(articles) {
    const container = document.getElementById('articles-container');
    container.innerHTML = ''; // ローディング表示をクリア

    if (articles.length === 0) {
        container.innerHTML = '<div class="no-articles">記事がありません</div>';
        return;
    }

    const articlesList = document.createElement('div');
    articlesList.className = 'articles-grid';

    articles.forEach(article => {
        const articleCard = createArticleCard(article);
        articlesList.appendChild(articleCard);
    });

    container.appendChild(articlesList);
}

// 記事カードを作成する関数
function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    card.id = article.id;

    // リダイレクトURLへのリンク
    const redirectPath = `redirect/${article.id}.html`;

    card.innerHTML = `
        <div class="article-image">
            <a href="${redirectPath}">
                <img src="${article.imageUrl}" alt="${article.title}" onerror="this.src='images/placeholder.jpg'">
            </a>
        </div>
        <div class="article-content">
            <h2><a href="${redirectPath}">${article.title}</a></h2>
            <p>${article.content}</p>
            <a href="${redirectPath}" class="read-more">続きを読む</a>
        </div>
    `;

    return card;
}
