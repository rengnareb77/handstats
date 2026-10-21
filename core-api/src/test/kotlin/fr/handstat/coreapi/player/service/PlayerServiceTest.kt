package fr.handstat.coreapi.player.service

import fr.handstat.coreapi.player.model.Player
import fr.handstat.coreapi.player.model.PlayerStats
import fr.handstat.coreapi.player.repository.PlayerRepository
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update

class PlayerServiceTest {

    private val playerRepository: PlayerRepository = mock(PlayerRepository::class.java)
    private val mongoTemplate: MongoTemplate = mock(MongoTemplate::class.java)
    private val playerService = PlayerService(playerRepository, mongoTemplate)

    @Test
    fun `appendStats should perform atomic inc on mongoTemplate`() {
        val stats = PlayerStats(goal = 4, shot = 6, save = 0)

        playerService.appendStats("lic-123", stats)

        val expectedQuery = Query(Criteria.where("_id").`is`("lic-123"))
        val expectedUpdate = Update()
            .inc("stats.goal", 4)
            .inc("stats.sevenMeter", 0)
            .inc("stats.shot", 6)
            .inc("stats.save", 0)
            .inc("stats.avertissements", 0)
            .inc("stats.twoMinutes", 0)
            .inc("stats.redCard", 0)

        verify(mongoTemplate).updateFirst(expectedQuery, expectedUpdate, Player::class.java)
    }

    @Test
    fun `getAllPlayers should return list of players`() {
        val player = Player(
            licenseNumber = "lic-1",
            fullName = "Player 1",
            stats = PlayerStats(),
            teamId = "team-1"
        )
        org.mockito.Mockito.`when`(playerRepository.findAll()).thenReturn(listOf(player))

        val result = playerService.getAllPlayers()

        org.junit.jupiter.api.Assertions.assertEquals(1, result.size)
        org.junit.jupiter.api.Assertions.assertEquals("lic-1", result[0].licenseNumber)
    }

    @Test
    fun `getPlayerById should return player when found`() {
        val player = Player(
            licenseNumber = "lic-1",
            fullName = "Player 1",
            stats = PlayerStats(),
            teamId = "team-1"
        )
        org.mockito.Mockito.`when`(playerRepository.findById("lic-1")).thenReturn(java.util.Optional.of(player))

        val result = playerService.getPlayerById("lic-1")

        org.junit.jupiter.api.Assertions.assertNotNull(result)
        org.junit.jupiter.api.Assertions.assertEquals("lic-1", result?.licenseNumber)
    }

    @Test
    fun `getPlayerById should return null when not found`() {
        org.mockito.Mockito.`when`(playerRepository.findById("unknown")).thenReturn(java.util.Optional.empty())

        val result = playerService.getPlayerById("unknown")

        org.junit.jupiter.api.Assertions.assertNull(result)
    }

    @Test
    fun `createPlayer should save and return player`() {
        val player = Player(
            licenseNumber = "lic-1",
            fullName = "Player 1",
            stats = PlayerStats(),
            teamId = "team-1"
        )
        org.mockito.Mockito.`when`(playerRepository.save(player)).thenReturn(player)

        val result = playerService.createPlayer(player)

        org.junit.jupiter.api.Assertions.assertEquals("lic-1", result.licenseNumber)
        verify(playerRepository).save(player)
    }
}
