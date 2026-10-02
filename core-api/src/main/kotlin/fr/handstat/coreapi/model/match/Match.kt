package fr.handstat.coreapi.model.match

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "matchs")
data class Match(
    @Id
    val codeRencontre: String,
    val homeTeamName: String,
    val awayTeamName: String,
    val homeScore: Score,
    val awayScore: Score,
    val homeTeamPlayers: List<MatchPlayer>,
    val awayTeamPlayers: List<MatchPlayer>,
    val events: List<MatchEvent>
    )
