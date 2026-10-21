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

    @Test
    fun `getAllTeams should return 200 with list of teams`() {
        val team = Team(
            id = "team-123",
            name = "Paris Saint-Germain",
            championship = "Liqui Moly StarLigue"
        )
        `when`(teamService.getTeams()).thenReturn(listOf(team))

        mockMvc.perform(get("/teams"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].id").value("team-123"))
            .andExpect(jsonPath("$[0].name").value("Paris Saint-Germain"))
    }

    @Test
    fun `getMatchByTeamId should return 200 with list of match responses`() {
        val match = fr.handstat.coreapi.match.model.Match(
            codeRencontre = "M-1",
            homeTeamName = "Team A",
            awayTeamName = "Team B",
            homeScore = fr.handstat.coreapi.match.model.Score(10, 20),
            awayScore = fr.handstat.coreapi.match.model.Score(9, 18),
            date = java.time.LocalDateTime.of(2026, 1, 1, 10, 0)
        )
        `when`(teamService.getTeamMatches("team-123")).thenReturn(listOf(match))

        mockMvc.perform(get("/teams/team-123/matches"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].codeRencontre").value("M-1"))
            .andExpect(jsonPath("$[0].homeTeamName").value("Team A"))
    }

    @Test
    fun `addMatchToTeam should return 201 when match is added successfully`() {
        val dummyMatch = fr.handstat.coreapi.match.model.Match(
            codeRencontre = "M-1",
            homeTeamName = "Team A",
            awayTeamName = "Team B",
            homeScore = fr.handstat.coreapi.match.model.Score(10, 20),
            awayScore = fr.handstat.coreapi.match.model.Score(9, 18),
            date = java.time.LocalDateTime.of(2026, 1, 1, 10, 0)
        )
        val teamWithMatch = Team(
            id = "team-123",
            name = "Team 123",
            championship = "N2"
        )
        `when`(teamService.addMatchToTeamId(fr.handstat.coreapi.testutil.eq("team-123"), fr.handstat.coreapi.testutil.any(dummyMatch)))
            .thenReturn(teamWithMatch)

        val payload = """
            {
                "codeRencontre": "M-1",
                "homeTeamName": "Team A",
                "awayTeamName": "Team B",
                "homeScore": { "halfScore": 10, "finalScore": 20 },
                "awayScore": { "halfScore": 9, "finalScore": 18 },
                "date": "01/01/2026 10:00"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/teams/team-123/matches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value("team-123"))
    }

    @Test
    fun `addMatchToTeam should return 404 when team does not exist`() {
        val dummyMatch = fr.handstat.coreapi.match.model.Match(
            codeRencontre = "M-1",
            homeTeamName = "Team A",
            awayTeamName = "Team B",
            homeScore = fr.handstat.coreapi.match.model.Score(10, 20),
            awayScore = fr.handstat.coreapi.match.model.Score(9, 18),
            date = java.time.LocalDateTime.of(2026, 1, 1, 10, 0)
        )
        `when`(teamService.addMatchToTeamId(fr.handstat.coreapi.testutil.eq("unknown"), fr.handstat.coreapi.testutil.any(dummyMatch)))
            .thenReturn(null)

        val payload = """
            {
                "codeRencontre": "M-1",
                "homeTeamName": "Team A",
                "awayTeamName": "Team B",
                "homeScore": { "halfScore": 10, "finalScore": 20 },
                "awayScore": { "halfScore": 9, "finalScore": 18 },
                "date": "01/01/2026 10:00"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/teams/unknown/matches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.status").value(404))
    }
}
