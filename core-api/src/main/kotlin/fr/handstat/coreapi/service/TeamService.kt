package fr.handstat.coreapi.service

import fr.handstat.coreapi.model.team.Team
import fr.handstat.coreapi.repository.TeamRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class TeamService(val teamRepository: TeamRepository) {

    fun getTeams(): List<Team> {
        return teamRepository.findAll()
    }

    fun getTeamById(id: String): Team? {
        return teamRepository.findByIdOrNull(id)
    }

    fun createTeam(team: Team): Team {
        return teamRepository.save(team)
    }

    fun deleteTeamById(id: String): Boolean {
        return teamRepository.findByIdOrNull(id)?.let {
            teamRepository.delete(it)
            true
        } ?: false
    }


}