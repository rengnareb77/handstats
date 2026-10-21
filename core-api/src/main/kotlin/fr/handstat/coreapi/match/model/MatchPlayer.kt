package fr.handstat.coreapi.match.model

import jakarta.validation.constraints.NotBlank

data class MatchPlayer(
    val isCaptain: Boolean = false,
    val tshirtNumber: Int = 0,
    @field:NotBlank(message = "fullName must not be blank")
    val fullName: String,
    @field:NotBlank(message = "licenseNumber must not be blank")
    val licenseNumber: String,
    val goal: Int = 0,
    val sevenMeter: Int = 0,
    val shot: Int = 0,
    val save: Int = 0,
    val avertissement: Boolean = false,
    val twoMinutes: Int = 0,
    val redCard: Boolean = false
)
