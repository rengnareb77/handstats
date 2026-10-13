package fr.handstat.coreapi.team.service

import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.match.repository.MatchRepository
import fr.handstat.coreapi.player.model.Player
import fr.handstat.coreapi.team.model.Team
import fr.handstat.coreapi.team.repository.TeamRepository
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class TeamService(
    private val teamRepository: TeamRepository,
    private val matchRepository: MatchRepository,
    private val mongoTemplate: MongoTemplate
) {

    fun getTeams(): List<Team> = teamRepository.findAll()

    fun getTeamById(id: String): Team? = teamRepository.findByIdOrNull(id)

    fun createTeam(team: Team): Team = teamRepository.save(team)

    fun getTeamMatches(teamId: String): List<Match> =
        teamRepository.findByIdOrNull(teamId)?.matchs ?: emptyList()

    fun deleteTeamById(id: String): Boolean =
        teamRepository.findByIdOrNull(id)?.let {
            teamRepository.delete(it)
            true
        } ?: false

    fun addMatchToTeamId(teamId: String, match: Match): Team? {
        val team = teamRepository.findByIdOrNull(teamId) ?: return null
        matchRepository.save(match)
        return teamRepository.save(team.copy(matchs = team.matchs + match))
    }

    fun addPlayerToTeam(team: Team, player: Player) {
        mongoTemplate.updateFirst(
            Query(Criteria.where("_id").`is`(team.id)),
            Update().addToSet("players", player.licenseNumber),
            Team::class.java
        )
    }
}
