package fr.handstat.coreapi.match.web

import fr.handstat.coreapi.common.exception.ResourceNotFoundException
import fr.handstat.coreapi.match.dto.CreateMatchRequest
import fr.handstat.coreapi.match.dto.toDomain
import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.match.model.MatchEvent
import fr.handstat.coreapi.match.model.MatchPlayer
import fr.handstat.coreapi.match.service.MatchService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
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
    fun findAll(): List<Match> {
        return matchService.getMatches()
    }

    @GetMapping("/{id}")
    fun findMatchById(@PathVariable id: String): Match {
        return matchService.getMatchById(id) ?: throw ResourceNotFoundException("Match not found with id: $id")
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateMatchRequest): Match {
        return matchService.createMatch(request.toDomain())
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

    @PostMapping("/{matchId}/events")
    @ResponseStatus(HttpStatus.CREATED)
    fun addEvent(
        @PathVariable matchId: String,
        @Valid @RequestBody newEvent: MatchEvent
    ): Match {
        return matchService.addEvent(newEvent, matchId)
    }

    @PutMapping("/{matchId}/events")
    fun updateEvent(
        @PathVariable matchId: String,
        @RequestBody body: List<MatchEvent>
    ): Match {
        if (body.size != 2) {
            throw IllegalArgumentException("Invalid number of events: body must contain exactly [oldEvent, newEvent]")
        }

        val oldEvent = body[0]
        val newEvent = body[1]
        return matchService.updateEvent(oldEvent, newEvent, matchId)
    }
}
