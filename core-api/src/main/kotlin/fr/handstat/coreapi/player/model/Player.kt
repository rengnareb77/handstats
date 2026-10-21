package fr.handstat.coreapi.player.model

import fr.handstat.coreapi.match.model.Match
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.DocumentReference

@Document(collection = "players")
data class Player(
    @Id
    val licenseNumber: String? = null,
    @field:NotBlank(message = "fullName must not be blank")
    val fullName: String,
    @field:Valid
    val stats: PlayerStats = PlayerStats(),
    @DocumentReference
    val matchs: List<Match> = emptyList(),
    @field:NotBlank(message = "teamId must not be blank")
    val teamId: String
)
