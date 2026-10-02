package fr.handstat.coreapi.service

import fr.handstat.coreapi.model.match.Match
import fr.handstat.coreapi.repository.MatchRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class MatchService(private val matchRepository: MatchRepository) {

    fun getMatches(): List<Match> {
        return matchRepository.findAll()
    }

    fun getMatchById(id: String): Match? {
        return matchRepository.findByIdOrNull(id)
    }

    fun createMatch(match: Match): Match {
        return matchRepository.save(match)
    }


}