package fr.handstat.coreapi.player.web

import fr.handstat.coreapi.common.exception.ResourceNotFoundException
import fr.handstat.coreapi.player.dto.CreatePlayerRequest
import fr.handstat.coreapi.player.dto.PlayerResponse
import fr.handstat.coreapi.player.dto.toDomain
import fr.handstat.coreapi.player.dto.toResponse
import fr.handstat.coreapi.player.service.PlayerService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/players")
class PlayerController(private val playerService: PlayerService) {

    @GetMapping
    fun getAllPlayers(): List<PlayerResponse> =
        playerService.getAllPlayers().map { it.toResponse() }

    @GetMapping("/{id}")
    fun getPlayerById(@PathVariable id: String): PlayerResponse =
        playerService.getPlayerById(id)?.toResponse()
            ?: throw ResourceNotFoundException("Player not found with id: $id")

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createPlayer(@Valid @RequestBody request: CreatePlayerRequest): PlayerResponse =
        playerService.createPlayer(request.toDomain()).toResponse()
}
