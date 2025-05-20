// tests/auth.spec.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import { getAuthenticatedClient } from '../src/auth';

// Mock the dependencies
jest.mock('@azure/identity', () => ({
  ClientSecretCredential: jest.fn().mockImplementation(() => ({
    getToken: jest.fn().mockResolvedValue({ token: 'mock-token', expiresOnTimestamp: Date.now() + 3600000 })
  }))
}));

jest.mock('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials', () => ({
  TokenCredentialAuthenticationProvider: jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue('mock-access-token')
  }))
}));

jest.mock('@microsoft/microsoft-graph-client', () => ({
  Client: {
    initWithMiddleware: jest.fn().mockImplementation(({ authProvider }) => ({
      _authProvider: authProvider,
      api: jest.fn()
    }))
  }
}));

describe('Authentication', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Set up test environment variables
    process.env = {
      ...originalEnv,
      CLIENT_ID: 'test-client-id',
      CLIENT_SECRET: 'test-client-secret',
      TENANT_ID: 'test-tenant-id'
    };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  test('getAuthenticatedClient returns a valid client when credentials are provided', async () => {
    const client = await getAuthenticatedClient();
    
    expect(ClientSecretCredential).toHaveBeenCalledWith(
      'test-tenant-id',
      'test-client-id',
      'test-client-secret'
    );
    
    expect(TokenCredentialAuthenticationProvider).toHaveBeenCalledWith(
      expect.anything(),
      { scopes: ['https://graph.microsoft.com/.default'] }
    );
    
    expect(Client.initWithMiddleware).toHaveBeenCalledWith({
      authProvider: expect.anything()
    });
    
    expect(client).toBeDefined();
  });

  test('getAuthenticatedClient throws error when CLIENT_ID is missing', async () => {
    delete process.env.CLIENT_ID;
    
    await expect(getAuthenticatedClient()).rejects.toThrow(
      '環境変数 CLIENT_ID, CLIENT_SECRET, TENANT_ID が設定されていません。'
    );
  });

  test('getAuthenticatedClient throws error when CLIENT_SECRET is missing', async () => {
    delete process.env.CLIENT_SECRET;
    
    await expect(getAuthenticatedClient()).rejects.toThrow(
      '環境変数 CLIENT_ID, CLIENT_SECRET, TENANT_ID が設定されていません。'
    );
  });

  test('getAuthenticatedClient throws error when TENANT_ID is missing', async () => {
    delete process.env.TENANT_ID;
    
    await expect(getAuthenticatedClient()).rejects.toThrow(
      '環境変数 CLIENT_ID, CLIENT_SECRET, TENANT_ID が設定されていません。'
    );
  });
});