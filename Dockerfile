# 使用するNode.jsのバージョンを指定 (TypeScript 3.7と互換性のあるLTS版を推奨)
FROM node:14-alpine AS builder

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# 依存関係をインストールするためにpackage.jsonとpackage-lock.jsonをコピー
# (yarnを使用する場合はyarn.lockも)
COPY package*.json ./

# 開発依存関係を含めてnpm installを実行
RUN npm install --verbose

# アプリケーションのソースコードをコピー
COPY . .

# TypeScriptをJavaScriptにコンパイル
RUN npm run build

# 本番用に不要なパッケージを削除
RUN npm prune --production

# 本番ステージ
FROM node:14-alpine

WORKDIR /usr/src/app

# ビルダーステージからコンパイルされたコードと本番用のnode_modulesをコピー
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package.json .
COPY .env.example .

# 環境変数をロードするために .env ファイルを期待 (docker-compose.ymlでマウント)
# COPY .env .

# アプリケーションがリッスンするポート (もしあれば)
# EXPOSE 3000

# アプリケーションを実行
CMD [ "node", "dist/index.js" ]
