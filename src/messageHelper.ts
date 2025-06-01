import { getApplicationClient } from './auth';
import { ChatMessage } from '@microsoft/microsoft-graph-types';

/**
 * Application権限でメッセージを送信する代替手段
 * import contextを使用してメッセージを送信します
 */
export async function sendMessageAsApplication(
  teamId: string,
  channelId: string,
  messageContent: string,
  senderDisplayName: string = 'システム'
): Promise<void> {
  if (!teamId || !channelId) {
    console.warn('チームIDまたはチャネルIDが指定されていません。メッセージ送信をスキップします。');
    return;
  }
  
  if (!messageContent.trim()) {
    console.warn('メッセージ内容が空です。メッセージ送信をスキップします。');
    return;
  }
  
  console.log(`📤 Application権限でメッセージを送信中（import mode）...`);
  console.log(`チームID: ${teamId}, チャネルID: ${channelId}`);
  
  try {
    const client = await getApplicationClient();
    
    // import contextでメッセージを作成
    const importMessage: ChatMessage = {
      createdDateTime: new Date().toISOString(),
      from: {
        application: {
          displayName: senderDisplayName,
          id: 'application-bot'
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
      
    console.log('✅ メッセージが正常に送信されました（Application権限）。');
  } catch (error) {
    console.error('❌ Application権限でのメッセージ送信に失敗しました:', error);
    throw error;
  }
}

/**
 * メッセージ送信のフォールバック処理
 * 複数の方法を順次試行します
 */
export async function sendMessageWithFallback(
  teamId: string,
  channelId: string,
  messageContent: string
): Promise<boolean> {
  // 方法1: Application権限でimport形式で送信
  try {
    await sendMessageAsApplication(teamId, channelId, messageContent);
    return true;
  } catch (error) {
    console.log('⚠️ Application権限での送信に失敗。代替手段を検討してください。');
    console.log('詳細:', (error as Error).message);
  }

  // 現在は Application権限のみをサポート
  // Device Code Flow の問題が解決されるまで、Delegated認証は無効にします
  console.log('💡 メッセージ送信を有効にするには、以下のいずれかを実行してください：');
  console.log('   1. Azure ADアプリでPublicクライアントフローを有効にする');
  console.log('   2. Application権限でChannelMessage.Send権限を有効にする');
  console.log('   3. Teams内蔵のメッセージ送信機能を使用する');
  
  return false;
}
