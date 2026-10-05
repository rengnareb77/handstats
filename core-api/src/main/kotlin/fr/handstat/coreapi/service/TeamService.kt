package fr.handstat.coreapi.service

import fr.handstat.coreapi.model.match.Match
import fr.handstat.coreapi.model.player.Player
import fr.handstat.coreapi.model.team.Team
import fr.handstat.coreapi.repository.MatchRepository
import fr.handstat.coreapi.repository.TeamRepository
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class TeamService(
    val teamRepository: TeamRepository,
    val matchRepository: MatchRepository,
    val mongoTemplate: MongoTemplate
) {

    fun getTeams(): List<Team> {
        return teamRepository.findAll()
    }

    fun getTeamById(id: String): Team? {
        return teamRepository.findByIdOrNull(id)
    }

    fun createTeam(team: Team): Team {
        return teamRepository.save(team)
    }

    fun getTeamMatches(teamId: String): List<Match> {
        return teamRepository.findByIdOrNull(teamId)?.matchs ?: emptyList()
    }

    fun deleteTeamById(id: String): Boolean {
        return teamRepository.findByIdOrNull(id)?.let {
            teamRepository.delete(it)
            true
        } ?: false
    }

    /**
     * Adds a match to the team's list of matches based on the given team ID.
     *
     * @param teamId The unique identifier of the team to which the match should be added.
     * @param match The match to be added to the team's list of matches.
     * @return The updated team object if the operation is successful,
     *         or null if the team is not found.
     */
    fun addMatchToTeamId(teamId: String, match: Match): Team? {
        val team = teamRepository.findByIdOrNull(teamId) ?: return null
        matchRepository.save(match)
        return teamRepository.save(team.copy(matchs = team.matchs + match))
    }

    /**
     * Atomically adds the player's reference to the team ($addToSet), so concurrent calls
     * don't overwrite each other and the same player is never added twice.
     */
    fun addPlayerToTeam(team: Team, player: Player) {
        mongoTemplate.updateFirst(
            Query(Criteria.where("_id").`is`(team.id)),
            Update().addToSet("players", player.licenseNumber),
            Team::class.java
        )
    }


}