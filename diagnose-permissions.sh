#!/bin/bash

# Azure AD API権限診断スクリプト
# このスクリプトは現在の設定をチェックし、修正が必要な項目を表示します

echo "🔍 Azure AD API権限診断スクリプト"
echo "=================================="
echo ""

# 環境変数チェック
echo "📋 環境変数確認:"
if [ -f ".env" ]; then
    echo "✅ .envファイルが存在します"
    
    if grep -q "CLIENT_ID=" .env; then
        CLIENT_ID=$(grep "CLIENT_ID=" .env | cut -d'"' -f2)
        echo "✅ CLIENT_ID: $CLIENT_ID"
    else
        echo "❌ CLIENT_IDが見つかりません"
    fi
    
    if grep -q "TENANT_ID=" .env; then
        TENANT_ID=$(grep "TENANT_ID=" .env | cut -d'"' -f2)
        echo "✅ TENANT_ID: $TENANT_ID"
    else
        echo "❌ TENANT_IDが見つかりません"
    fi
    
    if grep -q "CLIENT_SECRET=" .env; then
        echo "✅ CLIENT_SECRETが設定されています"
    else
        echo "❌ CLIENT_SECRETが見つかりません"
    fi
else
    echo "❌ .envファイルが見つかりません"
fi

echo ""
echo "🔧 必要なDelegated権限リスト:"
echo "----------------------------"
echo "以下の権限がDelegatedタイプで設定されている必要があります："
echo ""
echo "✅ User.Read (Delegated)"
echo "✅ Team.ReadBasic.All (Delegated)"  
echo "✅ Channel.ReadBasic.All (Delegated)"
echo "✅ ChannelMessage.Send (Delegated)"
echo "✅ ChannelMessage.Read.All (Delegated)"
echo ""

echo "❌ 削除が必要なApplication権限:"
echo "-------------------------------"
echo "以下のApplication権限は削除してください："
echo ""
echo "❌ ChannelMessage.Send (Application)"
echo "❌ ChannelMessage.Read.All (Application)"
echo "❌ その他のApplication権限"
echo ""

echo "🌐 Azure Portal設定確認URL:"
echo "----------------------------"
if [ ! -z "$CLIENT_ID" ]; then
    echo "Azure Portal URL:"
    echo "https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/$CLIENT_ID"
    echo ""
    echo "直接アクセスして以下を確認してください："
    echo "1. APIのアクセス許可 → Delegated権限のみ設定"
    echo "2. 認証 → パブリック クライアント フローを許可する = はい"
else
    echo "CLIENT_IDが設定されていないため、URLを生成できません"
fi

echo ""
echo "🔄 修正手順:"
echo "------------"
echo "1. 上記のAzure Portal URLにアクセス"
echo "2. AZURE_PERMISSION_FIX.mdの手順に従って権限を修正"
echo "3. 修正完了後、'npm run start'でテスト実行"
echo ""

echo "📚 詳細な修正手順:"
echo "AZURE_PERMISSION_FIX.mdファイルを確認してください"
