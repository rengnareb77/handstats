import { render, screen, fireEvent } from "@testing-library/react";
import { EditableTeamInfo } from "../editable-team-info";

describe("EditableTeamInfo component", () => {
  it("should render initial team name and championship", () => {
    render(
      <EditableTeamInfo
        initialName="INAM SG"
        initialChampionship="Nationale 2"
        teamId="team-1"
      />
    );

    expect(screen.getByText("INAM SG")).toBeInTheDocument();
    expect(screen.getByText("Nationale 2")).toBeInTheDocument();
  });

  it("should display placeholder when initialChampionship is empty", () => {
    render(
      <EditableTeamInfo
        initialName="INAM SG"
        initialChampionship=""
        teamId="team-1"
      />
    );

    expect(screen.getByText("Ajouter un championnat")).toBeInTheDocument();
  });

  it("should toggle into edit mode on click, allow typing, and cancel", () => {
    render(
      <EditableTeamInfo
        initialName="INAM SG"
        initialChampionship="Nationale 2"
        teamId="team-1"
      />
    );

    // Click to start editing
    fireEvent.click(screen.getByTitle("Modifier les infos de l'équipe"));

    const nameInput = screen.getByPlaceholderText("Nom de l'équipe");
    const champInput = screen.getByPlaceholderText("Championnat...");

    expect(nameInput).toHaveValue("INAM SG");
    expect(champInput).toHaveValue("Nationale 2");

    // Type modifications
    fireEvent.change(nameInput, { target: { value: "NOUVEAU NOM" } });
    fireEvent.change(champInput, { target: { value: "Nationale 1" } });

    expect(nameInput).toHaveValue("NOUVEAU NOM");
    expect(champInput).toHaveValue("Nationale 1");

    // Click Annuler
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    // Should return to non-editing view
    expect(screen.getByText("NOUVEAU NOM")).toBeInTheDocument();
  });

  it("should handle Save click and stopPropagation in edit mode", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(
      <EditableTeamInfo
        initialName="INAM SG"
        initialChampionship="Nationale 2"
        teamId="team-1"
      />
    );

    fireEvent.click(screen.getByTitle("Modifier les infos de l'équipe"));

    // Click inside form container to test stopPropagation
    const nameInput = screen.getByPlaceholderText("Nom de l'équipe");
    fireEvent.click(nameInput);

    // Click Sauver
    fireEvent.click(screen.getByRole("button", { name: "Sauver" }));

    expect(consoleSpy).toHaveBeenCalledWith("TODO: Update team API", {
      teamId: "team-1",
      name: "INAM SG",
      champ: "Nationale 2",
    });

    expect(screen.getByText("INAM SG")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
