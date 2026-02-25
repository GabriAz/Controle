// eslint.config.mjs
import next from "@next/eslint-plugin-next"
import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"

export default [
    {
        ignores: [".next/**", "node_modules/**", "dist/**", "build/**"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            "@next/next": next,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            ...next.configs.recommended.rules,
            ...next.configs["core-web-vitals"].rules,
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off"
        },
    },
]
