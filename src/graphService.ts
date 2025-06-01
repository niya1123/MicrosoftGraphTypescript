// src/graphService.ts
import { Team, Channel, ChatMessage } from '@microsoft/microsoft-graph-types';
import { getApplicationClient } from './auth';

/**
 * 認証されたユーザーが参加しているチームの一覧を取得します。
 * Application認証を使用します。
 */
export async function listMyTeams(): Promise<void> {
  console.log('アプリケーションがアクセス可能なチームの一覧を取得しています...');
  try {
    const client = await getApplicationClient();
    // クライアント資格情報フローでは /me は使えないため、/teams を使用
    const response = await client.api('/teams') 
      .select('id,displayName,description') // 必要なプロパティのみを選択
      .get();
    
    const teams: Team[] = response.value;
    if (teams && teams.length > 0) {
      console.log('参加チーム:');
      teams.forEach(team => {
        console.log(`  - ${team.displayName} (ID: ${team.id})`);
        if (team.description) {
          console.log(`    説明: ${team.description}`);
        }
      });
    } else {
      console.log('参加しているチームはありません。');
    }
  } catch (error) {
    console.error('チーム一覧の取得中にエラーが発生しました:', error);
    throw error; // エラーを再スローして呼び出し元で処理できるようにする
  }
}

/**
 * 指定したチームのチャネル一覧を取得します。
 * Application認証を使用します。
 * @param teamId チームID
 */
export async function listChannels(teamId: string): Promise<void> {
  if (!teamId) {
    console.warn('チームIDが指定されていません。チャネル一覧の取得をスキップします。');
    return;
  }
  console.log(`チームID: ${teamId} のチャネル一覧を取得しています...`);
  try {
    const client = await getApplicationClient();
    const response = await client.api(`/teams/${teamId}/channels`)
      .select('id,displayName,description')
      .get();
    
    const channels: Channel[] = response.value;
    if (channels && channels.length > 0) {
      console.log(`チーム '${teamId}' のチャネル:`);
      channels.forEach(channel => {
        console.log(`  - ${channel.displayName} (ID: ${channel.id})`);
        if (channel.description) {
          console.log(`    説明: ${channel.description}`);
        }
      });
    } else {
      console.log(`チーム '${teamId}' にチャネルはありません。`);
    }
  } catch (error) {
    console.error(`チームID ${teamId} のチャネル一覧取得中にエラーが発生しました:`, error);
    throw error;
  }
}

/**
 * 指定したチームの指定したチャネルにメッセージを送信します。
 * まずDelegated認証を試行し、失敗した場合はApplication権限でimport形式を使用します。
 * @param teamId チームID
 * @param channelId チャネルID
 * @param messageContent 送信するメッセージの本文
 */
