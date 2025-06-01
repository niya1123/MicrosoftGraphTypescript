// src/auth.ts
import 'isomorphic-fetch'; // Graphクライアントがfetch APIを必要とするため
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential, DeviceCodeCredential } from '@azure/identity';
import { setLogLevel } from '@azure/logger';

// Azure SDK のログレベルを設定 (環境に応じてログレベルを変更)
const logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'info';
setLogLevel(logLevel);

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
   * Device Code Flowを使用
   */
  private async createDelegatedClient(): Promise<Client> {
    if (!clientId || !tenantId) {
      throw new Error(
        '環境変数 CLIENT_ID, TENANT_ID が設定されていません。' +
        '.envファイルを確認してください。'
      );
    }

    const credential = new DeviceCodeCredential({
      tenantId: tenantId,
      clientId: clientId,
      userPromptCallback: (info) => {
        console.log('\n🔐 ユーザー認証が必要です:');
        console.log(`   ブラウザで以下のURLにアクセスしてください: ${info.verificationUri}`);
        console.log(`   表示される画面で以下のコードを入力してください: ${info.userCode}`);
        console.log('   認証完了まで少々お待ちください...\n');
      },
    });

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: [
        'https://graph.microsoft.com/Team.ReadBasic.All',
        'https://graph.microsoft.com/Channel.ReadBasic.All',
        'https://graph.microsoft.com/ChannelMessage.Send',
        'https://graph.microsoft.com/ChannelMessage.Read.All'
      ],
    });

    const client = Client.initWithMiddleware({
      authProvider: authProvider,
    });

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
