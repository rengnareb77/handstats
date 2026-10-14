import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddMatchDialog } from "../add-match-dialog";
import { addMatchAction } from "@/actions/match.actions";

jest.mock("@/actions/match.actions", () => ({
  addMatchAction: jest.fn(),
}));

describe("AddMatchDialog component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show error when submitting without selecting a PDF file in upload tab", async () => {
    render(<AddMatchDialog teamId="team-1" />);

    fireEvent.click(screen.getByRole("button", { name: /ajouter un match/i }));

    expect(screen.getByText("Nouveau match")).toBeInTheDocument();

    // Submit directly without choosing file
    fireEvent.click(screen.getByRole("button", { name: "Ajouter le match" }));

    await waitFor(() => {
      expect(screen.getByText("Veuillez sélectionner un fichier PDF.")).toBeInTheDocument();
    });
  });

  it("should submit file successfully when PDF is uploaded", async () => {
    (addMatchAction as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { codeRencontre: "M-1" },
    });

    render(<AddMatchDialog teamId="team-1" />);

    fireEvent.click(screen.getByRole("button", { name: /ajouter un match/i }));

    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
    const dummyFile = new File(["dummy pdf content"], "feuille.pdf", {
      type: "application/pdf",
    });

    // Fire change event with files on the file input
    fireEvent.change(fileInput, {
      target: { files: [dummyFile] },
    });

    // Toggle to Extérieur
    fireEvent.click(screen.getByRole("button", { name: "Extérieur" }));

    // Submit
    fireEvent.click(screen.getByRole("button", { name: "Ajouter le match" }));

    await waitFor(() => {
      expect(addMatchAction).toHaveBeenCalledWith("team-1", expect.any(FormData), false);
    });
  });

  it("should switch to link tab, validate empty URL, and submit with URL", async () => {
    (addMatchAction as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { codeRencontre: "M-2" },
    });

    render(<AddMatchDialog teamId="team-1" />);

    fireEvent.click(screen.getByRole("button", { name: /ajouter un match/i }));

    // Switch to Link tab
    const linkTab = screen.getByRole("tab", { name: /lien/i });
    fireEvent.click(linkTab);

    // Submit without URL -> validation error
    fireEvent.click(screen.getByRole("button", { name: "Ajouter le match" }));

    await waitFor(() => {
      expect(
        screen.getByText("Veuillez renseigner l'URL de la feuille de match.")
      ).toBeInTheDocument();
    });

    // Enter URL and submit
    const urlInput = screen.getByPlaceholderText("https://exemple.com/feuille-de-match.pdf");
    fireEvent.change(urlInput, {
      target: { value: "https://ffhandball.fr/match.pdf" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Ajouter le match" }));

    await waitFor(() => {
      expect(addMatchAction).toHaveBeenCalledWith("team-1", expect.any(FormData), true);
    });
  });

  it("should display server action error or exception", async () => {
    (addMatchAction as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: "PDF corrompu",
    });

    render(<AddMatchDialog teamId="team-1" />);
    fireEvent.click(screen.getByRole("button", { name: /ajouter un match/i }));

    const linkTab = screen.getByRole("tab", { name: /lien/i });
    fireEvent.click(linkTab);

    const urlInput = screen.getByPlaceholderText("https://exemple.com/feuille-de-match.pdf");
    fireEvent.change(urlInput, {
      target: { value: "https://ffhandball.fr/match.pdf" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Ajouter le match" }));

    await waitFor(() => {
      expect(screen.getByText("PDF corrompu")).toBeInTheDocument();
    });
  });

  it("should display exception message if addMatchAction rejects", async () => {
    (addMatchAction as jest.Mock).mockRejectedValueOnce(new Error("Serveur indisponible"));

    render(<AddMatchDialog teamId="team-1" />);
    fireEvent.click(screen.getByRole("button", { name: /ajouter un match/i }));

    const linkTab = screen.getByRole("tab", { name: /lien/i });
    fireEvent.click(linkTab);

    const urlInput = screen.getByPlaceholderText("https://exemple.com/feuille-de-match.pdf");
    fireEvent.change(urlInput, {
      target: { value: "https://ffhandball.fr/match.pdf" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Ajouter le match" }));

    await waitFor(() => {
      expect(screen.getByText("Serveur indisponible")).toBeInTheDocument();
    });
  });
});
