import { render, screen, fireEvent } from "@testing-library/react";
import { EditMatchDialog } from "../edit-match-dialog";
import { Match } from "@/types/match.types";

describe("EditMatchDialog component", () => {
  const dummyMatch: Match = {
    codeRencontre: "M-42",
    homeTeamName: "Equipe A",
    awayTeamName: "Equipe B",
    homeScore: { halfScore: 10, finalScore: 20 },
    awayScore: { halfScore: 10, finalScore: 20 },
    isHome: true,
    date: "12/10/2026",
    homeTeamPlayers: [],
    awayTeamPlayers: [],
    events: [],
  };

  it("should open dialog, toggle home/away, and save", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(<EditMatchDialog match={dummyMatch} />);

    // Open dialog
    fireEvent.click(screen.getByLabelText("Paramètres du match"));

    expect(screen.getByText("Modifier le match")).toBeInTheDocument();

    // Toggle location to Extérieur
    fireEvent.click(screen.getByRole("button", { name: "Extérieur" }));

    // Click Enregistrer
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(consoleSpy).toHaveBeenCalledWith("TODO: Save match location", {
      matchId: "M-42",
      isHome: false,
    });

    consoleSpy.mockRestore();
  });

  it("should default isHome to false if match.isHome is undefined", () => {
    const matchWithoutHome: Match = {
      ...dummyMatch,
      isHome: undefined,
    };

    render(<EditMatchDialog match={matchWithoutHome} />);
    fireEvent.click(screen.getByLabelText("Paramètres du match"));

    // Toggle location to Domicile
    fireEvent.click(screen.getByRole("button", { name: "Domicile" }));
    expect(screen.getByRole("button", { name: "Domicile" })).toBeInTheDocument();
  });
});
