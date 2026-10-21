import { render, screen } from "@testing-library/react";
import { Header } from "../header";

describe("Header component", () => {
  it("should render string title and subtitle correctly", () => {
    render(<Header title="Tableau de bord" subtitle="Statistiques générales" />);

    expect(screen.getByRole("heading", { name: "Tableau de bord" })).toBeInTheDocument();
    expect(screen.getByText("Statistiques générales")).toBeInTheDocument();
  });

  it("should render ReactNode title when title is not a string", () => {
    render(<Header title={<span data-testid="custom-title">Custom Node</span>} />);

    expect(screen.getByTestId("custom-title")).toHaveTextContent("Custom Node");
  });

  it("should render back link button when backHref is provided", () => {
    render(<Header title="Page" backHref="/equipe/123" />);

    const backButton = screen.getByLabelText("Retour");
    expect(backButton).toBeInTheDocument();
    const link = backButton.closest("a");
    expect(link).toHaveAttribute("href", "/equipe/123");
  });

  it("should render custom leftContent instead of back link", () => {
    render(
      <Header
        title="Page"
        backHref="/equipe/123"
        leftContent={<button data-testid="custom-left">Menu</button>}
      />
    );

    expect(screen.getByTestId("custom-left")).toBeInTheDocument();
    expect(screen.queryByLabelText("Retour")).not.toBeInTheDocument();
  });

  it("should render rightContent and bottomContent when supplied", () => {
    render(
      <Header
        title="Page"
        rightContent={<button data-testid="btn-right">Action</button>}
        bottomContent={<nav data-testid="bottom-nav">Nav</nav>}
      />
    );

    expect(screen.getByTestId("btn-right")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
  });
});
