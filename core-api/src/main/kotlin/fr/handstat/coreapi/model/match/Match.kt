package fr.handstat.coreapi.model.match

import com.fasterxml.jackson.annotation.JsonFormat
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "matchs")
data class Match(
    @Id
    val codeRencontre: String,
    val homeTeamName: String,
    val awayTeamName: String,
    val homeScore: Score,
    val awayScore: Score,
    val isHome: Boolean,
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    val date: LocalDateTime,
    val homeTeamPlayers: List<MatchPlayer>,
    val awayTeamPlayers: List<MatchPlayer>,
    val events: List<MatchEvent>
    )
