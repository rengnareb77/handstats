import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/actions/**/*.{js,ts}",
    "src/lib/**/*.{js,ts}",
    "src/components/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/types/**",
    "!src/**/types.ts",
    "!src/components/ui/**",
  ],
};

export default createJestConfig(config);
