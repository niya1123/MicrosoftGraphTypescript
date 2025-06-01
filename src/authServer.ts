// src/authServer.ts
import * as http from 'http';
import * as url from 'url';

/**
 * Interactive Browser認証用の一時的なHTTPサーバー
 * リダイレクトURLでの認証コードを受け取るために使用
 */
export class AuthServer {
  private server: http.Server | null = null;
  private port: number = 3000;

  /**
   * 認証サーバーを開始
   * @param port ポート番号（デフォルト: 3000）
   * @returns Promise<void>
   */
  async start(port: number = 3000): Promise<void> {
    this.port = port;
    
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.port, () => {
        console.log(`🌐 認証サーバーがポート ${this.port} で開始されました`);
        resolve();
      });

      this.server.on('error', (error) => {
        console.error('認証サーバーエラー:', error);
        reject(error);
      });
    });
  }

  /**
   * 認証サーバーを停止
   */
  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          console.log('🛑 認証サーバーが停止されました');
          this.server = null;
          resolve();
        });
      });
    }
  }

  /**
   * HTTPリクエストを処理
   */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const parsedUrl = url.parse(req.url || '', true);
    
    if (parsedUrl.pathname === '/auth/callback') {
      // 認証コールバックの処理
      const authCode = parsedUrl.query.code as string;
      const error = parsedUrl.query.error as string;

      if (error) {
        console.error('🔐 認証エラー:', error);
        this.sendErrorResponse(res, `認証エラー: ${error}`);
      } else if (authCode) {
        console.log('✅ 認証コードを受信しました');
        this.sendSuccessResponse(res);
      } else {
        this.sendErrorResponse(res, '認証コードまたはエラー情報が見つかりません');
      }
    } else {
      // その他のパスは404
      this.send404Response(res);
    }
  }

  /**
   * 成功レスポンスを送信
   */
  private sendSuccessResponse(res: http.ServerResponse): void {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>認証成功</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          .success { color: green; }
          .info { color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1 class="success">✅ 認証が成功しました！</h1>
        <p class="info">このウィンドウを閉じて、ターミナルに戻ってください。</p>
        <script>
          // 3秒後に自動的にウィンドウを閉じる
          setTimeout(() => {
            window.close();
          }, 3000);
        </script>
      </body>
      </html>
    `;
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  /**
   * エラーレスポンスを送信
   */
  private sendErrorResponse(res: http.ServerResponse, message: string): void {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>認証エラー</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          .error { color: red; }
          .info { color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1 class="error">❌ 認証エラー</h1>
        <p>${message}</p>
        <p class="info">このウィンドウを閉じて、ターミナルに戻ってください。</p>
      </body>
      </html>
    `;
    
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  /**
   * 404レスポンスを送信
   */
  private send404Response(res: http.ServerResponse): void {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 - ページが見つかりません');
  }

  /**
   * サーバーが動作中かチェック
   */
  isRunning(): boolean {
    return this.server !== null;
  }

  /**
   * 使用中のポート番号を取得
   */
  getPort(): number {
    return this.port;
  }
}

// シングルトンインスタンス
const authServer = new AuthServer();
export default authServer;
