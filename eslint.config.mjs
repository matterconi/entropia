import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize FlatCompat
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Define ESLint configuration
const eslintConfig = [
  ...compat.config({
    extends: [
      "next",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:prettier/recommended", // Integrates Prettier
    ],
    plugins: ["simple-import-sort", "import"], // Add plugins
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto", // Fix line-ending issues across environments
          semi: true, // Ensure semicolons match Prettier config
          singleQuote: false, // Use double quotes as per Prettier
          tabWidth: 2, // Align tab width
          useTabs: false, // Use spaces instead of tabs
        },
      ],
      // Simple Import Sort Rules
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Import Plugin Rules (Optional)
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"], // Built-in and external modules
            ["internal"], // Internal modules
            ["parent", "sibling", "index"], // Relative imports
          ],
          "newlines-between": "always", // Enforce newlines between groups
          alphabetize: { order: "asc", caseInsensitive: true }, // Sort alphabetically
        },
      ],
    },
  }),
];

export default eslintConfig;
