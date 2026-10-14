package fr.handstat.coreapi.dto

import fr.handstat.coreapi.match.dto.CreateMatchRequest
import fr.handstat.coreapi.match.dto.UpdateMatchEventRequest
import fr.handstat.coreapi.match.dto.toDomain
import fr.handstat.coreapi.match.dto.toResponse
import fr.handstat.coreapi.match.model.EventTeam
import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.match.model.MatchEvent
import fr.handstat.coreapi.match.model.MatchPlayer
import fr.handstat.coreapi.match.model.Score
import fr.handstat.coreapi.match.model.Sector
import fr.handstat.coreapi.match.model.Type
import fr.handstat.coreapi.player.dto.CreatePlayerRequest
import fr.handstat.coreapi.player.dto.toDomain
import fr.handstat.coreapi.player.dto.toResponse
import fr.handstat.coreapi.player.model.Player
import fr.handstat.coreapi.player.model.PlayerStats
import fr.handstat.coreapi.team.dto.CreateTeamRequest
import fr.handstat.coreapi.team.dto.toDomain
import fr.handstat.coreapi.team.dto.toResponse
import fr.handstat.coreapi.team.model.Team
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

class DtoMappingTest {

    @Test
    fun `CreateMatchRequest toDomain and Match toResponse mapping`() {
        val date = LocalDateTime.of(2026, 10, 14, 18, 0)
        val score = Score(10, 25)
        val event = MatchEvent(
            type = Type.GOAL,
            time = "05:00",
            matchPlayerName = "Joueur 1",
            team = EventTeam.HOME,
            sector = Sector.WING_L,
            goalType = "1c1"
        )
        val matchPlayer = MatchPlayer(
            isCaptain = true,
            tshirtNumber = 9,
            fullName = "Joueur 1",
            licenseNumber = "lic-1",
            goal = 4,
            sevenMeter = 1,
            shot = 5,
            save = 0,
            avertissement = true,
            twoMinutes = 0,
            redCard = false
        )

        val request = CreateMatchRequest(
            codeRencontre = "M-999",
            homeTeamName = "Home",
            awayTeamName = "Away",
            homeScore = score,
            awayScore = score,
            isHome = true,
            date = date,
            homeTeamPlayers = listOf(matchPlayer),
            awayTeamPlayers = emptyList(),
            events = listOf(event)
        )

        val domain = request.toDomain()
        assertEquals("M-999", domain.codeRencontre)
        assertEquals("Home", domain.homeTeamName)
        assertEquals("Away", domain.awayTeamName)
        assertEquals(1, domain.homeTeamPlayers.size)
        assertEquals(1, domain.events.size)
        assertNotNull(event.id)

        val response = domain.toResponse()
        assertEquals("M-999", response.codeRencontre)
        assertEquals("Home", response.homeTeamName)
        assertEquals(1, response.homeTeamPlayers.size)
        assertEquals(1, response.events.size)

        val updateRequest = UpdateMatchEventRequest(oldEvent = event, newEvent = event)
        assertEquals(event, updateRequest.oldEvent)
        assertEquals(event, updateRequest.newEvent)
    }

    @Test
    fun `CreateTeamRequest toDomain and Team toResponse mapping`() {
        val request = CreateTeamRequest(
            name = "Paris SG",
            championship = "StarLigue"
        )

        val domain = request.toDomain()
        assertNull(domain.id)
        assertEquals("Paris SG", domain.name)
        assertEquals("StarLigue", domain.championship)
        assertTrue(domain.players.isEmpty())
        assertTrue(domain.matchs.isEmpty())

        val savedTeam = domain.copy(id = "team-1")
        val response = savedTeam.toResponse()
        assertEquals("team-1", response.id)
        assertEquals("Paris SG", response.name)
        assertEquals("StarLigue", response.championship)
    }

    @Test
    fun `CreatePlayerRequest toDomain and Player toResponse mapping`() {
        val stats = PlayerStats(
            goal = 3,
            sevenMeter = 1,
            shot = 4,
            save = 2,
            avertissements = 1,
            twoMinutes = 1,
            redCard = 0
        )
        // Check avertissement alias getter
        assertEquals(1, stats.avertissement)

        val request = CreatePlayerRequest(
            licenseNumber = "lic-123",
            fullName = "Elohim Prandi",
            teamId = "team-1",
            stats = stats
        )

        val domain = request.toDomain()
        assertEquals("lic-123", domain.licenseNumber)
        assertEquals("Elohim Prandi", domain.fullName)
        assertEquals("team-1", domain.teamId)
        assertEquals(3, domain.stats.goal)

        val response = domain.toResponse()
        assertEquals("lic-123", response.licenseNumber)
        assertEquals("Elohim Prandi", response.fullName)
        assertEquals("team-1", response.teamId)
    }
}
