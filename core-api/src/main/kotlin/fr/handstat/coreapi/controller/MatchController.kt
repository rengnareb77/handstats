package fr.handstat.coreapi.controller

import fr.handstat.coreapi.model.match.Match
import fr.handstat.coreapi.service.MatchService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
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

}