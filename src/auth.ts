// src/auth.ts
import 'isomorphic-fetch'; // Graphクライアントがfetch APIを必要とするため
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential, DeviceCodeCredential } from '@azure/identity';
import { setLogLevel } from '@azure/logger';

// Azure SDK のログレベルを設定 (環境に応じてログレベルを変更)
const defaultLogLevel = process.env.NODE_ENV === 'production' ? 'error' : 'info';
setLogLevel(defaultLogLevel);

/**
 * 認証中のログレベルを一時的に変更する関数
 */
function suppressLogsForAuth() {
  setLogLevel('error'); // 認証中はエラーログのみ表示
}

/**
 * 認証完了後にログレベルを復元する関数
 */
function restoreLogLevel() {
  setLogLevel(defaultLogLevel); // 元のログレベルに戻す
}

// 環境変数から認証情報を取得
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const tenantId = process.env.TENANT_ID;

/**
 * 認証タイプを定義
 */
export enum AuthType {
  Application = 'application',
  Delegated = 'delegated'
}

/**
 * 認証クライアント管理クラス
 * Application認証とDelegated認証を自動的に切り替えて管理します
 */
export class AuthManager {
  private applicationClient: Client | null = null;
  private delegatedClient: Client | null = null;

  /**
   * Application認証クライアントを取得（読み取り操作用）
   */
  async getApplicationClient(): Promise<Client> {
    if (!this.applicationClient) {
      console.log('🔧 Application認証クライアントを初期化しています...');
      this.applicationClient = await this.createApplicationClient();
    }
    return this.applicationClient;
  }

  /**
   * Delegated認証クライアントを取得（メッセージ送信用）
   */
  async getDelegatedClient(): Promise<Client> {
    if (!this.delegatedClient) {
      console.log('🔧 Delegated認証クライアントを初期化しています...');
      this.delegatedClient = await this.createDelegatedClient();
    }
    return this.delegatedClient;
  }

  /**
   * Application認証クライアントを作成
   * Client Credential Flowを使用
   */
  private async createApplicationClient(): Promise<Client> {
    if (!clientId || !clientSecret || !tenantId) {
      throw new Error(
        '環境変数 CLIENT_ID, CLIENT_SECRET, TENANT_ID が設定されていません。' +
        '.envファイルを確認してください。'
      );
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    const client = Client.initWithMiddleware({
      authProvider: authProvider,
    });

    console.log('✅ Application認証クライアントの初期化が完了しました。');
    return client;
  }

  /**
   * Delegated認証クライアントを作成
   * Device Code Flowを使用（Azure ADアプリでPublicクライアントフローが有効である必要があります）
   */
  private async createDelegatedClient(): Promise<Client> {
    if (!clientId || !tenantId) {
      throw new Error(
        '環境変数 CLIENT_ID, TENANT_ID が設定されていません。' +
        '.envファイルを確認してください。'
      );
    }

    console.log('🔧 Device Code Flow認証を設定中...');
    console.log('⚠️ Azure AD アプリケーションでPublicクライアントフローが有効になっている必要があります。');
    console.log('   Azure Portal > App registrations > 認証 > 詳細設定 > Publicクライアントフローを許可する = はい');

    // ログ出力を一時的に抑制するためのフラグ
    let authInProgress = false;

    const credential = new DeviceCodeCredential({
      tenantId: tenantId,
      clientId: clientId,
      userPromptCallback: (info) => {
        // 認証開始時にログ抑制フラグを設定
        authInProgress = true;
        suppressLogsForAuth(); // Azure SDKのログを抑制
        
        // クリアで見やすい認証指示を表示
        console.clear(); // 画面をクリアして見やすくする
        console.log('');
        console.log('🔐'.repeat(50));
        console.log('🔐           ユーザー認証が必要です               🔐');
        console.log('🔐'.repeat(50));
        console.log('');
        console.log('📋 認証手順:');
        console.log('   1. ブラウザで以下のURLにアクセスしてください:');
        console.log(`      📱 ${info.verificationUri}`);
        console.log('');
        console.log('   2. 表示される画面で以下のコードを入力してください:');
        console.log(`      🔑 ${info.userCode}`);
        console.log('');
        console.log('   3. 認証完了まで少々お待ちください...');
        console.log('');
        console.log('🔐'.repeat(50));
        console.log('');
        console.log('💡 認証に失敗する場合は、Azure ADアプリの設定を確認してください：');
        console.log('   • Azure Portal > Azure Active Directory > App registrations');
        console.log(`   • アプリ "${clientId}" を選択`);
        console.log('   • 認証 > 詳細設定 > "パブリック クライアント フローを許可する" を "はい" に設定');
        console.log('   • API のアクセス許可でDelegatedアクセス許可が正しく設定されていることを確認');
        console.log('');
        console.log('⏳ 認証完了をお待ちしています...');
        console.log('');
      },
    });

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: [
        'https://graph.microsoft.com/Team.ReadBasic.All',
        'https://graph.microsoft.com/Channel.ReadBasic.All',
        'https://graph.microsoft.com/ChannelMessage.Send',
        'https://graph.microsoft.com/ChannelMessage.Read.All',
        'https://graph.microsoft.com/User.Read'
      ],
    });

    const client = Client.initWithMiddleware({
      authProvider: authProvider,
    });

    // 認証完了後にログ抑制フラグを解除
    if (authInProgress) {
      restoreLogLevel(); // Azure SDKのログレベルを復元
      console.log('');
      console.log('✅'.repeat(50));
      console.log('✅           認証が完了しました！                   ✅');
      console.log('✅'.repeat(50));
      console.log('');
      authInProgress = false;
    }

    console.log('✅ Delegated認証クライアントの初期化が完了しました。');
    return client;
  }

  /**
   * 認証クライアントをリセット（テスト用など）
   */
  reset(): void {
    this.applicationClient = null;
    this.delegatedClient = null;
  }
}

// シングルトンインスタンス
const authManager = new AuthManager();

/**
 * Application認証クライアントを取得（読み取り操作用）
 * @returns {Promise<Client>} 認証済みのMicrosoft Graphクライアントインスタンス
 */
export async function getApplicationClient(): Promise<Client> {
  return authManager.getApplicationClient();
}

/**
 * Delegated認証クライアントを取得（メッセージ送信用）
 * @returns {Promise<Client>} 認証済みのMicrosoft Graphクライアントインスタンス
 */
export async function getDelegatedClient(): Promise<Client> {
  return authManager.getDelegatedClient();
}

/**
 * 後方互換性のためのレガシー関数
 * @deprecated getApplicationClient() を使用してください
 */
export async function getAuthenticatedClient(): Promise<Client> {
  console.warn('⚠️ getAuthenticatedClient() は非推奨です。getApplicationClient() を使用してください。');
  return getApplicationClient();
}
