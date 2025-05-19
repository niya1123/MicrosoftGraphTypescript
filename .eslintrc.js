module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2019, // TypeScript 3.7のターゲットes2019と整合
    sourceType: 'module',
    project: './tsconfig.json', // tsconfig.jsonのパスを指定
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    // ここにカスタムルールを追加できます
    'no-console': 'warn', // console.logの使用を警告
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // 未使用変数を警告 (ただし、_で始まる引数は無視)
    '@typescript-eslint/explicit-function-return-type': 'off', // 関数の戻り値の型指定を必須にしない
    '@typescript-eslint/no-explicit-any': 'warn', // anyの使用を警告
    '@typescript-eslint/no-inferrable-types': 'off', // 初期化式から推論可能な型注釈を許可
  },
  ignorePatterns: ["node_modules/", "dist/", ".eslintrc.js"], // ESLintの対象外とするファイル/ディレクトリ
};
