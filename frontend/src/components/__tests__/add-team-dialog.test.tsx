import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddTeamDialog } from "../add-team-dialog";
import { createTeamAction } from "@/actions/team.actions";

jest.mock("@/actions/team.actions", () => ({
  createTeamAction: jest.fn(),
}));

describe("AddTeamDialog component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should open dialog and successfully create team", async () => {
    (createTeamAction as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { id: "team-1", name: "INAM SG" },
    });

    render(<AddTeamDialog />);

    // Click trigger
    fireEvent.click(screen.getByRole("button", { name: /ajouter une équipe/i }));

    expect(screen.getByText("Nouvelle équipe")).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Nom de l'équipe");
    const champInput = screen.getByLabelText("Championnat");

    fireEvent.change(nameInput, { target: { value: "INAM SG" } });
    fireEvent.change(champInput, { target: { value: "Nationale 2" } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Créer l'équipe" }));

    await waitFor(() => {
      expect(createTeamAction).toHaveBeenCalledWith({
        name: "INAM SG",
        championship: "Nationale 2",
      });
    });
  });

  it("should display error message when action returns success: false", async () => {
    (createTeamAction as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: "Ce nom d'équipe existe déjà",
    });

    render(<AddTeamDialog />);
    fireEvent.click(screen.getByRole("button", { name: /ajouter une équipe/i }));

    fireEvent.change(screen.getByLabelText("Nom de l'équipe"), {
      target: { value: "INAM SG" },
    });
    fireEvent.change(screen.getByLabelText("Championnat"), {
      target: { value: "Nationale 2" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Créer l'équipe" }));

    await waitFor(() => {
      expect(screen.getByText("Ce nom d'équipe existe déjà")).toBeInTheDocument();
    });
  });

  it("should display error message when action throws an exception", async () => {
    (createTeamAction as jest.Mock).mockRejectedValueOnce(new Error("Erreur réseau critique"));

    render(<AddTeamDialog />);
    fireEvent.click(screen.getByRole("button", { name: /ajouter une équipe/i }));

    fireEvent.change(screen.getByLabelText("Nom de l'équipe"), {
      target: { value: "INAM SG" },
    });
    fireEvent.change(screen.getByLabelText("Championnat"), {
      target: { value: "Nationale 2" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Créer l'équipe" }));

    await waitFor(() => {
      expect(screen.getByText("Erreur réseau critique")).toBeInTheDocument();
    });
  });
});
