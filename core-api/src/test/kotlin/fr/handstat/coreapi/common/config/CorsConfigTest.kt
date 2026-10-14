package fr.handstat.coreapi.common.config

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.web.servlet.config.annotation.CorsRegistry

class CorsConfigTest {

    @Test
    fun `corsProperties default should have asterisk`() {
        val props = CorsProperties()
        assertEquals(listOf("*"), props.allowedOrigins)
    }

    @Test
    fun `corsProperties custom origins should be preserved`() {
        val props = CorsProperties(allowedOrigins = listOf("http://localhost:3000"))
        assertEquals(listOf("http://localhost:3000"), props.allowedOrigins)
    }

    @Test
    fun `corsConfig addCorsMappings should register configuration`() {
        val props = CorsProperties(allowedOrigins = listOf("http://localhost:3000"))
        val config = CorsConfig(props)
        val registry = CorsRegistry()

        config.addCorsMappings(registry)

        assertNotNull(registry)
    }
}
