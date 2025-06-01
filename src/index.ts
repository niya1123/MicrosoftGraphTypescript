// src/index.ts
import 'dotenv/config'; // .envファイルを読み込む
import * as readline from 'readline';
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

        // 例4: 対話的メッセージ送信機能
        console.log('\n--- 対話的メッセージ送信 ---');
        await interactiveMessageSending(graphClient, teamId, channelId);
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

/**
 * 対話的メッセージ送信機能
 * ユーザーからの入力を受け取ってメッセージを送信します
 */
async function interactiveMessageSending(graphClient: any, teamId: string, channelId: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('📝 メッセージ送信機能を開始します。');
  console.log('   "exit" または "quit" と入力すると終了します。');
  console.log('   空白行を入力すると送信をスキップします。\n');

  const askForMessage = (): Promise<string> => {
    return new Promise((resolve) => {
      rl.question('💬 送信するメッセージを入力してください: ', (answer) => {
        resolve(answer);
      });
    });
  };

  while (true) {
    try {
      const message = await askForMessage();
      
      // 終了コマンドをチェック
      if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
        console.log('👋 メッセージ送信機能を終了します。');
        break;
      }
      
      // 空白メッセージをスキップ
      if (!message.trim()) {
        console.log('⚠️  空のメッセージはスキップされました。\n');
        continue;
      }
      
      // メッセージを送信
      console.log(`\n📤 メッセージを送信中: "${message}"`);
      await sendMessageToChannel(graphClient, teamId, channelId, message);
      console.log('');
      
    } catch (error: any) {
      console.error('❌ メッセージ送信中にエラーが発生しました:', error.message);
      console.log('🔄 次のメッセージを入力してください。\n');
    }
  }
  
  rl.close();
}

// アプリケーションを実行
main().catch((err) => {
  console.error("メイン関数でキャッチされなかったエラー:", err);
});
