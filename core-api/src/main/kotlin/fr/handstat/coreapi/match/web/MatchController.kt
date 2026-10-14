package fr.handstat.coreapi.match.web

import fr.handstat.coreapi.common.exception.ResourceNotFoundException
import fr.handstat.coreapi.match.dto.CreateMatchRequest
import fr.handstat.coreapi.match.dto.MatchResponse
import fr.handstat.coreapi.match.dto.UpdateMatchEventRequest
import fr.handstat.coreapi.match.dto.toDomain
import fr.handstat.coreapi.match.dto.toResponse
import fr.handstat.coreapi.match.model.MatchEvent
import fr.handstat.coreapi.match.model.MatchPlayer
import fr.handstat.coreapi.match.service.MatchService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/matches")
class MatchController(private val matchService: MatchService) {

    @GetMapping
    fun findAll(): List<MatchResponse> {
        return matchService.getMatches().map { it.toResponse() }
    }

    @GetMapping("/{id}")
    fun findMatchById(@PathVariable id: String): MatchResponse {
        val match = matchService.getMatchById(id) ?: throw ResourceNotFoundException("Match not found with id: $id")
        return match.toResponse()
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateMatchRequest): MatchResponse {
        return matchService.createMatch(request.toDomain()).toResponse()
    }

    @PostMapping("/{matchId}/stats/{teamId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun appendStats(
        @PathVariable matchId: String,
        @PathVariable teamId: String,
        @Valid @RequestBody matchPlayer: MatchPlayer
    ) {
        matchService.addMatchPlayer(matchPlayer, teamId, matchId)
    }

    @PostMapping("/{matchId}/stats/{teamId}/batch")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun appendStatsBatch(
        @PathVariable matchId: String,
        @PathVariable teamId: String,
        @Valid @RequestBody matchPlayers: List<MatchPlayer>
    ) {
        matchService.addAllMatchPlayers(matchPlayers, teamId, matchId)
    }

    @PostMapping("/{matchId}/events")
    @ResponseStatus(HttpStatus.CREATED)
    fun addEvent(
        @PathVariable matchId: String,
        @Valid @RequestBody newEvent: MatchEvent
    ): MatchResponse {
        return matchService.addEvent(newEvent, matchId).toResponse()
    }

    @PutMapping("/{matchId}/events")
    fun updateEvent(
        @PathVariable matchId: String,
        @Valid @RequestBody body: UpdateMatchEventRequest
    ): MatchResponse {
        return matchService.updateEvent(body.oldEvent, body.newEvent, matchId).toResponse()
    }

    @DeleteMapping("/{matchId}/events/{eventId}")
    fun deleteEvent(
        @PathVariable matchId: String,
        @PathVariable eventId: String
    ): MatchResponse {
        return matchService.deleteEvent(matchId, eventId).toResponse()
    }
}

