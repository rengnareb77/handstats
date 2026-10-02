import io
import pandas as pd
import numpy as np
import pdfplumber
import pymupdf

from app.models.match import Match, Score, MatchPlayer, MatchEvent


def get_score_from_resume(resume: str) -> tuple[Score, Score]:
    """Extrait le score depuis le résumé texte."""
    table = resume.split("\n")
    score1 = Score(halfScore=int(table[4]), finalScore=int(table[9]))
    score2 = Score(halfScore=int(table[5]), finalScore=int(table[10]))
    return score1, score2


def _extract_players_from_df(team_df: pd.DataFrame) -> list[MatchPlayer]:
    """Extrait une liste de joueurs à partir d'un sous-dataframe pandas."""
    players = []

    def safe_int(val):
        if pd.isna(val) or str(val).strip() == "":
            return 0
        return int(float(val))

    for _, row in team_df.iterrows():
        if row.iloc[0] == "Officiel Resp. A":
            break

        # Le nom du joueur est dans la 3ème colonne (index 2)
        full_name = str(row.iloc[2]).strip()

        players.append(MatchPlayer(
            isCaptain=(str(row.iloc[0]).strip().upper() == "X"),
            tshirtNumber=safe_int(row.iloc[1]),
            fullName=full_name,
            licenseNumber=str(row.iloc[3]).strip(),
            goal=safe_int(row.iloc[6]),
            sevenMeter=safe_int(row.iloc[7]),
            shot=safe_int(row.iloc[8]),
            save=safe_int(row.iloc[9]),
            avertissement=(str(row.iloc[10]).strip().upper() == "X"),
            twoMinutes=safe_int(row.iloc[11]),
            redCard=(str(row.iloc[12]).strip().upper() == "X"),
        ))
    return players


def get_info_from_df(df: pd.DataFrame) -> tuple[list[MatchPlayer], list[MatchPlayer]]:
    """Sépare le DataFrame principal et extrait les deux équipes."""
    # Trouve l'index où commence la deuxième équipe
    index_coupure = df.iloc[1:, 0].astype(str).str.contains('Capt', na=False).argmax()

    home_df = df.iloc[1:index_coupure+1]
    away_df = df.iloc[index_coupure+2:]

    return _extract_players_from_df(home_df), _extract_players_from_df(away_df)


def get_team_from_table(header_text: str) -> tuple[str,str, str]:
    """Extrait le nom des deux équipes depuis l'en-tête de la page."""
    lines = header_text.split("\n")
    teams = lines[9].split("/")
    code_rencontre = lines[3]
    return code_rencontre, teams[0].strip(), teams[1].strip()


def get_events_from_text(evenements: str) -> list[MatchEvent]:
    """Extrait et structure les événements de match depuis le texte brut."""
    list_events = evenements.split("\n")

    # Recherche de l'indice de la période 2
    try:
        index_period = list_events.index("PERIODE 2")
    except ValueError:
        index_period = len(list_events)

    first_period = list_events[5:index_period]
    second_period = list_events[index_period+4:] if index_period < len(list_events) else []

    all_events = first_period + second_period
    # Groupement par paquets de 3 (Temps, Score?, Action)
    grouped_events = [all_events[i:i+3] for i in range(0, len(all_events), 3)]

    events = []

    # L'ordre du dictionnaire est important ("But 7m" avant "But")
    action_mapping = {
        "But 7m": "SEVEN_METER",
        "But": "GOAL",
        "Tir": "SHOT",
        "Arrêt": "SAVE",
        "Avertissement": "YELLOW_CARD",
        "Temps mort": "TIMEOUT",
        "Disqualification": "RED_CARD",
        "2MN": "TWO_MINUTE"
    }

    for e in grouped_events:
        if len(e) < 3:
            continue

        time = e[0]
        action = e[2]

        for prefix, event_type in action_mapping.items():
            if action.startswith(prefix):
                name = action.replace(prefix, "", 1).strip()
                events.append(MatchEvent(time=time, type=event_type, matchPlayerName=name))
                break

    return events


def parse_pdf(file) -> Match:
    """Fonction principale pour parser la feuille de match PDF."""
    if hasattr(file, "read"):
        file_bytes = file.read()
    elif isinstance(file, str):
        with open(file, "rb") as f:
            file_bytes = f.read()
    else:
        file_bytes = file
    global first_page_overflow
    first_page_overflow = False
    # 1. Extraction du tableau des joueurs avec pdfplumber sur un flux en mémoire
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        header_index = 9
        first_page = pdf.pages[0].extract_table()
        df = pd.DataFrame(first_page)

        second_page = pdf.pages[1].extract_table()
        t = pd.DataFrame(second_page).iloc[3:]
        first_page_overflow = t[0].array[0] != "Déroulé du match"
        nb_pages = len(pdf.pages)
        if nb_pages == 2 or nb_pages == 3 and not first_page_overflow:
            df = df.iloc[header_index:-3, 3:]
            df = df.drop(columns=[4, 7, 8, 9, 10, 12, 15, 18, 20, 23, 25], errors='ignore')
        else:
            df = df.iloc[header_index:, 2:]
            df = df.drop(columns=[3, 6, 7, 8, 10, 13, 17, 20, 22], errors='ignore')
    df = df.replace("", np.nan).dropna(how='all')
    homePlayers, awayPlayers = get_info_from_df(df)

    # 2. Lecture du texte brut avec PyMuPDF
    with pymupdf.open(stream=file_bytes, filetype="pdf") as doc:
        number_of_pages = len(doc)
        page1_text = doc[0].get_text("text")
        lines = page1_text.splitlines()

        header1 = "\n".join(lines[:12])
        codeRencontre,homeTeamName, awayTeamName = get_team_from_table(header1)

        if number_of_pages == 4 or number_of_pages == 3 and first_page_overflow:
            page2_text = doc[1].get_text("text")
            resume = "\n".join(page2_text.splitlines()[12:])
        else:
            split_index = lines.index("Détail score") if "Détail score" in lines else len(lines)
            resume = "\n".join(lines[split_index:])
        homeScore, awayScore = get_score_from_resume(resume)

        # Capture des evenements:
        page_event = 1 if number_of_pages == 2 or not first_page_overflow else 2
        evenements = doc[page_event].get_text()
        if number_of_pages == 4 or number_of_pages == 3 and not first_page_overflow:
            evenement2 = doc[page_event+1].get_text()
            evenement2 = "\n".join(evenement2.splitlines()[13:])
            evenements = evenements+evenement2

    evenements_lines = evenements.splitlines()
    evenements = "\n".join(evenements_lines[12:])

    events = get_events_from_text(evenements)

    return Match(
        codeRencontre=id_rencontre,
        homeTeamName=homeTeamName,
        awayTeamName=awayTeamName,
        homeTeamPlayers=homePlayers,
        awayTeamPlayers=awayPlayers,
        homeScore=homeScore,
        awayScore=awayScore,
        events=events
    )

if __name__ == "__main__":
    pass
