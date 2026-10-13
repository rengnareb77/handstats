package fr.handstat.coreapi.team.dto

import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.player.dto.PlayerResponse
import fr.handstat.coreapi.player.dto.toResponse
import fr.handstat.coreapi.team.model.Team
import jakarta.validation.constraints.NotBlank

data class CreateTeamRequest(
    @field:NotBlank(message = "Team name must not be blank")
    val name: String,
    @field:NotBlank(message = "Championship must not be blank")
    val championship: String
)

data class TeamResponse(
    val id: String?,
    val name: String,
    val championship: String,
    val players: List<PlayerResponse> = emptyList(),
    val matchs: List<Match> = emptyList()
)

fun Team.toResponse(): TeamResponse = TeamResponse(
    id = this.id,
    name = this.name,
    championship = this.championship,
    players = this.players.map { it.toResponse() },
    matchs = this.matchs
)

fun CreateTeamRequest.toDomain(): Team = Team(
    id = null,
    name = this.name,
    championship = this.championship,
    players = emptyList(),
    matchs = emptyList()
)
