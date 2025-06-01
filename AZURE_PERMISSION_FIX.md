# Azure AD APIアクセス許可修正ガイド

## 🚨 現在の問題
現在のAzure ADアプリケーションのAPIアクセス許可設定に問題があります。
`ChannelMessage.Send`などの権限が**Application**タイプで設定されていますが、Device Code Flow（Delegated認証）では**Delegated**タイプが必要です。

## 🔧 修正手順

### 1. Azure Portalにアクセス
1. [Azure Portal](https://portal.azure.com) にアクセス
2. **Azure Active Directory** を選択
3. **アプリの登録** を選択
4. アプリケーション ID `bb445ce0-e1cb-45c4-aa52-38080d78df13` を検索

### 2. 現在の権限を削除
1. **APIのアクセス許可** を選択
2. 以下の権限を**すべて削除**してください：
   - `ChannelMessage.Send` (Application)
   - `ChannelMessage.Read.All` (Application)
   - その他のApplication権限

### 3. 正しいDelegated権限を追加
1. **+ アクセス許可の追加** をクリック
2. **Microsoft Graph** を選択
3. **委任されたアクセス許可** を選択
4. 以下の権限を**一つずつ**追加してください：

   **必須権限:**
   - `User.Read` (通常は自動で追加済み)
   - `Team.ReadBasic.All`
   - `Channel.ReadBasic.All`  
   - `ChannelMessage.Send`
   - `ChannelMessage.Read.All`

### 4. 管理者の同意を付与
1. すべての権限を追加後、**管理者の同意を付与** ボタンをクリック
2. 確認ダイアログで **はい** を選択

### 5. 最終確認
権限リストが以下のようになっていることを確認：

```
✅ User.Read (Delegated) - 同意済み
✅ Team.ReadBasic.All (Delegated) - 同意済み  
✅ Channel.ReadBasic.All (Delegated) - 同意済み
✅ ChannelMessage.Send (Delegated) - 同意済み
✅ ChannelMessage.Read.All (Delegated) - 同意済み
```

## 🔑 Publicクライアントフロー設定確認

1. **認証** メニューを選択
2. **詳細設定** セクションを展開
3. **パブリック クライアント フローを許可する** が **はい** になっていることを確認

## ⚠️ 重要な注意点

- **Application権限は削除**してください（Device Code Flowでは使用できません）
- **Delegated権限のみ**を使用します
- すべての権限に**管理者の同意**が必要です
- 権限変更後は、既存の認証トークンが無効になる場合があります

## 🧪 設定完了後のテスト

設定変更後、以下のコマンドでテストしてください：

```bash
npm run start
```

認証フローが正常に動作し、メッセージ送信が成功することを確認してください。
