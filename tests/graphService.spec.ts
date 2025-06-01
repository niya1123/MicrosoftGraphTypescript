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

// モッククライアントメソッドの型アサーション
interface MockedClient extends Client {
  api: jest.Mock;
  select: jest.Mock;
  get: jest.Mock;
  post: jest.Mock;
  top: jest.Mock;
  orderby: jest.Mock;
}

describe('Graph Service', () => {
  // テスト出力を混乱させないためにconsoleメソッドをモック化
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
    test('APIがチームを返すと正常にチーム一覧を取得する', async () => {
      // モックデータを準備
      const mockTeams: Partial<Team>[] = [
        { id: 'team-1', displayName: 'Test Team 1', description: 'Team 1 Description' },
        { id: 'team-2', displayName: 'Test Team 2' }
      ];
      
      const mockResponse = MockGraphClient.createMockTeamsResponse(mockTeams);
      const mockClient = MockGraphClient.createMockClient(mockResponse) as unknown as MockedClient;
      
      // 関数を呼び出す
      await listMyTeams(mockClient);
      
      // インタラクションを検証
      expect(mockClient.api).toHaveBeenCalledWith('/teams');
      expect(mockClient.select).toHaveBeenCalledWith('id,displayName,description');
      expect(console.log).toHaveBeenCalledWith('アプリケーションがアクセス可能なチームの一覧を取得しています...');
      expect(console.log).toHaveBeenCalledWith('参加チーム:');
    });
    
    test('空のチームリストを処理する', async () => {
      // 空のチーム配列でモックを準備
      const mockResponse = MockGraphClient.createMockTeamsResponse([]);
      const mockClient = MockGraphClient.createMockClient(mockResponse) as unknown as MockedClient;
      
      // 関数を呼び出す
      await listMyTeams(mockClient);
      
      // インタラクションを検証
      expect(mockClient.api).toHaveBeenCalledWith('/teams');
      expect(console.log).toHaveBeenCalledWith('参加しているチームはありません。');
    });
    
    test('API呼び出し中のエラーを処理する', async () => {
      // エラーをスローするモッククライアントを準備
      const mockError = new Error('API Error');
      const mockClient = MockGraphClient.createErrorClient(mockError) as unknown as MockedClient;
      
      // 関数を呼び出して、スローされることを期待
      await expect(listMyTeams(mockClient)).rejects.toThrow('API Error');
      
      // インタラクションを検証
      expect(mockClient.api).toHaveBeenCalledWith('/teams');
      expect(console.error).toHaveBeenCalledWith(
        'チーム一覧の取得中にエラーが発生しました:',
        mockError
      );
    });
  });

  describe('listChannels', () => {
    const teamId = 'test-team-id';
    
    test('APIがチャネルを返すと正常にチャネル一覧を取得する', async () => {
      // モックデータを準備
      const mockChannels: Partial<Channel>[] = [
        { id: 'channel-1', displayName: 'General', description: 'General Channel' },
        { id: 'channel-2', displayName: 'Random' }
      ];
      
      const mockResponse = MockGraphClient.createMockChannelsResponse(mockChannels);
      const mockClient = MockGraphClient.createMockClient(mockResponse) as unknown as MockedClient;
      
      // 関数を呼び出す
      await listChannels(mockClient, teamId);
      
      // インタラクションを検証
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels`);
      expect(mockClient.select).toHaveBeenCalledWith('id,displayName,description');
      expect(console.log).toHaveBeenCalledWith(`チームID: ${teamId} のチャネル一覧を取得しています...`);
    });
    
    test('空のteamIdパラメータを処理する', async () => {
      const mockClient = MockGraphClient.createMockClient({}) as unknown as MockedClient;
      
      // 空のteamIdで呼び出す
      await listChannels(mockClient, '');
      
      // 警告を出し、API呼び出しをしないはず
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDが指定されていません。チャネル一覧の取得をスキップします。');
    });
    
    test('API呼び出し中のエラーを処理する', async () => {
      // エラーをスローするモッククライアントを準備
      const mockError = new Error('API Error');
      const mockClient = MockGraphClient.createErrorClient(mockError) as unknown as MockedClient;
      
      // 関数を呼び出して、スローされることを期待
      await expect(listChannels(mockClient, teamId)).rejects.toThrow('API Error');
      
      // インタラクションを検証
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
    
    test('チャネルにメッセージを正常に送信する', async () => {
      // モッククライアントを準備
      const mockClient = MockGraphClient.createMockClient({}) as unknown as MockedClient;
      
      // 関数を呼び出す
      await sendMessageToChannel(mockClient, teamId, channelId, messageContent);
      
      // インタラクションを検証
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels/${channelId}/messages`);
      expect(mockClient.post).toHaveBeenCalledWith({
        body: {
          content: messageContent,
          contentType: 'text',
        },
      });
      expect(console.log).toHaveBeenCalledWith('✅ メッセージが正常に送信されました。');
    });
    
    test('teamIdまたはchannelIdが欠けている場合を処理する', async () => {
      const mockClient = MockGraphClient.createMockClient({}) as unknown as MockedClient;
      
      // 空のteamIdで呼び出す
      await sendMessageToChannel(mockClient, '', channelId, messageContent);
      
      // 警告を出し、API呼び出しをしないはず
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDまたはチャネルIDが指定されていません。メッセージ送信をスキップします。');
      
      // モックをリセット
      jest.clearAllMocks();
      
      // 空のchannelIdで呼び出す
      await sendMessageToChannel(mockClient, teamId, '', messageContent);
      
      // 警告を出し、API呼び出しをしないはず
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDまたはチャネルIDが指定されていません。メッセージ送信をスキップします。');
    });
    
    test('空のメッセージ内容を処理する', async () => {
      const mockClient = MockGraphClient.createMockClient({}) as unknown as MockedClient;
      
      // 空のメッセージで呼び出す
      await sendMessageToChannel(mockClient, teamId, channelId, '');
      
      // 警告を出し、API呼び出しをしないはず
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('メッセージ内容が空です。メッセージ送信をスキップします。');
    });
    
    test('API呼び出し中のエラーを処理する', async () => {
      // エラーをスローするモッククライアントを準備
      const mockError = new Error('API Error');
      const mockClient = MockGraphClient.createErrorClient(mockError) as unknown as MockedClient;
      
      // 関数を呼び出して、スローされることを期待
      await expect(sendMessageToChannel(mockClient, teamId, channelId, messageContent)).rejects.toThrow('API Error');
      
      // インタラクションを検証
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels/${channelId}/messages`);
      expect(console.error).toHaveBeenCalledWith('❌ メッセージ送信中にエラーが発生しました:', mockError);
    });
  });

  describe('listChannelMessages', () => {
    const teamId = 'test-team-id';
    const channelId = 'test-channel-id';
    const top = 5;
    
    test('APIがメッセージを返すと正常にメッセージ一覧を取得する', async () => {
      // モックデータを準備
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
      const mockClient = MockGraphClient.createMockClient(mockResponse) as unknown as MockedClient;
      
      // 関数を呼び出す
      await listChannelMessages(mockClient, teamId, channelId, top);
      
      // インタラクションを検証
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels/${channelId}/messages`);
      expect(mockClient.top).toHaveBeenCalledWith(top);
    });
    
    test('teamIdまたはchannelIdが欠けている場合を処理する', async () => {
      const mockClient = MockGraphClient.createMockClient({}) as unknown as MockedClient;
      
      // 空のteamIdで呼び出す
      await listChannelMessages(mockClient, '', channelId);
      
      // 警告を出し、API呼び出しをしないはず
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDまたはチャネルIDが指定されていません。メッセージ一覧の取得をスキップします。');
      
      // モックをリセット
      jest.clearAllMocks();
      
      // 空のchannelIdで呼び出す
      await listChannelMessages(mockClient, teamId, '');
      
      // 警告を出し、API呼び出しをしないはず
      expect(mockClient.api).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('チームIDまたはチャネルIDが指定されていません。メッセージ一覧の取得をスキップします。');
    });
    
    test('API呼び出し中のエラーを処理する', async () => {
      // エラーをスローするモッククライアントを準備
      const mockError = new Error('API Error');
      const mockClient = MockGraphClient.createErrorClient(mockError) as unknown as MockedClient;
      
      // 関数を呼び出して、スローされることを期待
      await expect(listChannelMessages(mockClient, teamId, channelId)).rejects.toThrow('API Error');
      
      // インタラクションを検証
      expect(mockClient.api).toHaveBeenCalledWith(`/teams/${teamId}/channels/${channelId}/messages`);
      expect(console.error).toHaveBeenCalledWith('メッセージ一覧の取得中にエラーが発生しました:', mockError);
    });
  });
});