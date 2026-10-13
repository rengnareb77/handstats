package fr.handstat.coreapi.match.dto

import com.fasterxml.jackson.annotation.JsonFormat
import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.match.model.MatchEvent
import fr.handstat.coreapi.match.model.MatchPlayer
import fr.handstat.coreapi.match.model.Score
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

data class CreateMatchRequest(
    @field:NotBlank(message = "codeRencontre must not be blank")
    val codeRencontre: String,
    @field:NotBlank(message = "homeTeamName must not be blank")
    val homeTeamName: String,
    @field:NotBlank(message = "awayTeamName must not be blank")
    val awayTeamName: String,
    @field:Valid
    val homeScore: Score,
    @field:Valid
    val awayScore: Score,
    val isHome: Boolean = true,
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    @field:NotNull(message = "date must not be null")
    val date: LocalDateTime,
    val homeTeamPlayers: List<MatchPlayer> = emptyList(),
    val awayTeamPlayers: List<MatchPlayer> = emptyList(),
    val events: List<MatchEvent> = emptyList()
)

data class UpdateMatchEventRequest(
    @field:Valid
    val oldEvent: MatchEvent,
    @field:Valid
    val newEvent: MatchEvent
)

fun CreateMatchRequest.toDomain(): Match = Match(
    codeRencontre = this.codeRencontre,
    homeTeamName = this.homeTeamName,
    awayTeamName = this.awayTeamName,
    homeScore = this.homeScore,
    awayScore = this.awayScore,
    isHome = this.isHome,
    date = this.date,
    homeTeamPlayers = this.homeTeamPlayers,
    awayTeamPlayers = this.awayTeamPlayers,
    events = this.events
)
