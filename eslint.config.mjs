import coreWebVitals from 'eslint-config-next/core-web-vitals'

// eslint 9 + eslint-config-next 16 只吃 flat config，舊的 .eslintrc.json 會噴
// 「Converting circular structure to JSON」直接跑不起來，所以改成這份。
// core-web-vitals 這包已經含 next 與 next/typescript，不用再另外 spread
// eslint-config-next/typescript，不然同一條規則會被註冊兩次、每個錯誤報兩遍。
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'next-env.d.ts',
      // 設計交付稿的產物，不是這個專案維護的程式碼
      'design-handoff/**',
    ],
  },
  ...coreWebVitals,
]

export default eslintConfig
