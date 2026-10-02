package fr.handstat.coreapi.controller

import fr.handstat.coreapi.model.team.Team
import fr.handstat.coreapi.service.TeamService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

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





}