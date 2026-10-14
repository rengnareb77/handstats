package fr.handstat.coreapi.team.web

import fr.handstat.coreapi.common.exception.ResourceNotFoundException
import fr.handstat.coreapi.match.dto.MatchResponse
import fr.handstat.coreapi.match.dto.toResponse
import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.team.dto.CreateTeamRequest
import fr.handstat.coreapi.team.dto.TeamResponse
import fr.handstat.coreapi.team.dto.toDomain
import fr.handstat.coreapi.team.dto.toResponse
import fr.handstat.coreapi.team.service.TeamService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/teams")
class TeamController(private val teamService: TeamService) {

    @GetMapping
    fun getAllTeams(): List<TeamResponse> {
        return teamService.getTeams().map { it.toResponse() }
    }

    @GetMapping("/{id}")
    fun getTeamById(@PathVariable id: String): TeamResponse {
        return teamService.getTeamById(id)?.toResponse()
            ?: throw ResourceNotFoundException("Team not found with id: $id")
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createTeam(@Valid @RequestBody request: CreateTeamRequest): TeamResponse {
        return teamService.createTeam(request.toDomain()).toResponse()
    }

    @GetMapping("/{teamId}/matches")
    fun getMatchByTeamId(@PathVariable teamId: String): List<MatchResponse> {
        return teamService.getTeamMatches(teamId).map { it.toResponse() }
    }

    @PostMapping("/{teamId}/matches")
    @ResponseStatus(HttpStatus.CREATED)
    fun addMatchToTeam(
        @PathVariable teamId: String,
        @Valid @RequestBody match: Match
    ): TeamResponse {
        val updatedTeam = teamService.addMatchToTeamId(teamId, match)
            ?: throw ResourceNotFoundException("Team not found with id: $teamId")
        return updatedTeam.toResponse()
    }
}
