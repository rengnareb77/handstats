package fr.handstat.coreapi.match.model

import jakarta.validation.constraints.Min

data class Score(
    @field:Min(0)
    val halfScore: Int = 0,
    @field:Min(0)
    val finalScore: Int = 0
)
