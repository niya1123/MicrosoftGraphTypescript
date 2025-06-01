#!/bin/bash

# Azure AD アプリ設定診断・修正スクリプト
# このスクリプトはMicrosoft Graph Teams アプリのメッセージ送信機能を有効にするために
# 必要なAzure AD設定を確認し、設定手順を提供します。

echo "🔧 Microsoft Graph Teams アプリ - 設定診断ツール"
echo "=================================================="
echo ""

# 環境変数の確認
echo "📋 ステップ 1: 環境変数の確認"
echo "--------------------------------"

if [ -f ".env" ]; then
    source .env
    echo "✅ .envファイルが見つかりました"
    
    if [ -n "$CLIENT_ID" ]; then
        echo "✅ CLIENT_ID: $CLIENT_ID"
    else
        echo "❌ CLIENT_IDが設定されていません"
        exit 1
    fi
    
    if [ -n "$TENANT_ID" ]; then
        echo "✅ TENANT_ID: $TENANT_ID"
    else
        echo "❌ TENANT_IDが設定されていません"
        exit 1
    fi
    
    if [ -n "$CLIENT_SECRET" ]; then
        echo "✅ CLIENT_SECRET: [設定済み]"
    else
        echo "❌ CLIENT_SECRETが設定されていません"
        exit 1
    fi
else
    echo "❌ .envファイルが見つかりません"
    exit 1
fi

echo ""
echo "🌐 ステップ 2: Azure Portal設定手順"
echo "===================================="
echo ""
echo "以下の手順でAzure ADアプリを設定してください："
echo ""
echo "1. Azure Portal (https://portal.azure.com) にサインイン"
echo "2. Azure Active Directory > アプリの登録 に移動"
echo "3. アプリ '$CLIENT_ID' を検索・選択"
echo ""
echo "📝 認証設定:"
echo "------------"
echo "4. 左メニューから [認証] をクリック"
echo "5. [プラットフォームを追加] > [シングルページアプリケーション] を選択"
echo "6. リダイレクトURIに追加: http://localhost:3000/auth/callback"
echo "7. [詳細設定] セクションで："
echo "   ✅ 'パブリック クライアント フローを許可する' = はい"
echo "   ✅ 'ライブ SDK サポートを有効にする' = はい（オプション）"
echo "8. [保存] をクリック"
echo ""
echo "🔑 API アクセス許可設定:"
echo "----------------------"
echo "9. 左メニューから [API のアクセス許可] をクリック"
echo "10. 現在の権限を確認し、以下が含まれていることを確認："
echo ""
echo "   📋 Delegated権限 (Microsoft Graph):"
echo "   ✅ Team.ReadBasic.All"
echo "   ✅ Channel.ReadBasic.All" 
echo "   ✅ ChannelMessage.Read.All"
echo "   ⚠️  ChannelMessage.Send (要追加)"
echo "   ⚠️  User.Read (要追加)"
echo ""
echo "   📋 Application権限 (Microsoft Graph):"
echo "   ✅ Team.ReadBasic.All"
echo "   ✅ Channel.ReadBasic.All"
echo "   ✅ ChannelMessage.Read.All"
echo "   💡 ChannelMessage.Send (オプション - 管理者同意必要)"
echo ""
echo "11. 不足している権限を追加："
echo "    [アクセス許可の追加] > [Microsoft Graph] > [委任されたアクセス許可]"
echo "    - ChannelMessage.Send を検索・追加"
echo "    - User.Read を検索・追加"
echo ""
echo "12. [<テナント名>に管理者の同意を与えます] をクリック"
echo "13. 確認ダイアログで [はい] をクリック"
echo "14. すべての権限に緑のチェックマークが表示されることを確認"
echo ""
echo "🚀 ステップ 3: 設定完了後のテスト"
echo "================================"
echo ""
echo "設定完了後、以下のコマンドでアプリケーションをテストしてください："
echo ""
echo "  npm run build && npm start"
echo ""
echo "📞 トラブルシューティング"
echo "======================="
echo ""
echo "❌ エラー: AADSTS7000218"
echo "   解決策: 手順7の 'パブリック クライアント フローを許可する' が 'はい' に設定されていることを確認"
echo ""
echo "❌ エラー: 'Invalid request - User is missing'"
echo "   解決策: ChannelMessage.Send のDelegated権限が追加され、管理者の同意が与えられていることを確認"
echo ""
echo "❌ エラー: 'Authorization pending'"
echo "   解決策: Device Code認証で表示されるURLにアクセスし、コードを正しく入力してください"
echo ""
echo "💡 追加情報"
echo "==========="
echo ""
echo "詳細な設定手順は AZURE_SETUP_GUIDE.md を参照してください"
echo "Azure Portal URL: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/$CLIENT_ID"
echo ""
echo "🔧 診断完了"
echo ""
