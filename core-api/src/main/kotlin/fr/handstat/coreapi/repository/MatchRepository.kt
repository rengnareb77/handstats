package fr.handstat.coreapi.repository

import fr.handstat.coreapi.model.match.Match
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface MatchRepository: MongoRepository<Match, String> {
}