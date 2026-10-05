package fr.handstat.coreapi.service

import fr.handstat.coreapi.model.match.Match
import fr.handstat.coreapi.model.match.MatchEvent
import fr.handstat.coreapi.model.match.MatchPlayer
import fr.handstat.coreapi.model.player.Player
import fr.handstat.coreapi.model.player.PlayerStats
import fr.handstat.coreapi.repository.MatchRepository
import fr.handstat.coreapi.repository.TeamRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class MatchService(
    private val matchRepository: MatchRepository,
    private val playerService: PlayerService,
    private val teamService: TeamService
) {

    fun getMatches(): List<Match> {
        return matchRepository.findAll()
    }

    fun getMatchById(id: String): Match? {
        return matchRepository.findByIdOrNull(id)
    }

    fun createMatch(match: Match): Match {
        return matchRepository.save(match)
    }

    fun addMatchPlayer(matchPlayer: MatchPlayer,teamId: String,matchId: String) {
        val license = matchPlayer.licenseNumber
        var player = playerService.getPlayerById(license)
        val match = getMatchById(matchId) ?: throw IllegalArgumentException("Match not found")
        val team = teamService.getTeamById(teamId) ?: throw IllegalArgumentException("Team not found")

        if (player == null) {
            val matchList = ArrayList<Match>()
            matchList.add(match)
            player = Player(matchPlayer.licenseNumber,matchPlayer.fullName, PlayerStats(), matchList, teamId)
            playerService.createPlayer(player)
        } else {
            player = player.copy(
                matchs = player.matchs.plus(match)
            )
        }
        val stats = PlayerStats(
            matchPlayer.goal,
            matchPlayer.sevenMeter,
            matchPlayer.shot,
            matchPlayer.save,
            if (matchPlayer.avertissement) 1 else 0,
            matchPlayer.twoMinutes,
            if(matchPlayer.redCard) 1 else 0
        )
        playerService.appendStats(player, stats)
        teamService.addPlayerToTeam(team, player)
    }

    fun addEvent(newEvent: MatchEvent, matchId: String): Match {
        val match = getMatchById(matchId) ?: throw IllegalArgumentException("Match not found")
        val newEvents = match.events.toMutableList().apply { add(newEvent) }
        return matchRepository.save(match.copy(events = newEvents))
    }

    fun updateEvent(oldEvent: MatchEvent, newEvent: MatchEvent, matchId: String): Match {
        val match = getMatchById(matchId) ?: throw IllegalArgumentException("Match not found")
        val oldEventIndex = match.events.indexOf(oldEvent)
        require(oldEventIndex != -1) { "Event not found" }

        val newEvents = match.events.toMutableList().apply { set(oldEventIndex, newEvent) }
        return matchRepository.save(match.copy(events = newEvents))
    }


}