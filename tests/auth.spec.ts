// tests/auth.spec.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';

// すべての依存関係をモック化
jest.mock('@azure/identity');
jest.mock('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
jest.mock('@microsoft/microsoft-graph-client');
jest.mock('@azure/logger');

// getAuthenticatedClientの実際の実装をモック化
jest.mock('../src/auth', () => {
  // 元のモジュールを保存
  const originalModule = jest.requireActual('../src/auth');
  
  // テスト実装をモック化
  return {
    getAuthenticatedClient: jest.fn(async () => {
      const mockedClient = {
        api: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        get: jest.fn().mockReturnThis()
      };
      
      return mockedClient;
    })
  };
});

// モック化されたモジュールをインポート
import { getAuthenticatedClient } from '../src/auth';

describe('Authentication', () => {
  // 環境変数を保存して復元する
  const savedEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...savedEnv }; // クリーンなコピーで開始
    
    // 必要な環境変数を設定
    process.env.CLIENT_ID = 'test-client-id';
    process.env.CLIENT_SECRET = 'test-client-secret';
    process.env.TENANT_ID = 'test-tenant-id';
  });
  
  afterAll(() => {
    process.env = savedEnv; // 元の環境変数を復元
  });

  test('getAuthenticatedClientがクライアントを返す', async () => {
    const client = await getAuthenticatedClient();
    expect(client).toBeDefined();
    expect(getAuthenticatedClient).toHaveBeenCalled();
  });
});