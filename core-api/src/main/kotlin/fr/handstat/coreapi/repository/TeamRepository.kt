package fr.handstat.coreapi.repository

import fr.handstat.coreapi.model.team.Team
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface TeamRepository: MongoRepository<Team, String> {

}