package fr.handstat.coreapi.match.web

import fr.handstat.coreapi.common.exception.GlobalExceptionHandler
import fr.handstat.coreapi.match.dto.UpdateMatchEventRequest
import fr.handstat.coreapi.match.model.EventTeam
import fr.handstat.coreapi.match.model.Match
import fr.handstat.coreapi.match.model.MatchEvent
import fr.handstat.coreapi.match.model.Score
import fr.handstat.coreapi.match.model.Type
import fr.handstat.coreapi.match.service.MatchService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDateTime

@WebMvcTest(controllers = [MatchController::class, GlobalExceptionHandler::class])
class MatchControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var matchService: MatchService

    private val testMatch = Match(
        codeRencontre = "M-101",
        homeTeamName = "Equipe A",
        awayTeamName = "Equipe B",
        homeScore = Score(10, 25),
        awayScore = Score(12, 24),
        isHome = true,
        date = LocalDateTime.of(2026, 9, 19, 17, 30),
        events = listOf(
            MatchEvent(
                id = "evt-1",
                type = Type.GOAL,
                time = "10:00",
                matchPlayerName = "Joueur 1",
                team = EventTeam.HOME
            )
        )
    )

    @Test
    fun `findMatchById should return 200 when match exists`() {
        `when`(matchService.getMatchById("M-101")).thenReturn(testMatch)

        mockMvc.perform(get("/matches/M-101"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.codeRencontre").value("M-101"))
            .andExpect(jsonPath("$.homeTeamName").value("Equipe A"))
            .andExpect(jsonPath("$.awayTeamName").value("Equipe B"))
    }

    @Test
    fun `findMatchById should return 404 when match not found`() {
        `when`(matchService.getMatchById("unknown")).thenReturn(null)

        mockMvc.perform(get("/matches/unknown"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.status").value(404))
    }

    @Test
    fun `updateEvent should return 200 when payload contains oldEvent and newEvent`() {
        val oldEvent = testMatch.events[0]
        val newEvent = oldEvent.copy(type = Type.SEVEN_METER)
        val updatedMatch = testMatch.copy(events = listOf(newEvent))

        `when`(matchService.updateEvent(oldEvent, newEvent, "M-101")).thenReturn(updatedMatch)

        val payload = """
            {
                "oldEvent": {
                    "id": "evt-1",
                    "type": "GOAL",
                    "time": "10:00",
                    "matchPlayerName": "Joueur 1",
                    "team": "HOME"
                },
                "newEvent": {
                    "id": "evt-1",
                    "type": "SEVEN_METER",
                    "time": "10:00",
                    "matchPlayerName": "Joueur 1",
                    "team": "HOME"
                }
            }
        """.trimIndent()

        mockMvc.perform(
            put("/matches/M-101/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.events[0].type").value("SEVEN_METER"))
    }

    @Test
    fun `deleteEvent should return 200 with updated match`() {
        val matchWithoutEvent = testMatch.copy(events = emptyList())
        `when`(matchService.deleteEvent("M-101", "evt-1")).thenReturn(matchWithoutEvent)

        mockMvc.perform(delete("/matches/M-101/events/evt-1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.events").isEmpty)
    }

    @Test
    fun `findAll should return 200 with list of matches`() {
        `when`(matchService.getMatches()).thenReturn(listOf(testMatch))

        mockMvc.perform(get("/matches"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].codeRencontre").value("M-101"))
    }

    @Test
    fun `create should return 201 when match request is valid`() {
        `when`(matchService.createMatch(fr.handstat.coreapi.testutil.any(testMatch))).thenReturn(testMatch)

        val payload = """
            {
                "codeRencontre": "M-101",
                "homeTeamName": "Equipe A",
                "awayTeamName": "Equipe B",
                "homeScore": { "halfScore": 10, "finalScore": 25 },
                "awayScore": { "halfScore": 12, "finalScore": 24 },
                "date": "19/09/2026 17:30"
            }
        """.trimIndent()

        mockMvc.perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/matches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.codeRencontre").value("M-101"))
    }

    @Test
    fun `appendStats should return 204 No Content`() {
        val dummyPlayer = fr.handstat.coreapi.match.model.MatchPlayer(
            isCaptain = false,
            tshirtNumber = 10,
            fullName = "Joueur 10",
            licenseNumber = "lic-10",
            goal = 3,
            sevenMeter = 1,
            shot = 4,
            save = 0,
            avertissement = false,
            twoMinutes = 0,
            redCard = false
        )
        val payload = """
            {
                "isCaptain": false,
                "tshirtNumber": 10,
                "fullName": "Joueur 10",
                "licenseNumber": "lic-10",
                "goal": 3,
                "sevenMeter": 1,
                "shot": 4,
                "save": 0,
                "avertissement": false,
                "twoMinutes": 0,
                "redCard": false
            }
        """.trimIndent()

        mockMvc.perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/matches/M-101/stats/team-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
            .andExpect(status().isNoContent)

        verify(matchService).addMatchPlayer(fr.handstat.coreapi.testutil.any(dummyPlayer), fr.handstat.coreapi.testutil.eq("team-1"), fr.handstat.coreapi.testutil.eq("M-101"))
    }

    @Test
    fun `appendStatsBatch should return 204 No Content`() {
        val dummyPlayer = fr.handstat.coreapi.match.model.MatchPlayer(
            isCaptain = false,
            tshirtNumber = 10,
            fullName = "Joueur 10",
            licenseNumber = "lic-10",
            goal = 3,
            sevenMeter = 1,
            shot = 4,
            save = 0,
            avertissement = false,
            twoMinutes = 0,
            redCard = false
        )
        val payload = """
            [
                {
                    "isCaptain": false,
                    "tshirtNumber": 10,
                    "fullName": "Joueur 10",
                    "licenseNumber": "lic-10",
                    "goal": 3,
                    "sevenMeter": 1,
                    "shot": 4,
                    "save": 0,
                    "avertissement": false,
                    "twoMinutes": 0,
                    "redCard": false
                }
            ]
        """.trimIndent()

        mockMvc.perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/matches/M-101/stats/team-1/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
            .andExpect(status().isNoContent)

        verify(matchService).addAllMatchPlayers(fr.handstat.coreapi.testutil.any(listOf(dummyPlayer)), fr.handstat.coreapi.testutil.eq("team-1"), fr.handstat.coreapi.testutil.eq("M-101"))
    }

    @Test
    fun `addEvent should return 201 with updated match`() {
        val newEvent = MatchEvent(
            id = "evt-2",
            type = Type.GOAL,
            time = "12:00",
            matchPlayerName = "Joueur 2",
            team = EventTeam.HOME
        )
        val matchWithNewEvent = testMatch.copy(events = listOf(testMatch.events[0], newEvent))
        `when`(matchService.addEvent(fr.handstat.coreapi.testutil.any(newEvent), fr.handstat.coreapi.testutil.eq("M-101")))
            .thenReturn(matchWithNewEvent)

        val payload = """
            {
                "id": "evt-2",
                "type": "GOAL",
                "time": "12:00",
                "matchPlayerName": "Joueur 2",
                "team": "HOME"
            }
        """.trimIndent()

        mockMvc.perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/matches/M-101/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.events.length()").value(2))
    }
}
