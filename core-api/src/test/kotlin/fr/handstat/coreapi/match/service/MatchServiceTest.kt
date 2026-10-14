package fr.handstat.coreapi.match.service

import fr.handstat.coreapi.common.exception.ResourceNotFoundException
import fr.handstat.coreapi.match.model.EventTeam
import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.match.model.MatchEvent
import fr.handstat.coreapi.match.model.Score
import fr.handstat.coreapi.match.model.Type
import fr.handstat.coreapi.match.repository.MatchRepository
import fr.handstat.coreapi.player.service.PlayerService
import fr.handstat.coreapi.team.service.TeamService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import java.time.LocalDateTime
import java.util.Optional

class MatchServiceTest {

    private val matchRepository: MatchRepository = mock(MatchRepository::class.java)
    private val playerService: PlayerService = mock(PlayerService::class.java)
    private val teamService: TeamService = mock(TeamService::class.java)
    private val matchService = MatchService(matchRepository, playerService, teamService)

    private val testMatch = Match(
        codeRencontre = "M-101",
        homeTeamName = "Equipe A",
        awayTeamName = "Equipe B",
        homeScore = Score(10, 25),
        awayScore = Score(12, 24),
        isHome = true,
        date = LocalDateTime.of(2026, 9, 19, 17, 30),
        events = listOf(
            MatchEvent(
                id = "evt-1",
                type = Type.GOAL,
                time = "10:00",
                matchPlayerName = "Joueur 1",
                team = EventTeam.HOME
            )
        )
    )

