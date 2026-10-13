package fr.handstat.coreapi.player.dto

import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.player.model.Player
import fr.handstat.coreapi.player.model.PlayerStats
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank

data class CreatePlayerRequest(
    val licenseNumber: String? = null,
    @field:NotBlank(message = "fullName must not be blank")
    val fullName: String,
    @field:NotBlank(message = "teamId must not be blank")
    val teamId: String,
    @field:Valid
    val stats: PlayerStats = PlayerStats()
)

data class PlayerResponse(
    val licenseNumber: String?,
    val fullName: String,
    val stats: PlayerStats,
    val matchs: List<Match> = emptyList(),
    val teamId: String
)

fun Player.toResponse(): PlayerResponse = PlayerResponse(
    licenseNumber = this.licenseNumber,
    fullName = this.fullName,
    stats = this.stats,
    matchs = this.matchs,
    teamId = this.teamId
)

fun CreatePlayerRequest.toDomain(): Player = Player(
    licenseNumber = this.licenseNumber,
    fullName = this.fullName,
    stats = this.stats,
    matchs = emptyList(),
    teamId = this.teamId
)
