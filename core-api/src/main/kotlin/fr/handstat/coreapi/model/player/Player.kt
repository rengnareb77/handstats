package fr.handstat.coreapi.model.player

import fr.handstat.coreapi.model.match.Match
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DocumentReference
import org.springframework.data.mongodb.core.mapping.MongoId

data class Player(
    @Id
    val licenseNumber: String? = null,
    val fullName:String,
    val stats: PlayerStats,
    @DocumentReference
    val matchs: List<Match> = emptyList(),
    val teamId: String
)
