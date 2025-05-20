# MicrosoftGraphを用いてTypescriptでTeamsを動かすサンプル

## 概要

このリポジトリは、Microsoft Graph API を使用して Microsoft Teams を操作するための TypeScript サンプルプロジェクトです。
アプリケーション認証（クライアントID・シークレット）を使用してTeamsの情報取得や操作を行います。

## セットアップ

1. `.env.example` ファイルを `.env` にコピーして必要な情報を設定します
2. `npm install` で依存パッケージをインストールします
3. `npm run build` でTypeScriptコードをコンパイルします
4. `npm start` でアプリケーションを実行します

## 開発

- `npm run dev` で開発モードを実行します（ファイル変更時に自動再コンパイル・再起動）
- `npm run lint` でコードの静的解析を行います
- `npm run format` でコードの自動整形を行います

## テスト

テストは Jest を使用して実装されています。実際の認証情報を使わずにテストを実行できるようモックを使用しています。

- `npm test` でテストを実行します
- `npm run test:watch` で監視モードでテストを実行します（ファイル変更時に自動再実行）

テストファイルは `tests` ディレクトリにあります：
- `auth.spec.ts` - 認証機能のテスト
- `graphService.spec.ts` - Graph APIを使ったTeams操作機能のテスト
