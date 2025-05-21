// src/types/graph.d.ts

// このファイルは、Microsoft Graph SDK (@microsoft/microsoft-graph-types)
// が提供する型定義を補完したり、プロジェクト固有の型を定義するために使用できます。

// 例: カスタムのユーザープロパティを持つユーザーオブジェクトを定義する場合
/*
import { User } from '@microsoft/microsoft-graph-types';

export interface CustomUser extends User {
  employeeId?: string;
  customDepartment?: string;
}
*/

// 現時点では、基本的なSDKの型で十分なため、このファイルは空またはコメントアウトされた例のみです。
// プロジェクトの要件に応じて、ここに必要な型定義を追加してください。

// Microsoft Graph SDKの主要な型は、通常、以下のように直接インポートして使用できます。
// import { Team, Channel, ChatMessage, User } from '@microsoft/microsoft-graph-types';

// グローバルな型拡張が必要な場合は、以下のように記述できます。
/*
declare global {
  namespace MicrosoftGraph {
    // 例: Event型にカスタムプロパティを追加
    interface Event {
      customProperty?: string;
    }
  }
}
// 型拡張を有効にするには、tsconfig.jsonのtypeRootsまたはtypesにこのファイルを含めるか、
// またはファイル内で `export {};` を記述してモジュールとして認識させる必要がある場合があります。
*/
export {}; // このファイルがモジュールであることを示すため (他のファイルからimport/exportしない場合でも)
