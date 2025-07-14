const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dataDir = path.join(__dirname, '../data');
const inputDir = path.join(__dirname, '../images');
const outputDir = path.join(__dirname, '../images');
const outputFile = path.join(outputDir, 'packed-articles.png');

const canvasSize = 2048;
const grid = 2;
const cellSize = canvasSize / grid;

async function packImages() {
    // dataディレクトリ内の.jsonファイル名を取得
    const jsonFiles = fs.readdirSync(dataDir)
        .filter(f => f.endsWith('.json') && f.startsWith('article') && !(f === 'articles.json'))

    console.log(jsonFiles);

    if (jsonFiles.length !== 4) {
        console.error('article1.json～article4.jsonが4つ存在する必要があります。');
        return;
    }

    // 画像ファイル名リストを作成
    // 各JSONファイルから画像名を取得
    const imageNames = jsonFiles.map(file => {
        const filePath = path.join(dataDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data.image; // 各記事の画像名を取得
    });

    const compositeList = [];

    for (let i = 0; i < imageNames.length; i++) {
        const imgPath = path.join(inputDir, `${imageNames[i]}`);
        if (!fs.existsSync(imgPath)) {
            console.error(`ファイルが見つかりません: ${imgPath}`);
            return;
        }
        const buffer = await sharp(imgPath)
            .resize(cellSize, cellSize, { fit: 'inside' })
            .toBuffer();

        // 画像をグリッドに配置
        // const x = (i % grid) * cellSize;
        // const y = Math.floor(i / grid) * cellSize;

        // i:0 -> (0,0), i:1 -> (2048,0), i:2 -> (0,2048), i:3 -> (2048,2048)
        // const x = (i % 2) * cellSize;
        let x = 0;
        if (i % 2 === 1) x = cellSize;
        let y = 0;
        if( i > 1) y= cellSize;

        compositeList.push({ input: buffer, left: x, top: y });
    }

    await sharp({
        create: {
            width: canvasSize,
            height: canvasSize,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
        .composite(compositeList)
        .png()
        .toFile(outputFile);

    console.log(`パッキング完了: ${outputFile}`);
}

packImages().catch(err => {
    console.error('エラー:', err);
});