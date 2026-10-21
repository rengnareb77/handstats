package fr.handstat.coreapi.match.service

import fr.handstat.coreapi.common.exception.ResourceNotFoundException
import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.match.model.MatchEvent
import fr.handstat.coreapi.match.model.MatchPlayer
import fr.handstat.coreapi.match.repository.MatchRepository
import fr.handstat.coreapi.player.model.Player
import fr.handstat.coreapi.player.model.PlayerStats
import fr.handstat.coreapi.player.service.PlayerService
import fr.handstat.coreapi.team.service.TeamService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class MatchService(
    private val matchRepository: MatchRepository,
    private val playerService: PlayerService,
    private val teamService: TeamService
) {

    fun getMatches(): List<Match> = matchRepository.findAll()

    fun getMatchById(id: String): Match? = matchRepository.findByIdOrNull(id)

    fun createMatch(match: Match): Match = matchRepository.save(match)

    fun addMatchPlayer(matchPlayer: MatchPlayer, teamId: String, matchId: String) {
        val license = matchPlayer.licenseNumber
        var player = playerService.getPlayerById(license)
        val match = getMatchById(matchId) ?: throw ResourceNotFoundException("Match not found with id: $matchId")
        val team = teamService.getTeamById(teamId) ?: throw ResourceNotFoundException("Team not found with id: $teamId")

        if (player == null) {
            val matchList = ArrayList<Match>()
            matchList.add(match)
            player = Player(
                licenseNumber = matchPlayer.licenseNumber,
                fullName = matchPlayer.fullName,
                stats = PlayerStats(),
                matchs = matchList,
                teamId = teamId
            )
            playerService.createPlayer(player)
        } else {
            player = player.copy(matchs = player.matchs + match)
            playerService.createPlayer(player)
        }

        val stats = PlayerStats(
            goal = matchPlayer.goal,
            sevenMeter = matchPlayer.sevenMeter,
            shot = matchPlayer.shot,
            save = matchPlayer.save,
            avertissements = if (matchPlayer.avertissement) 1 else 0,
            twoMinutes = matchPlayer.twoMinutes,
            redCard = if (matchPlayer.redCard) 1 else 0
        )
        // Atomic update of player stats
        playerService.appendStats(license, stats)
        teamService.addPlayerToTeam(team, player)
    }

    fun addEvent(newEvent: MatchEvent, matchId: String): Match {
        val match = getMatchById(matchId) ?: throw ResourceNotFoundException("Match not found with id: $matchId")
        val newEvents = match.events.toMutableList().apply { add(newEvent) }
        return matchRepository.save(match.copy(events = newEvents))
    }

    fun updateEvent(oldEvent: MatchEvent, newEvent: MatchEvent, matchId: String): Match {
        val match = getMatchById(matchId) ?: throw ResourceNotFoundException("Match not found with id: $matchId")
        val oldEventIndex = match.events.indexOfFirst {
            (it.id == oldEvent.id && it.id.isNotBlank()) ||
            (it.time == oldEvent.time && it.matchPlayerName == oldEvent.matchPlayerName && it.type == oldEvent.type)
        }
        if (oldEventIndex == -1) {
            throw ResourceNotFoundException("Event not found in match with id: $matchId")
        }

        val newEvents = match.events.toMutableList().apply { set(oldEventIndex, newEvent) }
        return matchRepository.save(match.copy(events = newEvents))
    }

    fun deleteEvent(matchId: String, eventId: String): Match {
        val match = getMatchById(matchId) ?: throw ResourceNotFoundException("Match not found with id: $matchId")
        val newEvents = match.events.filterNot { it.id == eventId }
        if (newEvents.size == match.events.size) {
            throw ResourceNotFoundException("Event not found with id: $eventId in match: $matchId")
        }
        return matchRepository.save(match.copy(events = newEvents))
    }

    fun addAllMatchPlayers(matchPlayers: List<MatchPlayer>, teamId: String, matchId: String) {
        matchPlayers.forEach { addMatchPlayer(it, teamId, matchId) }
    }
}
