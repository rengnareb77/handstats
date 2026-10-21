package fr.handstat.coreapi.team.repository

import fr.handstat.coreapi.team.model.Team
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface TeamRepository : MongoRepository<Team, String> {
    fun findByChampionship(championship: String): List<Team>
}
