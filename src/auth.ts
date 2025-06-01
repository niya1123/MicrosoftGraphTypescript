// src/auth.ts
import 'isomorphic-fetch'; // Graphクライアントがfetch APIを必要とするため
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import { setLogLevel } from '@azure/logger'; // Import setLogLevel

// Azure SDK のログレベルを設定 (環境に応じてログレベルを変更)
const logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'info'; // 'verbose' や 'error' も指定可能
setLogLevel(logLevel);

// 環境変数から認証情報を取得
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const tenantId = process.env.TENANT_ID;

/**
 * Microsoft Graph API の認証済みクライアントを取得します。
 * アプリケーションの資格情報 (クライアントID、クライアントシークレット、テナントID) を使用して認証します。
 * @returns {Promise<Client>} 認証済みのMicrosoft Graphクライアントインスタンス
 * @throws {Error} 認証情報が設定されていない場合、または認証に失敗した場合
 */
export async function getAuthenticatedClient(): Promise<Client> {
  if (!clientId || !clientSecret || !tenantId) {
    throw new Error(
      '環境変数 CLIENT_ID, CLIENT_SECRET, TENANT_ID が設定されていません。' +
      '.envファイルを確認してください。'
    );
  }

  // クライアント資格情報フローのための認証情報オブジェクトを作成
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  // 認証プロバイダーを作成
  // スコープはアプリケーションのアクセス許可に基づいてGraph API側で設定されるため、ここでは明示的に指定しないことが多い
  // 必要であれば、['https://graph.microsoft.com/.default'] のようなスコープを指定
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  });

  // 認証プロバイダーを使用してGraphクライアントを初期化
  const client = Client.initWithMiddleware({
    authProvider: authProvider,
  });

  return client;
}

/**
 * Application権限でMicrosoft Graph APIクライアントを取得します。
 * @returns {Promise<Client>} 認証済みのMicrosoft Graphクライアントインスタンス
 */
export async function getApplicationClient(): Promise<Client> {
  return getAuthenticatedClient();
}

/**
 * Delegated権限でMicrosoft Graph APIクライアントを取得します。
 * 現在は未実装で、Application権限のクライアントを返します。
 * @returns {Promise<Client>} 認証済みのMicrosoft Graphクライアントインスタンス
 */
export async function getDelegatedClient(): Promise<Client> {
  // TODO: Delegated認証の実装が必要
  // 現在はApplication認証のクライアントを返す
  return getAuthenticatedClient();
}
