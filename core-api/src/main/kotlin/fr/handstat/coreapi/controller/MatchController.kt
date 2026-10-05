package fr.handstat.coreapi.controller

import fr.handstat.coreapi.model.match.Match
import fr.handstat.coreapi.model.match.MatchEvent
import fr.handstat.coreapi.model.match.MatchPlayer
import fr.handstat.coreapi.service.MatchService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/match")
class MatchController(private val matchService: MatchService) {

    @GetMapping
    fun findAll(): List<Match> {
        return matchService.getMatches()
    }

    @GetMapping("/{id}")
    fun findMatchById(@PathVariable id: String): Match? {
        return matchService.getMatchById(id)
    }

    @PostMapping()
    fun create(@RequestBody match: Match): Match {
        return matchService.createMatch(match)
    }

    @PostMapping("/{matchId}/stats/{teamId}")
    fun appendStats(@PathVariable matchId: String, @PathVariable teamId: String, @RequestBody matchPlayer: MatchPlayer) {
        try {
            matchService.addMatchPlayer(matchPlayer,teamId, matchId)
        } catch (e: Exception) {
            throw e
        }
        return
    }

    @PostMapping("/{matchId}/event")
    fun addEvent(@PathVariable matchId: String, @RequestBody newEvent: MatchEvent): Match {
        return matchService.addEvent(newEvent, matchId)
    }

    @PutMapping("/{matchId}/event")
    fun updateEvent(@PathVariable matchId: String, @RequestBody body: List<MatchEvent>): Match {
        if (body.size != 2)
            throw IllegalArgumentException("Invalid number of events")

        val oldEvent = body[0]
        val newEvent = body[1]
        return matchService.updateEvent(oldEvent, newEvent, matchId)
    }

}