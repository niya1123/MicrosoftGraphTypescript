# Microsoft Graph TypeScript Teams アプリ

このプロジェクトは、TypeScript と Microsoft Graph SDK を使用して Microsoft Teams と対話する方法を示します。

## 前提条件

*   Node.js (TypeScript 3.7 と互換性のある LTS バージョンを推奨)
*   npm または yarn
*   Docker (Docker ベースの実行用)
*   Microsoft Graph の必要なアクセス許可を持つ Azure AD アプリケーション登録 (詳細は [Microsoft ID プラットフォームにアプリケーションを登録する](https://learn.microsoft.com/ja-jp/graph/auth-register-app-v2) を参照)。
    *   必要なアクセス許可 (委任されたアクセス許可またはアプリケーションのアクセス許可、認証フローによる):
        *   `Team.ReadBasic.All`
        *   `Channel.ReadBasic.All`
        *   `ChannelMessage.Send`
        *   `ChannelMessage.Read.All`
        *   (および、特定の操作に必要なその他のアクセス許可)

## セットアップ

1.  **リポジトリをクローンする (該当する場合) か、プロジェクトファイルを作成します。**
2.  **依存関係をインストールします:**
    ```bash
    npm install
    # または
    yarn install
    ```
3.  プロジェクトのルートに `.env.example` をコピーして `.env` **ファイルを作成します**:
    ```bash
    cp .env.example .env
    ```
4.  `.env` **ファイルに Azure AD アプリケーションの詳細を記入します**:
    *   `CLIENT_ID`: Azure AD アプリケーション (クライアント) ID。
    *   `CLIENT_SECRET`: Azure AD アプリケーションのクライアントシークレット。
    *   `TENANT_ID`: Azure AD ディレクトリ (テナント) ID。
    *   `TARGET_TEAM_ID` (任意): 操作に使用するデフォルトのチーム ID。
    *   `TARGET_CHANNEL_ID` (任意): 操作に使用するデフォルトのチャネル ID。

### Team ID と Channel ID の取得方法

Microsoft Teams UIからTeam IDとChannel IDを取得する方法：

1. **Team ID の取得:**
   - Microsoft Teams でチームを開く
   - ブラウザのアドレスバーのURLを確認
   - URLに含まれる `groupId=` パラメータの値がTeam ID
   - 例: `https://teams.microsoft.com/_#/teamDashboard/General?groupId=a536b7f7-b65b-431a-b71e-cd386882d3e6`
   - この場合のTeam ID: `a536b7f7-b65b-431a-b71e-cd386882d3e6`

2. **Channel ID の取得:**
   - Microsoft Teams でチャネルを開く
   - ブラウザのアドレスバーのURLを確認
   - URLに含まれる `threadId=` パラメータの値がChannel ID（URL エンコードされている）
   - 例: `https://teams.microsoft.com/_#/channel/19%3Ab4cff4a9964b42dca8f2de52042dd340%40thread.tacv2/General?groupId=...&threadId=19%3Ab4cff4a9964b42dca8f2de52042dd340%40thread.tacv2`
   - **重要:** URLデコードが必要
     - エンコード済み: `19%3Ab4cff4a9964b42dca8f2de52042dd340%40thread.tacv2`
     - デコード後: `19:b4cff4a9964b42dca8f2de52042dd340@thread.tacv2`
   - `.env` ファイルにはデコード後の値を使用

**注意事項:**
- Application認証（Client Credential Flow）を使用している場合、メッセージ送信は制限されています
- 読み取り機能（チーム一覧、チャネル一覧、メッセージ一覧）は正常に動作します

## メッセージ送信機能（Import Mode）

このアプリケーションは、Application認証でのメッセージ送信にImport Modeを実装しています。

### Import Modeの特徴

Import Modeは、Microsoft Teams Importation API を使用してメッセージを送信する機能です：

- **目的**: 外部システムから過去のメッセージデータをTeamsにインポートする
- **認証**: Application認証（Client Credential Flow）が必要
- **制限**: 通常のユーザーメッセージ送信とは異なり、特別なヘッダーと形式が必要

### 実装内容

`sendMessageToChannel` 関数では、5番目のパラメータとして `importMode` (boolean) を指定できます：

```typescript
// 通常モード（現在は制限のためエラーになる）
await sendMessageToChannel(client, teamId, channelId, message, false);

// Import Mode（推奨）
await sendMessageToChannel(client, teamId, channelId, message, true);
```

Import Modeを有効にすると：
1. `MS-TEAMS-MESSAGE-TYPE: import` ヘッダーが追加されます
2. メッセージに `createdDateTime` フィールドが設定されます
3. `from.application` フィールドでアプリケーション情報が設定されます

### 技術的な制限

Application認証では以下の制限があります：
- 通常のユーザーメッセージ送信はサポートされていません
- Import APIを使用した特殊な形式でのメッセージ送信のみ可能です
- ただし、現在のMicrosoft Graph APIの制限により「User is missing」エラーが発生する場合があります

### テスト内容

- Import Mode機能のユニットテスト実装済み
- 適切なヘッダーとメッセージフィールドの設定確認
- エラーハンドリングのテスト

## ローカル開発

1.  **TypeScript コードをビルドします:**
    ```bash
    npm run build
    ```
2.  **アプリケーションを実行します:**
    ```bash
    npm start
    ```
    これにより、通常はメインスクリプト (例: `dist/index.js`) が実行されます。
    このスクリプトは、以下の処理を試みます (環境変数 `TARGET_TEAM_ID` および `TARGET_CHANNEL_ID` の設定に依存します):
    *   参加しているチームの一覧を表示します。
    *   `TARGET_TEAM_ID` が設定されていれば、そのチームのチャネル一覧を表示します。
    *   `TARGET_TEAM_ID` と `TARGET_CHANNEL_ID` が設定されていれば、そのチャネルの最新メッセージ数件を表示し、新しいテストメッセージを送信します。

3.  **開発モード (自動リビルドと再起動あり):**
    ```bash
    npm run dev
    ```

## Docker 実行

Docker を使用してアプリケーションを実行するには、`docker-compose` を利用するのが最も簡単です。

1.  **`.env` ファイルの準備**:
    ローカル開発と同様に、プロジェクトのルートに `.env` ファイルを作成し、必要な環境変数（`CLIENT_ID`, `CLIENT_SECRET`, `TENANT_ID` など）を設定してください。`docker-compose.yml` はこの `.env` ファイルを自動的に読み込みます。

2.  **Docker イメージのビルド (初回または変更時):**
    ```bash
    docker-compose build
    ```
    または、`up` コマンドに `--build` オプションを付けることでもビルドできます。

3.  **Docker Compose でコンテナを起動:**
    ```bash
    docker-compose up
    ```
    これにより、イメージがビルドされ（まだビルドされていない場合）、コンテナが起動します。アプリケーションのログがコンソールに出力されます。

    デタッチモード（バックグラウンド実行）で起動する場合:
    ```bash
    docker-compose up -d
    ```

4.  **コンテナの停止と削除:**
    ```bash
    docker-compose down
    ```

**(補足) Docker コマンドで直接実行する場合:**

`docker-compose` を使用せずに `docker run` で直接コンテナを実行したい場合は、まずイメージをビルドする必要があります。

1.  **Docker イメージのビルド:**
    ```bash
    docker build -t ms-graph-teams-app .
    ```

2.  **Docker コンテナの実行:**
    `.env` ファイルの内容をコンテナに環境変数として渡す必要があります。例えば、`.env` ファイルを `--env-file` オプションで指定します。
    ```bash
    docker run --rm --env-file .env ms-graph-teams-app
    ```
    または、個々の環境変数を `-e` オプションで指定することも可能です。

## スクリプト

*   `npm run build`: TypeScript を JavaScript にコンパイルします。
*   `npm start`: コンパイルされた JavaScript アプリケーションを実行します。
*   `npm run dev`: `nodemon` と `tsc -w` を使用して開発モードでアプリケーションを実行します。
*   `npm run lint`: ESLint を使用して TypeScript コードをリントします。
*   `npm run format`: ESLint (`--fix` 付き) を使用して TypeScript コードをフォーマットします。
*   `npm test`: Jest を使用してテストを実行します。
*   `npm run test:watch`: 監視モードでテストを実行します（ファイル変更時に自動再実行）。

## テスト

テストは Jest を使用して実装されています。実際の認証情報を使わずにテストを実行できるようモックを使用しています。

テストファイルは `tests` ディレクトリにあります：
- `auth.spec.ts` - 認証機能のテスト
- `graphService.spec.ts` - Graph APIを使ったTeams操作機能のテスト

### テスト実行方法

1. **全テスト実行:**
   ```bash
   npm test
   ```

2. **監視モードでテスト実行（ファイル変更時に自動再実行）:**
   ```bash
   npm run test:watch
   ```

3. **カバレッジレポート付きテスト実行:**
   ```bash
   npm test -- --coverage
   ```

4. **特定のテストファイルのみ実行:**
   ```bash
   npm test -- auth.spec.ts
   # または
   npm test -- graphService.spec.ts
   ```

### 継続的インテグレーション

このプロジェクトはGitHub Actionsを使用して、ブランチへの変更やプルリクエストごとに自動テストを実行します：

1. **ローカル環境テスト**: Node.jsの標準環境でテストを実行
2. **Docker環境テスト**: Dockerコンテナ内でテストを実行

これにより、異なる環境でのアプリケーションの動作を検証できます。

## プロジェクト構成

```
.
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .eslintrc.js
├── .gitignore
├── jest.config.js
├── package.json
├── README.md
├── tsconfig.json
├── src
│   ├── auth.ts         # Microsoft Graph の認証ロジック
│   ├── graphService.ts # Teams 操作のために Microsoft Graph API と対話するサービス
│   ├── index.ts        # メインアプリケーションのエントリポイント 
│   └── types           # カスタム型定義
│       └── graph.d.ts
└── tests
    ├── auth.spec.ts          # 認証機能のテスト
    ├── graphService.spec.ts  # Graph APIを使ったTeams操作機能のテスト
    └── mocks                 # モックオブジェクト
        ├── auth.mock.ts
        ├── mockAuth.ts
        └── mockGraphClient.ts
```