    @Test
    fun `addEvent should append event to match and save`() {
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))
        `when`(matchRepository.save(org.mockito.ArgumentMatchers.any(Match::class.java)))
            .thenAnswer { it.arguments[0] as Match }

        val newEvent = MatchEvent(
            id = "evt-2",
            type = Type.SHOT,
            time = "11:00",
            matchPlayerName = "Joueur 2",
            team = EventTeam.AWAY
        )

        val updated = matchService.addEvent(newEvent, "M-101")

        assertEquals(2, updated.events.size)
        assertEquals("evt-2", updated.events[1].id)
        verify(matchRepository).save(updated)
    }

    @Test
    fun `updateEvent should update matched event and save`() {
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))
        `when`(matchRepository.save(org.mockito.ArgumentMatchers.any(Match::class.java)))
            .thenAnswer { it.arguments[0] as Match }

        val oldEvent = testMatch.events[0]
        val newEvent = oldEvent.copy(type = Type.SEVEN_METER)

        val updated = matchService.updateEvent(oldEvent, newEvent, "M-101")

        assertEquals(1, updated.events.size)
        assertEquals(Type.SEVEN_METER, updated.events[0].type)
        verify(matchRepository).save(updated)
    }

    @Test
    fun `updateEvent should throw ResourceNotFoundException when event not found`() {
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))

        val unknownEvent = MatchEvent(
            id = "evt-unknown",
            type = Type.YELLOW_CARD,
            time = "50:00",
            matchPlayerName = "Ghost",
            team = EventTeam.AWAY
        )

        assertThrows(ResourceNotFoundException::class.java) {
            matchService.updateEvent(unknownEvent, unknownEvent, "M-101")
        }
    }

    @Test
    fun `deleteEvent should remove event and save`() {
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))
        `when`(matchRepository.save(org.mockito.ArgumentMatchers.any(Match::class.java)))
            .thenAnswer { it.arguments[0] as Match }

        val updated = matchService.deleteEvent("M-101", "evt-1")

        assertEquals(0, updated.events.size)
        verify(matchRepository).save(updated)
    }

    @Test
    fun `deleteEvent should throw ResourceNotFoundException when event not found`() {
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))

        assertThrows(ResourceNotFoundException::class.java) {
            matchService.deleteEvent("M-101", "evt-unknown")
        }
    }

    @Test
    fun `getMatches should return all matches`() {
        `when`(matchRepository.findAll()).thenReturn(listOf(testMatch))

        val result = matchService.getMatches()

        assertEquals(1, result.size)
        assertEquals("M-101", result[0].codeRencontre)
    }

    @Test
    fun `getMatchById should return match when exists and null when not found`() {
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))
        `when`(matchRepository.findById("unknown")).thenReturn(Optional.empty())

        assertEquals("M-101", matchService.getMatchById("M-101")?.codeRencontre)
        org.junit.jupiter.api.Assertions.assertNull(matchService.getMatchById("unknown"))
    }

    @Test
    fun `createMatch should save and return match`() {
        `when`(matchRepository.save(testMatch)).thenReturn(testMatch)

        val result = matchService.createMatch(testMatch)

        assertEquals("M-101", result.codeRencontre)
        verify(matchRepository).save(testMatch)
    }

    @Test
    fun `addMatchPlayer should throw when match not found`() {
        `when`(matchRepository.findById("unknown")).thenReturn(Optional.empty())

        val player = fr.handstat.coreapi.match.model.MatchPlayer(
            isCaptain = false,
            tshirtNumber = 7,
            fullName = "Player 7",
            licenseNumber = "lic-7",
            goal = 2,
            sevenMeter = 0,
            shot = 3,
            save = 0,
            avertissement = false,
            twoMinutes = 0,
            redCard = false
        )

        assertThrows(ResourceNotFoundException::class.java) {
            matchService.addMatchPlayer(player, "team-1", "unknown")
        }
    }

    @Test
    fun `addMatchPlayer should throw when team not found`() {
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))
        `when`(teamService.getTeamById("unknown")).thenReturn(null)

        val player = fr.handstat.coreapi.match.model.MatchPlayer(
            isCaptain = false,
            tshirtNumber = 7,
            fullName = "Player 7",
            licenseNumber = "lic-7",
            goal = 2,
            sevenMeter = 0,
            shot = 3,
            save = 0,
            avertissement = false,
            twoMinutes = 0,
            redCard = false
        )

        assertThrows(ResourceNotFoundException::class.java) {
            matchService.addMatchPlayer(player, "unknown", "M-101")
        }
    }

    @Test
    fun `addMatchPlayer should create new player when player does not exist`() {
        val dummyTeam = fr.handstat.coreapi.team.model.Team(id = "team-1", name = "Team A", championship = "N2")
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))
        `when`(teamService.getTeamById("team-1")).thenReturn(dummyTeam)
        `when`(playerService.getPlayerById("lic-new")).thenReturn(null)

        val matchPlayer = fr.handstat.coreapi.match.model.MatchPlayer(
            isCaptain = true,
            tshirtNumber = 10,
            fullName = "New Player",
            licenseNumber = "lic-new",
            goal = 5,
            sevenMeter = 1,
            shot = 7,
            save = 0,
            avertissement = true,
            twoMinutes = 1,
            redCard = true
        )

        val dummyCreatedPlayer = fr.handstat.coreapi.player.model.Player(licenseNumber = "lic-new", fullName = "New Player", stats = fr.handstat.coreapi.player.model.PlayerStats(), teamId = "team-1")
        val dummyStats = fr.handstat.coreapi.player.model.PlayerStats()

        matchService.addMatchPlayer(matchPlayer, "team-1", "M-101")

        verify(playerService).createPlayer(fr.handstat.coreapi.testutil.any(dummyCreatedPlayer))
        verify(playerService).appendStats(fr.handstat.coreapi.testutil.eq("lic-new"), fr.handstat.coreapi.testutil.any(dummyStats))
        verify(teamService).addPlayerToTeam(fr.handstat.coreapi.testutil.eq(dummyTeam), fr.handstat.coreapi.testutil.any(dummyCreatedPlayer))
    }

    @Test
    fun `addMatchPlayer should update existing player when player exists`() {
        val dummyTeam = fr.handstat.coreapi.team.model.Team(id = "team-1", name = "Team A", championship = "N2")
        val existingPlayer = fr.handstat.coreapi.player.model.Player(
            licenseNumber = "lic-exist",
            fullName = "Existing Player",
            stats = fr.handstat.coreapi.player.model.PlayerStats(),
            matchs = emptyList(),
            teamId = "team-1"
        )
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))
        `when`(teamService.getTeamById("team-1")).thenReturn(dummyTeam)
        `when`(playerService.getPlayerById("lic-exist")).thenReturn(existingPlayer)

        val matchPlayer = fr.handstat.coreapi.match.model.MatchPlayer(
            isCaptain = false,
            tshirtNumber = 11,
            fullName = "Existing Player",
            licenseNumber = "lic-exist",
            goal = 3,
            sevenMeter = 0,
            shot = 4,
            save = 0,
            avertissement = false,
            twoMinutes = 0,
            redCard = false
        )
        val dummyStats = fr.handstat.coreapi.player.model.PlayerStats()

        matchService.addMatchPlayer(matchPlayer, "team-1", "M-101")

        verify(playerService).createPlayer(fr.handstat.coreapi.testutil.any(existingPlayer))
        verify(playerService).appendStats(fr.handstat.coreapi.testutil.eq("lic-exist"), fr.handstat.coreapi.testutil.any(dummyStats))
        verify(teamService).addPlayerToTeam(fr.handstat.coreapi.testutil.eq(dummyTeam), fr.handstat.coreapi.testutil.any(existingPlayer))
    }

    @Test
    fun `addAllMatchPlayers should call addMatchPlayer for all elements`() {
        val dummyTeam = fr.handstat.coreapi.team.model.Team(id = "team-1", name = "Team A", championship = "N2")
        `when`(matchRepository.findById("M-101")).thenReturn(Optional.of(testMatch))
        `when`(teamService.getTeamById("team-1")).thenReturn(dummyTeam)
        `when`(playerService.getPlayerById("lic-1")).thenReturn(null)

        val matchPlayer = fr.handstat.coreapi.match.model.MatchPlayer(
            isCaptain = false,
            tshirtNumber = 1,
            fullName = "P1",
            licenseNumber = "lic-1",
            goal = 1,
            sevenMeter = 0,
            shot = 1,
            save = 0,
            avertissement = false,
            twoMinutes = 0,
            redCard = false
        )
        val dummyPlayer = fr.handstat.coreapi.player.model.Player(licenseNumber = "lic-1", fullName = "P1", stats = fr.handstat.coreapi.player.model.PlayerStats(), teamId = "team-1")

        matchService.addAllMatchPlayers(listOf(matchPlayer), "team-1", "M-101")

        verify(playerService).createPlayer(fr.handstat.coreapi.testutil.any(dummyPlayer))
    }

    @Test
    fun `addEvent, updateEvent and deleteEvent should throw ResourceNotFoundException when match not found`() {
        `when`(matchRepository.findById("unknown")).thenReturn(Optional.empty())

        val event = testMatch.events[0]

        assertThrows(ResourceNotFoundException::class.java) {
            matchService.addEvent(event, "unknown")
        }
        assertThrows(ResourceNotFoundException::class.java) {
            matchService.updateEvent(event, event, "unknown")
        }
        assertThrows(ResourceNotFoundException::class.java) {
            matchService.deleteEvent("unknown", "evt-1")
        }
    }
}
