package fr.handstat.coreapi.player.model

import com.fasterxml.jackson.annotation.JsonProperty

data class PlayerStats(
    val goal: Int = 0,
    val sevenMeter: Int = 0,
    val shot: Int = 0,
    val save: Int = 0,
    val avertissements: Int = 0,
    val twoMinutes: Int = 0,
    val redCard: Int = 0
) {
    @get:JsonProperty("avertissement")
    val avertissement: Int
        get() = avertissements
}

