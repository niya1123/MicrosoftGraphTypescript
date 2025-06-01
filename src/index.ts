// src/index.ts
import 'dotenv/config'; // .envファイルを読み込む
import { getAuthenticatedClient } from './auth';
import { listMyTeams, listChannels, listChannelMessages, sendMessageToChannel } from './graphService';

// メインの非同期関数
async function main() {
  console.log('アプリケーションを開始します...');

  try {
    // 認証済みGraphクライアントを取得
    const graphClient = await getAuthenticatedClient();
    console.log('Microsoft Graphクライアントの認証に成功しました。');

    // --- ここから具体的なGraph API操作を実装します ---

    // 例1: 参加しているチームの一覧を取得して表示
    await listMyTeams(graphClient);

    // .envファイルまたは環境変数でTARGET_TEAM_IDとTARGET_CHANNEL_IDを設定してください
    const teamId = process.env.TARGET_TEAM_ID;
    const channelId = process.env.TARGET_CHANNEL_ID;

    if (teamId) {
      // 例2: 指定したチームのチャネル一覧を取得
      console.log('\n--- チャネル一覧の取得テスト ---');
      await listChannels(graphClient, teamId);

      if (channelId) {
        // 例3: 指定したチャネルのメッセージ一覧を取得
        console.log('\n--- メッセージ一覧の取得テスト ---');
        await listChannelMessages(graphClient, teamId, channelId, 5); // 最新5件を取得

        // 例4: 特定のチームの特定のチャネルにメッセージを送信 (import目的)
        console.log('\n--- メッセージ送信テスト (Import Mode) ---');
        const messageContent = 'TypeScriptアプリからのテストメッセージです！ (時刻: ' + new Date().toLocaleString('ja-JP') + ')';
        console.log(`チームID: ${teamId}, チャネルID: ${channelId} にメッセージを送信します (Import Mode)...`);
        try {
          // Application認証ではimportモードでのみメッセージ送信が可能
          await sendMessageToChannel(graphClient, teamId, channelId, messageContent, true);
        } catch (error: any) {
          if (error.code === 'Forbidden' && error.message?.includes('Teamwork.Migrate.All')) {
            console.log('⚠️  メッセージ送信にはTeamwork.Migrate.All権限が必要です。現在は読み取り専用で動作しています。');
          } else if (error.code === 'Unauthorized' && error.message?.includes('Message POST is allowed in application-only context only for import purposes')) {
            console.log('⚠️  Application認証では通常のメッセージ送信はできません。Import機能を試行中...');
            console.log('   📖 詳細: https://docs.microsoft.com/microsoftteams/platform/graph-api/import-messages/import-external-messages-to-teams');
          } else {
            console.log('🔄 Import機能での送信を試行しましたが、エラーが発生しました:', error.message);
          }
        }
      } else {
        console.warn(
          'TARGET_CHANNEL_ID が環境変数に設定されていません。メッセージ一覧取得とメッセージ送信はスキップされます。'
        );
      }
    } else {
      console.warn(
        'TARGET_TEAM_ID が環境変数に設定されていません。チャネル一覧取得、メッセージ一覧取得、メッセージ送信はスキップされます。'
      );
    }

    // --- ここまで具体的なGraph API操作 ---

    console.log('\nアプリケーションの処理が完了しました。');
  } catch (error) {
    console.error('アプリケーションの実行中にエラーが発生しました:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

// アプリケーションを実行
main().catch((err) => {
  console.error("メイン関数でキャッチされなかったエラー:", err);
});
