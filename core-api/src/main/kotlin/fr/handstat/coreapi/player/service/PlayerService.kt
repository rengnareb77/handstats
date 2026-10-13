package fr.handstat.coreapi.player.service

import fr.handstat.coreapi.player.model.Player
import fr.handstat.coreapi.player.model.PlayerStats
import fr.handstat.coreapi.player.repository.PlayerRepository
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class PlayerService(
    private val playerRepository: PlayerRepository,
    private val mongoTemplate: MongoTemplate
) {

    fun getAllPlayers(): List<Player> = playerRepository.findAll()

    fun getPlayerById(id: String): Player? = playerRepository.findByIdOrNull(id)

    fun createPlayer(player: Player): Player = playerRepository.save(player)

    /**
     * Atomic update of player stats using MongoDB $inc operator.
     * Avoids lost updates and race conditions during concurrent match events.
     */
    fun appendStats(licenseNumber: String, stats: PlayerStats) {
        val query = Query(Criteria.where("_id").`is`(licenseNumber))
        val update = Update()
            .inc("stats.goal", stats.goal)
            .inc("stats.sevenMeter", stats.sevenMeter)
            .inc("stats.shot", stats.shot)
            .inc("stats.save", stats.save)
            .inc("stats.avertissements", stats.avertissements)
            .inc("stats.twoMinutes", stats.twoMinutes)
            .inc("stats.redCard", stats.redCard)

        mongoTemplate.updateFirst(query, update, Player::class.java)
    }
}
