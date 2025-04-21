import tseslint from "typescript-eslint";
import parser from "@typescript-eslint/parser";
import security from "eslint-plugin-security";
import globals from "globals";

export default tseslint.config(
    [
        {
            files: ["**/*.ts", "**/*.tsx"],
            languageOptions: {
                parser,
                parserOptions: {
                    project: "./tsconfig.eslint.json",
                    tsconfigRootDir: new URL(".", import.meta.url),
                },
                sourceType: "module",
                globals: globals.node,
            },
            plugins: {
                "@typescript-eslint": tseslint.plugin,
                security,
            },
            rules: {
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/no-inferrable-types": "off",
                "@typescript-eslint/no-unnecessary-type-assertion": "off",
                "@typescript-eslint/no-non-null-assertion": "off",
                "@typescript-eslint/no-unsafe-member-access": "off",
                "@typescript-eslint/restrict-template-expressions": "off",
                "@typescript-eslint/no-unsafe-assignment": "off",
                "@typescript-eslint/no-floating-promises": "off",
                "@typescript-eslint/no-empty-function": "off",
                "@typescript-eslint/no-var-requires": "off",
                "@typescript-eslint/restrict-plus-operands": "off",
                "@typescript-eslint/no-unsafe-return": "off",
                "@typescript-eslint/explicit-module-boundary-types": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/no-unsafe-call": "off",

                "security/detect-object-injection": "off",
                "security/detect-non-literal-fs-filename": "off",

                "no-var": "off",
                "prefer-const": "off"
            }
        },
        {
            files: ["src/tests/**/*"],
            rules: {}
        }
    ]
);

