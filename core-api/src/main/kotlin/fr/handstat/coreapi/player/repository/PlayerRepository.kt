package fr.handstat.coreapi.player.repository

import fr.handstat.coreapi.player.model.Player
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface PlayerRepository : MongoRepository<Player, String> {
    fun findByTeamId(teamId: String): List<Player>
}
