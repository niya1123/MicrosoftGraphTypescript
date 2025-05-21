// tests/mocks/mockGraphClient.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { Team, Channel, ChatMessage } from '@microsoft/microsoft-graph-types';

interface MockClientType extends Partial<Client> {
  api: jest.Mock;
  select: jest.Mock;
  get: jest.Mock;
  post: jest.Mock;
  top: jest.Mock;
  orderby: jest.Mock;
}

export class MockGraphClient {
  static createMockClient(responseData: any = {}): Client {
    const mockClient: MockClientType = {
      api: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(responseData),
      post: jest.fn().mockResolvedValue({}),
      top: jest.fn().mockReturnThis(),
      orderby: jest.fn().mockReturnThis()
    };
    
    return mockClient;
  }

  static createMockTeamsResponse(teams: Partial<Team>[] = []) {
    return {
      value: teams
    };
  }

  static createMockChannelsResponse(channels: Partial<Channel>[] = []) {
    return {
      value: channels
    };
  }

  static createMockMessagesResponse(messages: Partial<ChatMessage>[] = []) {
    return {
      value: messages
    };
  }

  static createErrorClient(error: Error): Client {
    const mockClient = {
      api: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      get: jest.fn().mockRejectedValue(error),
      post: jest.fn().mockRejectedValue(error),
      top: jest.fn().mockReturnThis(),
      orderby: jest.fn().mockReturnThis()
    } as unknown as Client;
    
    return mockClient;
  }
}