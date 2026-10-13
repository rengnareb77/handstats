package fr.handstat.coreapi.match.model

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "matches")
data class Match(
    @Id
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
