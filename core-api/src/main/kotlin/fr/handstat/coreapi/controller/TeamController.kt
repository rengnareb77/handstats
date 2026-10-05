package fr.handstat.coreapi.controller

import fr.handstat.coreapi.model.match.Match
import fr.handstat.coreapi.model.player.Player
import fr.handstat.coreapi.model.team.Team
import fr.handstat.coreapi.service.TeamService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/team")
class TeamController(val teamService: TeamService) {

    @GetMapping
    fun getAllTeams(): List<Team> {
        return teamService.getTeams()
    }

    @GetMapping("/{id}")
    fun getTeamById(@PathVariable id: String): Team? {
        return teamService.getTeamById(id)
    }

    @PostMapping
    fun createTeam(@RequestBody team: Team): Team {
        return teamService.createTeam(team)
    }

    @GetMapping("/{teamId}/match")
    fun getMatchByTeamId(@PathVariable teamId: String): List<Match> {
        return teamService.getTeamMatches(teamId)
    }

    @PostMapping("/{teamId}/match")
    fun addMatchToTeam(@PathVariable teamId: String, @RequestBody match: Match): Team? {
        val team = teamService.addMatchToTeamId(teamId, match) ?: throw ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "team not found"
        )
        return team
    }


}