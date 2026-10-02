package fr.handstat.coreapi.model.team

import fr.handstat.coreapi.model.match.Match
import fr.handstat.coreapi.model.player.Player
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.DocumentReference

@Document(collection = "teams")
data class Team(
    @Id
    val id: String? = null,
    val name: String,
    @DocumentReference
    val players: List<Player> = emptyList(),
    @DocumentReference
    val matchs: List<Match> = emptyList()
)
