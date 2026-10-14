package fr.handstat.coreapi.testutil

import org.mockito.Mockito

@Suppress("UNCHECKED_CAST")
fun <T> any(sample: T): T {
    Mockito.any<T>()
    return sample
}

fun <T> eq(value: T): T {
    Mockito.eq(value)
    return value
}
