package fr.handstat.coreapi.model.match

data class MatchEvent(

    val type:Type,
    val time: String,
    val matchPlayerName: String,
    val team: EventTeam,
    val sector: Sector?,
    val goalType:String? //TODO avoir un vrai type
)
