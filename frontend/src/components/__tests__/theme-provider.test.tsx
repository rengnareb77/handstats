import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../theme-provider";

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe("ThemeProvider & useTheme", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("should throw error when useTheme is called outside ThemeProvider", () => {
    // Suppress console.error for expected React boundary error
    const spy = jest.spyOn(console, "error").mockImplementation();
    expect(() => render(<TestConsumer />)).toThrow(
      "useTheme must be used within <ThemeProvider>"
    );
    spy.mockRestore();
  });

  it("should default to dark theme and toggle to light and back", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Toggle theme to light
    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("hs-theme")).toBe("light");

    // Toggle back to dark
    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("hs-theme")).toBe("dark");
  });

  it("should initialize from localStorage if present", () => {
    localStorage.setItem("hs-theme", "light");

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
  });

  it("should initialize from prefers-color-scheme when localStorage is empty", () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes("light"),
      media: query,
    }));

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
  });
});
