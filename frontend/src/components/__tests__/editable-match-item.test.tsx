import { render, screen, fireEvent } from "@testing-library/react";
import { EditableMatchItem } from "../editable-match-item";
import { Match } from "@/types/match.types";

describe("EditableMatchItem component", () => {
  const match: Match = {
    codeRencontre: "M-42",
    homeTeamName: "INAM SG",
    awayTeamName: "CESSON RENNES",
    homeScore: { halfScore: 12, finalScore: 28 },
    awayScore: { halfScore: 10, finalScore: 24 },
    isHome: true,
    date: "12/10/2026 20:00",
    homeTeamPlayers: [],
    awayTeamPlayers: [],
    events: [],
  };

  it("should render opponent name and final score correctly", () => {
    render(<EditableMatchItem match={match} teamId="team-1" />);

    // When isHome is true, opponent is awayTeamName
    expect(screen.getByText("CESSON RENNES")).toBeInTheDocument();
    expect(screen.getByText("28 - 24")).toBeInTheDocument();
    expect(screen.getByText("12/10/2026 20:00")).toBeInTheDocument();
  });

  it("should allow toggling between Dom and Ext", () => {
    render(<EditableMatchItem match={match} teamId="team-1" />);

    const extButton = screen.getByRole("button", { name: /ext/i });
    fireEvent.click(extButton);

    // After switching to Ext, opponent becomes homeTeamName
    expect(screen.getByText("INAM SG")).toBeInTheDocument();
  });
});
