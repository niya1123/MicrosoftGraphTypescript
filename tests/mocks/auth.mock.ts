// tests/mocks/auth.mock.ts
import { Client } from '@microsoft/microsoft-graph-client';

/**
 * Mock implementation of getAuthenticatedClient for testing
 */
export const getAuthenticatedClient = jest.fn().mockImplementation(async (): Promise<Client> => {
  return {
    api: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({}),
    post: jest.fn().mockResolvedValue({})
  } as unknown as Client;
});