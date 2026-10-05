package fr.handstat.coreapi.controller

import fr.handstat.coreapi.service.PlayerService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/player")
class PlayerController(val playerService: PlayerService) {

    @GetMapping
    fun getAllPlayers() = playerService.getAllPlayers()

    @GetMapping("/{id}")
    fun getPlayerById(@PathVariable id: String) = playerService.getPlayerById(id)
}