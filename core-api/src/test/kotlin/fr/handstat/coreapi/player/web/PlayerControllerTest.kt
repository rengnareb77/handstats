package fr.handstat.coreapi.player.web

import fr.handstat.coreapi.common.exception.GlobalExceptionHandler
import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.match.model.Score
import fr.handstat.coreapi.player.model.Player
import fr.handstat.coreapi.player.model.PlayerStats
import fr.handstat.coreapi.player.service.PlayerService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDateTime

@WebMvcTest(controllers = [PlayerController::class, GlobalExceptionHandler::class])
class PlayerControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var playerService: PlayerService

    @Test
    fun `getPlayerById should return 200 when player exists with matches`() {
        val sampleMatch = Match(
            codeRencontre = "MATCH-1",
            homeTeamName = "Equipe A",
            awayTeamName = "Equipe B",
            homeScore = Score(halfScore = 10, finalScore = 25),
            awayScore = Score(halfScore = 12, finalScore = 24),
            date = LocalDateTime.now()
        )
        val player = Player(
            licenseNumber = "12345",
            fullName = "Nikola Karabatic",
            stats = PlayerStats(goal = 5, shot = 6),
            matchs = listOf(sampleMatch),
            teamId = "team-1"
        )
        `when`(playerService.getPlayerById("12345")).thenReturn(player)

        mockMvc.perform(get("/players/12345"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.licenseNumber").value("12345"))
            .andExpect(jsonPath("$.fullName").value("Nikola Karabatic"))
            .andExpect(jsonPath("$.stats.goal").value(5))
            .andExpect(jsonPath("$.matchs[0].codeRencontre").value("MATCH-1"))
            .andExpect(jsonPath("$.matchs.length()").value(1))
    }

    @Test
    fun `getPlayerById should return 404 ProblemDetail when player does not exist`() {
        `when`(playerService.getPlayerById("unknown")).thenReturn(null)

        mockMvc.perform(get("/players/unknown"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.title").value("Resource Not Found"))
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.detail").value("Player not found with id: unknown"))
    }

    @Test
    fun `getAllPlayers should return 200 with list of player responses`() {
        val player = Player(
            licenseNumber = "12345",
            fullName = "Nikola Karabatic",
            stats = PlayerStats(goal = 5, shot = 6),
            teamId = "team-1"
        )
        `when`(playerService.getAllPlayers()).thenReturn(listOf(player))

        mockMvc.perform(get("/players"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].licenseNumber").value("12345"))
            .andExpect(jsonPath("$[0].fullName").value("Nikola Karabatic"))
    }

    @Test
    fun `createPlayer should return 201 when payload is valid`() {
        val player = Player(
            licenseNumber = "lic-99",
            fullName = "Elohim Prandi",
            stats = PlayerStats(),
            teamId = "team-1"
        )
        `when`(playerService.createPlayer(fr.handstat.coreapi.testutil.any(player)))
            .thenReturn(player)

        val payload = """
            {
                "licenseNumber": "lic-99",
                "fullName": "Elohim Prandi",
                "teamId": "team-1"
            }
        """.trimIndent()

        mockMvc.perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/players")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(payload)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.licenseNumber").value("lic-99"))
            .andExpect(jsonPath("$.fullName").value("Elohim Prandi"))
    }

    @Test
    fun `createPlayer should return 400 when fullName is blank`() {
        val invalidPayload = """
            {
                "licenseNumber": "lic-99",
                "fullName": "",
                "teamId": "team-1"
            }
        """.trimIndent()

        mockMvc.perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/players")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(invalidPayload)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.errors.fullName").value("fullName must not be blank"))
    }
}
