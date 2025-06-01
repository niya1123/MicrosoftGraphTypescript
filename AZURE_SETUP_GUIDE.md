# Azure AD設定ガイド

このドキュメントでは、Microsoft Graph Teams アプリケーションのメッセージ送信機能を有効にするために必要なAzure AD設定について説明します。

## 🔧 Azure AD アプリ登録の設定

### 1. 認証設定

1. [Azure Portal](https://portal.azure.com) にサインインします
2. **Azure Active Directory** > **アプリの登録** に移動
3. アプリケーション `bb445ce0-e1cb-45c4-aa52-38080d78df13` を選択
4. 左メニューから **認証** を選択

#### 必要な設定:

**プラットフォーム構成:**
- **シングルページアプリケーション (SPA)** を追加
  - リダイレクト URI: `http://localhost:3000/auth/callback`
  - Implicitフローとハイブリッドフロー: **無効のまま**

**詳細設定:**
- ✅ **パブリック クライアント フローを許可する** = **はい**
- ✅ **ライブ SDK サポートを有効にする** = **はい** (オプション)

### 2. API のアクセス許可

1. 左メニューから **API のアクセス許可** を選択
2. **アクセス許可の追加** をクリック

#### 必要なDelegated権限:
- `Team.ReadBasic.All` ✅ (既存)
- `Channel.ReadBasic.All` ✅ (既存)
- `ChannelMessage.Read.All` ✅ (既存)
- `ChannelMessage.Send` ⚠️ **追加が必要**
- `User.Read` ⚠️ **追加が必要**

#### 必要なApplication権限 (オプション):
- `Team.ReadBasic.All` ✅ (既存)
- `Channel.ReadBasic.All` ✅ (既存)
- `ChannelMessage.Read.All` ✅ (既存)
- `ChannelMessage.Send` ⚠️ **追加が必要** (管理者の同意必須)

### 3. 管理者の同意

1. **API のアクセス許可** ページで
2. **[テナント名] に管理者の同意を与えます** をクリック
3. 確認ダイアログで **はい** をクリック

## 🔍 現在の問題と解決策

### 問題1: AADSTS7000218エラー
**エラー**: "The request body must contain the following parameter: 'client_assertion' or 'client_secret'"

**原因**: Interactive Browser認証でclient_secretが要求されている
**解決策**: 
1. Azure Portal > 認証 > パブリッククライアントフローを許可 = **はい**
2. リダイレクトURI `http://localhost:3000/auth/callback` を**SPA**プラットフォームに追加

### 問題2: "Invalid request - User is missing"
**エラー**: Application権限でのメッセージ送信時にユーザーコンテキストが不足

**原因**: Application認証では通常のメッセージ送信ができない
**解決策**:
1. Delegated認証を修正して使用する
2. または、Bot Framework/Teams Appとして実装する

## 📋 設定チェックリスト

### Azure Portal での設定確認:
- [ ] リダイレクトURI: `http://localhost:3000/auth/callback` (SPA)
- [ ] パブリッククライアントフロー: **有効**
- [ ] Delegated権限: `ChannelMessage.Send`
- [ ] Delegated権限: `User.Read`
- [ ] 管理者の同意: **付与済み**

### アプリケーションでの確認:
- [ ] Interactive Browser認証が成功する
- [ ] ユーザートークンが取得できる
- [ ] メッセージ送信APIが成功する

## 🔧 トラブルシューティング

### エラーコード別対処法:

**AADSTS7000218**:
```
解決策: パブリッククライアントフローを有効にする
Azure Portal > アプリ登録 > 認証 > パブリッククライアントフローを許可 = はい
```

**AADSTS50194**:
```
解決策: 正しいリダイレクトURIを設定する
Azure Portal > アプリ登録 > 認証 > プラットフォーム構成 > SPA > http://localhost:3000/auth/callback
```

**BadRequest - User is missing**:
```
解決策: Delegated認証を使用してユーザーコンテキストを提供する
Application認証ではなくDelegated認証でメッセージを送信する
```

## 📞 サポート

設定に問題がある場合は、以下を確認してください：
1. Azure AD管理者権限を持っているか
2. 正しいテナントIDを使用しているか
3. アプリケーション設定が保存されているか
4. ブラウザのキャッシュをクリアしているか
