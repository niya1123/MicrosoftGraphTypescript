# Microsoft Graph TypeScript Teams アプリ

このプロジェクトは、TypeScript と Microsoft Graph SDK を使用して Microsoft Teams と対話する方法を示します。**自動認証切り替え機能**により、読み取り操作には Application 認証、メッセージ送信には Delegated 認証を自動的に選択します。

## 主な特徴

- **🔄 自動認証切り替え**: 操作に応じて Application 認証と Delegated 認証を自動選択
- **📖 読み取り操作**: チーム一覧、チャネル一覧、メッセージ一覧 (Application 認証)
- **📝 メッセージ送信**: インタラクティブなメッセージ送信機能 (Delegated 認証)
- **🔧 設定不要**: 一度の設定で両方の認証モードが利用可能
- **✅ 完全テスト**: 全機能のユニットテスト実装済み

## 認証アーキテクチャ

このアプリケーションは、Microsoft Graph API の制約に対応するため、2つの認証方式を自動的に切り替えます：

### Application 認証 (Client Credential Flow)
- **用途**: 読み取り操作 (チーム、チャネル、メッセージ一覧の取得)
- **特徴**: ユーザー操作不要、自動実行可能
- **アクセス許可**: アプリケーション権限

### Delegated 認証 (Device Code Flow)
- **用途**: メッセージ送信操作
- **特徴**: ユーザー認証が必要、ブラウザでの認証フロー
- **アクセス許可**: 委任されたアクセス許可

## 前提条件

*   Node.js (TypeScript 3.7 と互換性のある LTS バージョンを推奨)
*   npm または yarn
*   Docker (Docker ベースの実行用)
*   Microsoft Graph の必要なアクセス許可を持つ Azure AD アプリケーション登録 (詳細は [Microsoft ID プラットフォームにアプリケーションを登録する](https://learn.microsoft.com/ja-jp/graph/auth-register-app-v2) を参照)。

### 必要なアクセス許可

Azure AD アプリケーション登録で以下のアクセス許可を設定してください：

#### アプリケーション権限 (Application 認証用)
- `Team.ReadBasic.All` - チーム情報の読み取り
- `Channel.ReadBasic.All` - チャネル情報の読み取り
- `ChannelMessage.Read.All` - チャネルメッセージの読み取り

#### 委任されたアクセス許可 (Delegated 認証用)
- `Team.ReadBasic.All` - チーム情報の読み取り
- `Channel.ReadBasic.All` - チャネル情報の読み取り
- `ChannelMessage.Send` - チャネルメッセージの送信
- `ChannelMessage.Read.All` - チャネルメッセージの読み取り

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

### 追加ドキュメントと診断ツール

Azure AD 設定や権限の確認には、以下のドキュメントとスクリプトが役立ちます。

- **[AZURE_SETUP_GUIDE.md](AZURE_SETUP_GUIDE.md)** – メッセージ送信を有効にするための詳細な Azure AD 設定手順。
- **[QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md)** – `AADSTS7000218` などの一般的な認証エラーを素早く解決するためのガイド。
- **[AZURE_PERMISSION_FIX.md](AZURE_PERMISSION_FIX.md)** – API アクセス許可設定を修正するための手順。
- `./azure-setup-check.sh` – 環境変数や Azure AD 設定をチェックする診断スクリプト。
- `./diagnose-permissions.sh` – API 権限の状態を確認するスクリプト。

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

## 🚀 自動認証切り替え機能

このアプリケーションの最大の特徴は、操作に応じて最適な認証方式を自動選択することです：

### 読み取り操作 (Application 認証)
- `listMyTeams()` - チーム一覧取得
- `listChannels(teamId)` - チャネル一覧取得
- `listChannelMessages(teamId, channelId)` - メッセージ一覧取得

これらの操作は **ユーザー操作なし** で実行されます。

### メッセージ送信 (Delegated 認証)
- `sendMessageToChannel(teamId, channelId, message)` - メッセージ送信

この操作時には自動的に **Device Code Flow** が起動し、ユーザー認証を求められます：

```
🔐 ユーザー認証が必要です:
   ブラウザで以下のURLにアクセスしてください: https://microsoft.com/devicelogin
   表示される画面で以下のコードを入力してください: ABC123456
   認証完了まで少々お待ちください...
```

## メッセージ送信機能

### インタラクティブメッセージ送信

アプリケーション実行時に、対話型のメッセージ送信機能が利用できます：

- **コンソール入力**: ユーザーがコンソールからメッセージを入力
- **自動認証**: メッセージ送信時に Delegated 認証を自動起動
- **リアルタイム送信**: 入力されたメッセージを即座にTeamsチャネルに送信
- **終了コマンド**: `exit`または`quit`で機能を終了
- **エラーハンドリング**: 送信失敗時の適切なエラー処理

### 実装内容

```typescript
// メッセージ送信 (認証は自動選択)
await sendMessageToChannel(teamId, channelId, message);
```

主な機能：
1. 自動 Delegated 認証クライアント取得
2. 空のメッセージコンテンツの検証
3. プレーンテキスト形式でのメッセージ送信
4. 送信成功・失敗の視覚的フィードバック（絵文字付き）

### 使用方法

1. アプリケーションを実行すると、まず Application 認証で読み取り操作が実行されます
2. インタラクティブモードで "メッセージを入力してください (exit/quitで終了): " プロンプトが表示されます
3. 初回メッセージ送信時に Device Code Flow による認証が自動で開始されます
4. ブラウザで認証を完了すると、メッセージがTeamsチャネルに送信されます
5. 2回目以降の送信では認証は不要です（トークンキャッシュ済み）
6. `exit`または`quit`を入力すると機能が終了します
- 適切なAPI呼び出しパラメータの確認
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
    このスクリプトは、以下の処理を実行します (環境変数 `TARGET_TEAM_ID` および `TARGET_CHANNEL_ID` の設定に依存します):
    *   参加しているチームの一覧を表示します。
    *   `TARGET_TEAM_ID` が設定されていれば、そのチームのチャネル一覧を表示します。
    *   `TARGET_TEAM_ID` と `TARGET_CHANNEL_ID` が設定されていれば、そのチャネルの最新メッセージ数件を表示し、インタラクティブメッセージ送信機能を開始します。

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
*   `./azure-setup-check.sh`: Azure AD 設定を確認する診断ツール。
*   `./diagnose-permissions.sh`: API 権限の設定をチェックするツール。

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
    └── graphService.spec.ts  # Graph API を使った Teams 操作機能のテスト
```
