import { render, screen, fireEvent } from "@testing-library/react";
import { BackButton } from "../back-button";

const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("BackButton component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render link with target href", () => {
    render(<BackButton href="/equipe/123?tab=matchs" />);

    const button = screen.getByRole("button", { name: "Retour" });
    expect(button).toBeInTheDocument();
    const link = button.closest("a");
    expect(link).toHaveAttribute("href", "/equipe/123?tab=matchs");
  });

  it("should call router.back() when internal history exists", () => {
    // Simulate internal history and internal referrer
    Object.defineProperty(window, "history", {
      value: { length: 3 },
      writable: true,
    });
    Object.defineProperty(document, "referrer", {
      value: "http://localhost/equipe/123?tab=matchs",
      writable: true,
    });

    render(<BackButton href="/equipe/123?tab=matchs" />);
    const link = screen.getByRole("button", { name: "Retour" }).closest("a")!;

    fireEvent.click(link);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("should not call router.back() when referrer is external or empty", () => {
    Object.defineProperty(window, "history", {
      value: { length: 1 },
      writable: true,
    });
    Object.defineProperty(document, "referrer", {
      value: "",
      writable: true,
    });

    render(<BackButton href="/equipe/123?tab=matchs" />);
    const link = screen.getByRole("button", { name: "Retour" }).closest("a")!;

    fireEvent.click(link);
    expect(mockBack).not.toHaveBeenCalled();
  });
});
