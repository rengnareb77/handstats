package fr.handstat.coreapi.common.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import org.springframework.http.HttpStatus
import org.springframework.validation.BindingResult
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException

class GlobalExceptionHandlerTest {

    private val handler = GlobalExceptionHandler()

    @Test
    fun `handleResourceNotFound should return 404 ProblemDetail`() {
        val ex = ResourceNotFoundException("Item not found")

        val problem = handler.handleResourceNotFound(ex)

        assertEquals(HttpStatus.NOT_FOUND.value(), problem.status)
        assertEquals("Item not found", problem.detail)
        assertEquals("Resource Not Found", problem.title)
        assertNotNull(problem.properties?.get("timestamp"))
    }

    @Test
    fun `handleMethodArgumentNotValid should return 400 ProblemDetail with field errors`() {
        val bindingResult = mock(BindingResult::class.java)
        val fieldError = FieldError("object", "name", "Name is mandatory")
        `when`(bindingResult.fieldErrors).thenReturn(listOf(fieldError))

        val ex = mock(MethodArgumentNotValidException::class.java)
        `when`(ex.bindingResult).thenReturn(bindingResult)

        val problem = handler.handleMethodArgumentNotValid(ex)

        assertEquals(HttpStatus.BAD_REQUEST.value(), problem.status)
        assertEquals("Bad Request - Validation Error", problem.title)
        val errors = problem.properties?.get("errors") as? Map<*, *>
        assertEquals("Name is mandatory", errors?.get("name"))
    }

    @Test
    fun `handleIllegalArgument should return 400 ProblemDetail`() {
        val ex = IllegalArgumentException("Bad input")

        val problem = handler.handleIllegalArgument(ex)

        assertEquals(HttpStatus.BAD_REQUEST.value(), problem.status)
        assertEquals("Bad input", problem.detail)
        assertEquals("Bad Request", problem.title)
    }

    @Test
    fun `handleGenericException should return 500 ProblemDetail`() {
        val ex = RuntimeException("Database down")

        val problem = handler.handleGenericException(ex)

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), problem.status)
        assertEquals("An unexpected error occurred", problem.detail)
        assertEquals("Internal Server Error", problem.title)
    }
}
