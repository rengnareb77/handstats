package fr.handstat.coreapi.match.model

import java.util.UUID

data class MatchEvent(
    val id: String = UUID.randomUUID().toString(),
    val type: Type,
    val time: String,
    val matchPlayerName: String,
    val team: EventTeam,
    val sector: Sector? = null,
    val goalType: String? = null
)
