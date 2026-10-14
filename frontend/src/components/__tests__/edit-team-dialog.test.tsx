import { render, screen, fireEvent } from "@testing-library/react";
import { EditTeamDialog } from "../edit-team-dialog";
import { Team } from "@/types/team.types";

describe("EditTeamDialog component", () => {
  const dummyTeam: Team = {
    id: "team-42",
    name: "INAM SG",
    championship: "N2",
    players: [],
    matchs: [],
  };

  it("should open dialog, modify team details, and save", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(<EditTeamDialog team={dummyTeam} />);

    // Click trigger
    const trigger = screen.getByLabelText("Paramètres de l'équipe");
    fireEvent.click(trigger);

    expect(screen.getByText("Paramètres de l'équipe")).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Nom de l'équipe");
    const champInput = screen.getByLabelText("Championnat");

    expect(nameInput).toHaveValue("INAM SG");
    expect(champInput).toHaveValue("N2");

    fireEvent.change(nameInput, { target: { value: "INAM SG MODIFIED" } });
    fireEvent.change(champInput, { target: { value: "Nationale 1" } });

    // Click Enregistrer
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(consoleSpy).toHaveBeenCalledWith("TODO: Save team", {
      id: "team-42",
      name: "INAM SG MODIFIED",
      championship: "Nationale 1",
    });

    consoleSpy.mockRestore();
  });

  it("should handle team without championship", () => {
    const teamWithoutChamp: Team = {
      ...dummyTeam,
      championship: undefined,
    };

    render(<EditTeamDialog team={teamWithoutChamp} />);

    fireEvent.click(screen.getByLabelText("Paramètres de l'équipe"));
    const champInput = screen.getByLabelText("Championnat");
    expect(champInput).toHaveValue("");
  });
});
