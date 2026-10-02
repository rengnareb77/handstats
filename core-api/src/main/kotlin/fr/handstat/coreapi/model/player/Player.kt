package fr.handstat.coreapi.model.player

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.MongoId

data class Player(
    @Id
    val licenseNumber: String? = null
)
