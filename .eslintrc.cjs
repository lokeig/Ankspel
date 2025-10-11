// .eslintrc.cjs
module.exports = {
  env: { browser: true, node: true, es2021: true },
  parser: '@typescript-eslint/parser',
  plugins: ['import', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript'
  ],
  settings: {
    'import/resolver': {
      typescript: {}, // uses tsconfig paths like @common, etc.
    },
  },
  rules: {
    // 🔒 Prevent circular imports (common problem)
    'import/no-cycle': ['error', { maxDepth: 1 }],

    // 🚫 Restrict certain folder cross-imports
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Example: common shouldn’t import game logic
          {
            target: './src/Status/Game/Common',
            from: ['./src/Status/Game/Objects', './src/Status/Game/GameLoop', './src/Status/Game/Render'],
          },
          // Example: server shouldn’t import client/render code
          {
            target: './src/Status/Server',
            from: ['./src/Status/Game/Render'],
          },
        ],
      },
    ],
  },
};
