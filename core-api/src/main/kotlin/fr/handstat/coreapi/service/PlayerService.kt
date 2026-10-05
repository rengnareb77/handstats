package fr.handstat.coreapi.service

import fr.handstat.coreapi.model.player.Player
import fr.handstat.coreapi.model.player.PlayerStats
import fr.handstat.coreapi.repository.PlayerRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class PlayerService(val playerRepository: PlayerRepository) {
    fun getAllPlayers() = playerRepository.findAll()

    fun getPlayerById(id: String) = playerRepository.findByIdOrNull(id)
    fun createPlayer(player: Player) = playerRepository.save(player)
    fun appendStats(player: Player, stats: PlayerStats) {
        val newStats = stats.copy(
            goal = player.stats.goal + stats.goal,
            sevenMeter = player.stats.sevenMeter + stats.sevenMeter,
            shot = player.stats.shot + stats.shot,
            save = player.stats.save + stats.save,
            avertissements = player.stats.avertissements + stats.avertissements,
            twoMinutes = player.stats.twoMinutes + stats.twoMinutes,
            redCard = player.stats.redCard + stats.redCard
        )
        val newPlayer = player.copy(stats = newStats)
        playerRepository.save(newPlayer)
    }
}