package fr.handstat.coreapi.team.web

import fr.handstat.coreapi.common.exception.GlobalExceptionHandler
import fr.handstat.coreapi.team.model.Team
import fr.handstat.coreapi.team.service.TeamService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@WebMvcTest(controllers = [TeamController::class, GlobalExceptionHandler::class])
class TeamControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var teamService: TeamService

    @Test
    fun `getTeamById should return 200 when team exists`() {
        val team = Team(
            id = "team-123",
            name = "Paris Saint-Germain",
            championship = "Liqui Moly StarLigue"
        )
        `when`(teamService.getTeamById("team-123")).thenReturn(team)

        mockMvc.perform(get("/teams/team-123"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value("team-123"))
            .andExpect(jsonPath("$.name").value("Paris Saint-Germain"))
            .andExpect(jsonPath("$.championship").value("Liqui Moly StarLigue"))
    }

    @Test
    fun `getTeamById should return 404 ProblemDetail when team does not exist`() {
        `when`(teamService.getTeamById("unknown")).thenReturn(null)

        mockMvc.perform(get("/teams/unknown"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.title").value("Resource Not Found"))
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.detail").value("Team not found with id: unknown"))
    }

    @Test
    fun `createTeam should return 201 Created when payload is valid`() {
        val payload = """
            {
                "name": "Montpellier HB",
                "championship": "Liqui Moly StarLigue"
            }
        """.trimIndent()

        val createdTeam = Team(
            id = "mhb-1",
            name = "Montpellier HB",
            championship = "Liqui Moly StarLigue"
        )

        val inputTeam = Team(
            id = null,
            name = "Montpellier HB",
            championship = "Liqui Moly StarLigue"
        )
        `when`(teamService.createTeam(inputTeam)).thenReturn(createdTeam)

        mockMvc.perform(
            post("/teams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value("mhb-1"))
            .andExpect(jsonPath("$.name").value("Montpellier HB"))
    }

    @Test
    fun `createTeam should return 400 Bad Request when name is blank`() {
        val invalidPayload = """
            {
                "name": "",
                "championship": "Liqui Moly StarLigue"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/teams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.title").value("Bad Request - Validation Error"))
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.errors.name").value("Team name must not be blank"))
    }
}
