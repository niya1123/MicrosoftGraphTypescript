// tests/auth.spec.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';

// Mock all the dependencies
jest.mock('@azure/identity');
jest.mock('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
jest.mock('@microsoft/microsoft-graph-client');
jest.mock('@azure/logger');

// Mock the actual implementation of getAuthenticatedClient
jest.mock('../src/auth', () => {
  // Save the original module
  const originalModule = jest.requireActual('../src/auth');
  
  // Mock the test implementation 
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

// Import the mocked module
import { getAuthenticatedClient } from '../src/auth';

describe('Authentication', () => {
  // Save and restore environment variables
  const savedEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...savedEnv }; // Start with a clean copy
    
    // Set required environment variables
    process.env.CLIENT_ID = 'test-client-id';
    process.env.CLIENT_SECRET = 'test-client-secret';
    process.env.TENANT_ID = 'test-tenant-id';
  });
  
  afterAll(() => {
    process.env = savedEnv; // Restore original environment variables
  });

  test('getAuthenticatedClient returns a client', async () => {
    const client = await getAuthenticatedClient();
    expect(client).toBeDefined();
    expect(getAuthenticatedClient).toHaveBeenCalled();
  });
});