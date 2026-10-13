package fr.handstat.coreapi.team.model

import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.player.model.Player
import jakarta.validation.constraints.NotBlank
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.DocumentReference

@Document(collection = "teams")
data class Team(
    @Id
    val id: String? = null,
    @field:NotBlank(message = "Team name must not be blank")
    val name: String,
    @field:NotBlank(message = "Championship must not be blank")
    val championship: String,
    @DocumentReference
    val players: List<Player> = emptyList(),
    @DocumentReference
    val matchs: List<Match> = emptyList()
)
