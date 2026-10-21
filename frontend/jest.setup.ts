import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill TextEncoder / TextDecoder pour les utilitaires de cache Next.js en environnement jsdom
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  // @ts-expect-error - node TextDecoder polyfill
  global.TextDecoder = TextDecoder;
}

// Assurer la présence des API standard du web (Fetch API) dans l'environnement jsdom de Jest
if (typeof global.Response === "undefined" && typeof globalThis.Response !== "undefined") {
  global.Response = globalThis.Response;
}
if (typeof global.Headers === "undefined" && typeof globalThis.Headers !== "undefined") {
  global.Headers = globalThis.Headers;
}
if (typeof global.Request === "undefined" && typeof globalThis.Request !== "undefined") {
  global.Request = globalThis.Request;
}

// Mock next/navigation pour Jest
jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "",
  };
});

