package fr.handstat.coreapi.model.match

data class MatchEvent(
    val type:Type,
    val time: String,
    val matchPlayerName: String,
    val sector: Sector?
)
