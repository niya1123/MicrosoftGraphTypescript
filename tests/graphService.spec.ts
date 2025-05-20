// tests/graphService.spec.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { Team, Channel, ChatMessage } from '@microsoft/microsoft-graph-types';
import { 
  listMyTeams, 
  listChannels, 
  sendMessageToChannel, 
  listChannelMessages 
} from '../src/graphService';
import { MockGraphClient } from './mocks/mockGraphClient';

describe('Graph Service', () => {
  // Mock console methods to avoid cluttering test output
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe('listMyTeams', () => {
    test('successfully lists teams when API returns teams', async () => {
      // Prepare mock data
      const mockTeams: Partial<Team>[] = [
        { id: 'team-1', displayName: 'Test Team 1', description: 'Team 1 Description' },
        { id: 'team-2', displayName: 'Test Team 2' }
      ];
      
      const mockResponse = MockGraphClient.createMockTeamsResponse(mockTeams);
      const mockClient = MockGraphClient.createMockClient(mockResponse);
      
      // Call the function
      await listMyTeams(mockClient);
      
      // Verify interactions
      expect(mockClient.api).toHaveBeenCalledWith('/teams');
      expect(mockClient.select).toHaveBeenCalledWith('id,displayName,description');
      expect(console.log).toHaveBeenCalledWith('アプリケーションがアクセス可能なチームの一覧を取得しています...');
      expect(console.log).toHaveBeenCalledWith('参加チーム:');
    });
    
    test('handles empty teams list', async () => {
      // Prepare mock with empty teams array
      const mockResponse = MockGraphClient.createMockTeamsResponse([]);
      const mockClient = MockGraphClient.createMockClient(mockResponse);
      
      // Call the function
      await listMyTeams(mockClient);
      
      // Verify interactions
      expect(mockClient.api).toHaveBeenCalledWith('/teams');
      expect(console.log).toHaveBeenCalledWith('参加しているチームはありません。');
    });
    
    test('handles errors during API call', async () => {
      // Prepare mock client that throws an error
      const mockError = new Error('API Error');
      const mockClient = MockGraphClient.createErrorClient(mockError);
      
      // Call the function and expect it to throw
      await expect(listMyTeams(mockClient)).rejects.toThrow('API Error');
      
      // Verify interactions
      expect(mockClient.api).toHaveBeenCalledWith('/teams');
      expect(console.error).toHaveBeenCalledWith(
        'チーム一覧の取得中にエラーが発生しました:',
        mockError
      );
    });
  });

  describe('listChannels', () => {
    const teamId = 'test-team-id';
    
    test('successfully lists channels when API returns channels', async () => {
      // Prepare mock data
      const mockChannels: Partial<Channel>[] = [
        { id: 'channel-1', displayName: 'General', description: 'General Channel' },
        { id: 'channel-2', displayName: 'Random' }
      ];
      
      const mockResponse = MockGraphClient.createMockChannelsResponse(mockChannels);
      const mockClient = MockGraphClient.createMockClient(mockResponse);
      
      // Call the function
      await listChannels(mockClient, teamId);
      
      // Verify interactions
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels`);
      expect(mockClient.select).toHaveBeenCalledWith('id,displayName,description');
      expect(console.log).toHaveBeenCalledWith(`チームID: ${teamId} のチャネル一覧を取得しています...`);
    });
    
    test('handles empty teamId parameter', async () => {
      const mockClient = MockGraphClient.createMockClient({});
      
      // Call with empty teamId
      await listChannels(mockClient, '');
      
      // Should warn and not make API call
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDが指定されていません。チャネル一覧の取得をスキップします。');
    });
    
    test('handles errors during API call', async () => {
      // Prepare mock client that throws an error
      const mockError = new Error('API Error');
      const mockClient = MockGraphClient.createErrorClient(mockError);
      
      // Call the function and expect it to throw
      await expect(listChannels(mockClient, teamId)).rejects.toThrow('API Error');
      
      // Verify interactions
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels`);
      expect(console.error).toHaveBeenCalledWith(
        `チームID ${teamId} のチャネル一覧取得中にエラーが発生しました:`,
        mockError
      );
    });
  });

  describe('sendMessageToChannel', () => {
    const teamId = 'test-team-id';
    const channelId = 'test-channel-id';
    const messageContent = 'Test message';
    
    test('successfully sends message to channel', async () => {
      // Prepare mock client
      const mockClient = MockGraphClient.createMockClient({});
      
      // Call the function
      await sendMessageToChannel(mockClient, teamId, channelId, messageContent);
      
      // Verify interactions
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels/${channelId}/messages`);
      expect(mockClient.post).toHaveBeenCalledWith({
        body: {
          content: messageContent,
          contentType: 'html',
        },
      });
      expect(console.log).toHaveBeenCalledWith('メッセージが正常に送信されました。');
    });
    
    test('handles missing teamId or channelId', async () => {
      const mockClient = MockGraphClient.createMockClient({});
      
      // Call with empty teamId
      await sendMessageToChannel(mockClient, '', channelId, messageContent);
      
      // Should warn and not make API call
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDまたはチャネルIDが指定されていません。メッセージ送信をスキップします。');
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Call with empty channelId
      await sendMessageToChannel(mockClient, teamId, '', messageContent);
      
      // Should warn and not make API call
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDまたはチャネルIDが指定されていません。メッセージ送信をスキップします。');
    });
    
    test('handles errors during API call', async () => {
      // Prepare mock client that throws an error
      const mockError = new Error('API Error');
      const mockClient = MockGraphClient.createErrorClient(mockError);
      
      // Call the function and expect it to throw
      await expect(sendMessageToChannel(mockClient, teamId, channelId, messageContent)).rejects.toThrow('API Error');
      
      // Verify interactions
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels/${channelId}/messages`);
      expect(console.error).toHaveBeenCalledWith('メッセージ送信中にエラーが発生しました:', mockError);
    });
  });

  describe('listChannelMessages', () => {
    const teamId = 'test-team-id';
    const channelId = 'test-channel-id';
    const top = 5;
    
    test('successfully lists messages when API returns messages', async () => {
      // Prepare mock data
      const mockMessages: Partial<ChatMessage>[] = [
        { 
          id: 'msg-1', 
          createdDateTime: new Date().toISOString(),
          body: { content: 'Test message 1', contentType: 'text' },
          from: { user: { displayName: 'Test User' } }
        },
        { 
          id: 'msg-2', 
          createdDateTime: new Date().toISOString(),
          body: { content: '<p>Test message 2</p>', contentType: 'html' },
          from: { application: { displayName: 'Test App' } }
        }
      ];
      
      const mockResponse = MockGraphClient.createMockMessagesResponse(mockMessages);
      const mockClient = MockGraphClient.createMockClient(mockResponse);
      
      // Call the function
      await listChannelMessages(mockClient, teamId, channelId, top);
      
      // Verify interactions
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels/${channelId}/messages`);
      expect(mockClient.top).toHaveBeenCalledWith(top);
      expect(mockClient.orderby).toHaveBeenCalledWith('createdDateTime DESC');
      expect(mockClient.select).toHaveBeenCalledWith('id,body,from,createdDateTime');
    });
    
    test('handles missing teamId or channelId', async () => {
      const mockClient = MockGraphClient.createMockClient({});
      
      // Call with empty teamId
      await listChannelMessages(mockClient, '', channelId);
      
      // Should warn and not make API call
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDまたはチャネルIDが指定されていません。メッセージ一覧の取得をスキップします。');
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Call with empty channelId
      await listChannelMessages(mockClient, teamId, '');
      
      // Should warn and not make API call
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDまたはチャネルIDが指定されていません。メッセージ一覧の取得をスキップします。');
    });
    
    test('handles errors during API call', async () => {
      // Prepare mock client that throws an error
      const mockError = new Error('API Error');
      const mockClient = MockGraphClient.createErrorClient(mockError);
      
      // Call the function and expect it to throw
      await expect(listChannelMessages(mockClient, teamId, channelId)).rejects.toThrow('API Error');
      
      // Verify interactions
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels/${channelId}/messages`);
      expect(console.error).toHaveBeenCalledWith('メッセージ一覧の取得中にエラーが発生しました:', mockError);
    });
  });
});