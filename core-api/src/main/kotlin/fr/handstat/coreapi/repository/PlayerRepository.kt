package fr.handstat.coreapi.repository

import fr.handstat.coreapi.model.player.Player
import org.springframework.data.mongodb.repository.MongoRepository

interface PlayerRepository: MongoRepository<Player, String> {
}