export async function sendMessageToChannel(
  teamId: string, 
  channelId: string, 
  messageContent: string
): Promise<void> {
  if (!teamId || !channelId) {
    console.warn('チームIDまたはチャネルIDが指定されていません。メッセージ送信をスキップします。');
    return;
  }
  
  if (!messageContent.trim()) {
    console.warn('メッセージ内容が空です。メッセージ送信をスキップします。');
    return;
  }
  
  console.log(`チームID: ${teamId}, チャネルID: ${channelId} にメッセージを送信しています...`);
  
  // 1. Delegated認証を試行（ユーザーコンテキストでの送信）
  try {
    console.log('📤 Delegated認証でメッセージを送信中...');
    const { getDelegatedClient } = await import('./auth');
    const delegatedClient = await getDelegatedClient();
    
    const message: ChatMessage = {
      body: {
        content: messageContent,
        contentType: 'text'
      }
    };

    await delegatedClient.api(`/teams/${teamId}/channels/${channelId}/messages`)
      .post(message);
      
    console.log('✅ メッセージが正常に送信されました（Delegated認証）。');
    return;
  } catch (error) {
    console.warn('⚠️ Delegated認証でのメッセージ送信に失敗しました:', error);
    console.log('📤 Application権限でのメッセージ送信にフォールバックします...');
  }

  // 2. Application認証でフォールバック（import mode）
  try {
    console.log('📤 Application権限でメッセージを送信中（import mode）...');
    const client = await getApplicationClient();
    
    // import contextでメッセージを作成
    const importMessage: ChatMessage = {
      createdDateTime: new Date().toISOString(),
      from: {
        application: {
          displayName: 'Microsoft Graph API Bot',
          id: 'graph-api-bot'
        }
      },
      body: {
        content: messageContent,
        contentType: 'text'
      },
      messageType: 'message',
      importance: 'normal'
    };

    await client.api(`/teams/${teamId}/channels/${channelId}/messages`)
      .header('Content-Type', 'application/json')
      .post(importMessage);
      
    console.log('✅ メッセージが正常に送信されました（Application権限 - import mode）。');
  } catch (error) {
    console.error('❌ すべての認証方法でメッセージ送信に失敗しました:', error);
    console.log('\n💡 メッセージ送信を有効にするには、以下のいずれかを実行してください：');
    console.log('   1. Azure Portal > App registrations > 認証:');
    console.log('      - リダイレクト URI: http://localhost:3000/auth/callback');
    console.log('      - Publicクライアントフローを許可: はい');
    console.log('   2. Azure Portal > API のアクセス許可:');
    console.log('      - ChannelMessage.Send (Delegated)');
    console.log('      - ChannelMessage.Send (Application) - 管理者の同意が必要');
    console.log('   3. Teams管理センターでアプリケーションを承認\n');
    throw error;
  }
}

/**
 * 指定したチームの指定したチャネルのメッセージ一覧を取得します。
 * Application認証を使用します。
 * @param teamId チームID
 * @param channelId チャネルID
 * @param top 取得するメッセージの最大数 (オプション)
 */
export async function listChannelMessages(
  teamId: string, 
  channelId: string, 
  top: number = 10 // デフォルトで最新10件を取得
): Promise<void> {
  if (!teamId || !channelId) {
    console.warn('チームIDまたはチャネルIDが指定されていません。メッセージ一覧の取得をスキップします。');
    return;
  }
  console.log(`チームID: ${teamId}, チャネルID: ${channelId} のメッセージ一覧を取得しています (上位${top}件)...`);
  try {
    const client = await getApplicationClient();
    const response = await client.api(`/teams/${teamId}/channels/${channelId}/messages`)
      .top(top)
      .get();
    
    const messages: ChatMessage[] = response.value;
    if (messages && messages.length > 0) {
      // 作成日時で降順ソート（最新が最初）
      const sortedMessages = messages.sort((a, b) => {
        const dateA = new Date(a.createdDateTime || '').getTime();
        const dateB = new Date(b.createdDateTime || '').getTime();
        return dateB - dateA;
      });
      
      console.log(`チャネル '${channelId}' のメッセージ (最新${sortedMessages.length}件):`);
      sortedMessages.forEach(message => {
        const sender = message.from?.user?.displayName || message.from?.application?.displayName || '不明な送信者';
        const content = message.body?.contentType === 'html' ? message.body.content : message.body?.content; // HTMLの場合はそのまま、textの場合はcontent
        // 簡単なHTMLタグ除去 (本番ではより堅牢なサニタイズ処理を推奨)
        const plainTextContent = content?.replace(/<[^>]*>?/gm, ''); 
        console.log(`  [${new Date(message.createdDateTime! || '').toLocaleString()}] ${sender}: ${plainTextContent}`);
      });
    } else {
      console.log(`チャネル '${channelId}' にメッセージはありません。`);
    }
  } catch (error) {
    console.error('メッセージ一覧の取得中にエラーが発生しました:', error);
    throw error;
  }
}

// 必要に応じて他のTeams関連操作の関数をここに追加します。
// 例: チーム作成、チャネル作成、ユーザーをチームに追加など。
