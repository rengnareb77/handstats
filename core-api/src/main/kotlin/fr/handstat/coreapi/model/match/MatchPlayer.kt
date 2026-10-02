package fr.handstat.coreapi.model.match

data class MatchPlayer(
    val isCaptain: Boolean,
    val tshirtNumber: Int,
    val fullName: String,
    val licenseNumber: String,
    val goal: Int,
    val sevenMeter:Int,
    val shot: Int,
    val save: Int,
    val avertissement: Boolean,
    val twoMinutes: Int,
    val redCard: Boolean
)
