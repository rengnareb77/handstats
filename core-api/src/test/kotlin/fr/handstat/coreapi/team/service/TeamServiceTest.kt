package fr.handstat.coreapi.team.service

import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.match.model.Score
import fr.handstat.coreapi.match.repository.MatchRepository
import fr.handstat.coreapi.player.model.Player
import fr.handstat.coreapi.player.model.PlayerStats
import fr.handstat.coreapi.team.model.Team
import fr.handstat.coreapi.team.repository.TeamRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import java.time.LocalDateTime
import java.util.Optional

class TeamServiceTest {

    private val teamRepository: TeamRepository = mock(TeamRepository::class.java)
    private val matchRepository: MatchRepository = mock(MatchRepository::class.java)
    private val mongoTemplate: MongoTemplate = mock(MongoTemplate::class.java)
    private val teamService = TeamService(teamRepository, matchRepository, mongoTemplate)

    private val dummyMatch = Match(
        codeRencontre = "M-1",
        homeTeamName = "Team A",
        awayTeamName = "Team B",
        homeScore = Score(10, 20),
        awayScore = Score(9, 18),
        date = LocalDateTime.of(2026, 1, 1, 10, 0)
    )

    private val dummyTeam = Team(
        id = "team-1",
        name = "Team 1",
        championship = "N2",
        players = emptyList(),
        matchs = listOf(dummyMatch)
    )

    @Test
    fun `getTeams should return all teams`() {
        `when`(teamRepository.findAll()).thenReturn(listOf(dummyTeam))

        val result = teamService.getTeams()

        assertEquals(1, result.size)
        assertEquals("Team 1", result[0].name)
        verify(teamRepository).findAll()
    }

    @Test
    fun `getTeamById should return team when found`() {
        `when`(teamRepository.findById("team-1")).thenReturn(Optional.of(dummyTeam))

        val result = teamService.getTeamById("team-1")

        assertNotNull(result)
        assertEquals("team-1", result?.id)
    }

    @Test
    fun `getTeamById should return null when not found`() {
        `when`(teamRepository.findById("unknown")).thenReturn(Optional.empty())

        val result = teamService.getTeamById("unknown")

        assertNull(result)
    }

    @Test
    fun `createTeam should save and return team`() {
        `when`(teamRepository.save(dummyTeam)).thenReturn(dummyTeam)

        val result = teamService.createTeam(dummyTeam)

        assertEquals("team-1", result.id)
        verify(teamRepository).save(dummyTeam)
    }

    @Test
    fun `getTeamMatches should return matches when team exists`() {
        `when`(teamRepository.findById("team-1")).thenReturn(Optional.of(dummyTeam))

        val matches = teamService.getTeamMatches("team-1")

        assertEquals(1, matches.size)
        assertEquals("M-1", matches[0].codeRencontre)
    }

    @Test
    fun `getTeamMatches should return empty list when team does not exist`() {
        `when`(teamRepository.findById("unknown")).thenReturn(Optional.empty())

        val matches = teamService.getTeamMatches("unknown")

        assertTrue(matches.isEmpty())
    }

    @Test
    fun `deleteTeamById should delete team and return true when team exists`() {
        `when`(teamRepository.findById("team-1")).thenReturn(Optional.of(dummyTeam))

        val deleted = teamService.deleteTeamById("team-1")

        assertTrue(deleted)
        verify(teamRepository).delete(dummyTeam)
    }

    @Test
    fun `deleteTeamById should return false when team not found`() {
        `when`(teamRepository.findById("unknown")).thenReturn(Optional.empty())

        val deleted = teamService.deleteTeamById("unknown")

        assertFalse(deleted)
    }

    @Test
    fun `addMatchToTeamId should save match, append to team and return updated team`() {
        val teamWithoutMatch = dummyTeam.copy(matchs = emptyList())
        `when`(teamRepository.findById("team-1")).thenReturn(Optional.of(teamWithoutMatch))
        `when`(matchRepository.save(dummyMatch)).thenReturn(dummyMatch)
        `when`(teamRepository.save(org.mockito.ArgumentMatchers.any(Team::class.java)))
            .thenAnswer { it.arguments[0] as Team }

        val updatedTeam = teamService.addMatchToTeamId("team-1", dummyMatch)

        assertNotNull(updatedTeam)
        assertEquals(1, updatedTeam?.matchs?.size)
        verify(matchRepository).save(dummyMatch)
        verify(teamRepository).save(org.mockito.ArgumentMatchers.any(Team::class.java))
    }

    @Test
    fun `addMatchToTeamId should return null when team not found`() {
        `when`(teamRepository.findById("unknown")).thenReturn(Optional.empty())

        val updatedTeam = teamService.addMatchToTeamId("unknown", dummyMatch)

        assertNull(updatedTeam)
    }

    @Test
    fun `addPlayerToTeam should execute mongoTemplate updateFirst`() {
        val player = Player(
            licenseNumber = "lic-123",
            fullName = "John Doe",
            stats = PlayerStats(),
            teamId = "team-1"
        )

        teamService.addPlayerToTeam(dummyTeam, player)

        val expectedQuery = Query(Criteria.where("_id").`is`("team-1"))
        val expectedUpdate = Update().addToSet("players", "lic-123")

        verify(mongoTemplate).updateFirst(expectedQuery, expectedUpdate, Team::class.java)
    }
}
