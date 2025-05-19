# 使用するNode.jsのバージョンを指定 (TypeScript 3.7と互換性のあるLTS版を推奨)
FROM node:14-alpine

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# 依存関係をインストールするためにpackage.jsonとpackage-lock.jsonをコピー
# (yarnを使用する場合はyarn.lockも)
COPY package*.json ./

# 本番環境用の依存関係のみをインストール
RUN npm ci --only=production

# アプリケーションのソースコードをコピー
COPY . .

# TypeScriptをJavaScriptにコンパイル
RUN npm run build

# アプリケーションを実行するユーザーを指定 (セキュリティ向上のためroot以外を推奨)
# USER node

# アプリケーションの実行コマンド
CMD [ "node", "dist/index.js" ]
