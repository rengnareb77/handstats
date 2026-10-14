import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MatchDetailClient } from "../match-detail-client";
import { Match, MatchEvent } from "@/types/match.types";
import { Team } from "@/types/team.types";
import {
  addMatchEventAction,
  updateMatchEventAction,
  deleteMatchEventAction,
} from "@/actions/match.actions";

jest.mock("@/actions/match.actions", () => ({
  addMatchEventAction: jest.fn(),
  updateMatchEventAction: jest.fn(),
  deleteMatchEventAction: jest.fn(),
}));

describe("MatchDetailClient component", () => {
  const dummyTeam: Team = {
    id: "team-1",
    name: "INAM HB",
    championship: "Nationale 2",
    players: [],
    matchs: [],
  };

  const dummyEvents: MatchEvent[] = [
    {
      type: "GOAL",
      time: "05:12",
      matchPlayerName: "BELLEC Corentin",
      team: "HOME",
      sector: "WING_L",
    },
    {
      type: "SHOT",
      time: "12:00",
      matchPlayerName: "OPPONENT Player",
      team: "AWAY",
      sector: "CENTER",
    },
  ];

  const dummyMatch: Match = {
    codeRencontre: "M-101",
    homeTeamName: "INAM HB",
    awayTeamName: "CESSON",
    homeScore: { halfScore: 12, finalScore: 26 },
    awayScore: { halfScore: 10, finalScore: 22 },
    isHome: true,
    date: "12/10/2026 20:00",
    homeTeamPlayers: [
      {
        licenseNumber: "LIC1",
        fullName: "BELLEC Corentin",
        tshirtNumber: 7,
        goal: 5,
        sevenMeter: 0,
        shot: 7,
        save: 0,
        avertissement: false,
        twoMinutes: 0,
        redCard: false,
        isCaptain: false,
      },
    ],
    awayTeamPlayers: [],
    events: dummyEvents,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render score, team names, and switch to events tab", () => {
    render(<MatchDetailClient match={dummyMatch} teamId="team-1" team={dummyTeam} />);

    expect(screen.getAllByText("CESSON").length).toBeGreaterThan(0);
    expect(screen.getByText("26")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();

    // Switch to Events tab
    const eventsTab = screen.getByRole("tab", { name: "Faits de jeu" });
    fireEvent.click(eventsTab);

    expect(screen.getByText(/BELLEC Corentin/)).toBeInTheDocument();
    expect(screen.getByText(/OPPONENT Player/)).toBeInTheDocument();
  });

  it("should filter events when selecting HOME or AWAY filters", () => {
    render(<MatchDetailClient match={dummyMatch} teamId="team-1" team={dummyTeam} />);

    // Switch to Events tab
    fireEvent.click(screen.getByRole("tab", { name: "Faits de jeu" }));

    // Click filter for Home team (INAM HB)
    const homeFilterBtns = screen.getAllByRole("button", { name: /inam hb/i });
    fireEvent.click(homeFilterBtns[0]);

    expect(screen.getByText(/BELLEC Corentin/)).toBeInTheDocument();
    expect(screen.queryByText(/OPPONENT Player/)).not.toBeInTheDocument();

    // Click filter for Away team (CESSON)
    const awayFilterBtns = screen.getAllByRole("button", { name: /cesson/i });
    fireEvent.click(awayFilterBtns[0]);

    expect(screen.queryByText(/BELLEC Corentin/)).not.toBeInTheDocument();
    expect(screen.getByText(/OPPONENT Player/)).toBeInTheDocument();
  });

  it("should filter events by action type", () => {
    render(<MatchDetailClient match={dummyMatch} teamId="team-1" team={dummyTeam} />);

    fireEvent.click(screen.getByRole("tab", { name: "Faits de jeu" }));

    // Click action filter for "Tir"
    const shotFilterBtn = screen.getByRole("button", { name: "Tir" });
    fireEvent.click(shotFilterBtn);

    expect(screen.queryByText(/BELLEC Corentin/)).not.toBeInTheDocument();
    expect(screen.getByText(/OPPONENT Player/)).toBeInTheDocument();

    // Unselect action filter
    fireEvent.click(shotFilterBtn);
    expect(screen.getByText(/BELLEC Corentin/)).toBeInTheDocument();
  });

  it("should handle clicking an event to edit, then delete it", async () => {
    (deleteMatchEventAction as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<MatchDetailClient match={dummyMatch} teamId="team-1" team={dummyTeam} />);

    fireEvent.click(screen.getByRole("tab", { name: "Faits de jeu" }));

    // Click first event to open edit dialog
    const eventRow = screen.getByText(/BELLEC Corentin/);
    fireEvent.click(eventRow);

    expect(screen.getByText("Modifier le fait de jeu")).toBeInTheDocument();

    // Click Supprimer
    const deleteButton = screen.getByRole("button", { name: "Supprimer" });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteMatchEventAction).toHaveBeenCalledWith(
        "M-101",
        "team-1",
        "api-e0"
      );
    });
  });

  it("should support match when isHome is false", () => {
    const awayMatch: Match = {
      ...dummyMatch,
      isHome: false,
      homeTeamName: "CESSON",
      awayTeamName: "INAM HB",
    };

    render(<MatchDetailClient match={awayMatch} teamId="team-1" team={dummyTeam} />);
    expect(screen.getAllByText("CESSON").length).toBeGreaterThan(0);
  });
});
