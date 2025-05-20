// tests/mocks/mockAuth.ts
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';

export class MockAuth {
  static mockClientSecretCredential() {
    return {
      getToken: jest.fn().mockResolvedValue({ token: 'mock-token', expiresOnTimestamp: Date.now() + 3600000 })
    } as unknown as ClientSecretCredential;
  }

  static mockTokenCredentialAuthenticationProvider() {
    return {
      getAccessToken: jest.fn().mockResolvedValue('mock-access-token')
    } as unknown as TokenCredentialAuthenticationProvider;
  }
}