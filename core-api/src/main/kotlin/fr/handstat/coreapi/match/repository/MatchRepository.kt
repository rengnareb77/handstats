package fr.handstat.coreapi.match.repository

import fr.handstat.coreapi.match.model.Match
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface MatchRepository : MongoRepository<Match, String>
