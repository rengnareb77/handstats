import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

describe("Tabs with urlParam", () => {
  const originalReplaceState = window.history.replaceState;
  let mockReplaceState: jest.Mock;

  beforeEach(() => {
    mockReplaceState = jest.fn();
    window.history.replaceState = mockReplaceState;
  });

  afterEach(() => {
    window.history.replaceState = originalReplaceState;
  });

  it("should switch tabs and update history replaceState when urlParam is provided", () => {
    render(
      <Tabs defaultValue="stats" urlParam="tab">
        <TabsList>
          <TabsTrigger value="stats">Statistique</TabsTrigger>
          <TabsTrigger value="matchs">Match</TabsTrigger>
          <TabsTrigger value="joueurs">Joueurs</TabsTrigger>
        </TabsList>
        <TabsContent value="stats">Contenu Stats</TabsContent>
        <TabsContent value="matchs">Contenu Matchs</TabsContent>
        <TabsContent value="joueurs">Contenu Joueurs</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Contenu Stats")).toBeInTheDocument();

    // Click Matchs tab
    fireEvent.click(screen.getByRole("tab", { name: "Match" }));

    expect(screen.getByText("Contenu Matchs")).toBeInTheDocument();
    expect(mockReplaceState).toHaveBeenCalledWith(
      null,
      "",
      expect.stringContaining("tab=matchs")
    );

    // Click back to default tab -> removes param
    fireEvent.click(screen.getByRole("tab", { name: "Statistique" }));
    expect(screen.getByText("Contenu Stats")).toBeInTheDocument();
  });

  it("should respond to popstate event (browser back/forward button)", () => {
    render(
      <Tabs defaultValue="stats" urlParam="tab">
        <TabsList>
          <TabsTrigger value="stats">Statistique</TabsTrigger>
          <TabsTrigger value="matchs">Match</TabsTrigger>
        </TabsList>
        <TabsContent value="stats">Contenu Stats</TabsContent>
        <TabsContent value="matchs">Contenu Matchs</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Contenu Stats")).toBeInTheDocument();

    // Simulate browser back button setting search to ?tab=matchs
    originalReplaceState.call(window.history, null, "", "/equipe/1?tab=matchs");

    fireEvent(window, new PopStateEvent("popstate"));

    expect(screen.getByText("Contenu Matchs")).toBeInTheDocument();
  });
});
