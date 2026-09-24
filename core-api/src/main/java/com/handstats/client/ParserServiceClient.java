package com.handstats.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Client HTTP dédié aux appels vers le Parser Service (FastAPI).
 * <p>
 * Isolé dans son propre service conformément aux règles d'architecture.
 * Utilise le DNS interne Docker : http://parser-service:8000
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ParserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${app.parser.base-url}")
    private String parserBaseUrl;

    /**
     * Envoie un fichier PDF au Parser Service pour extraction des données FDME.
     *
     * @param file le fichier PDF uploadé
     * @return les données structurées extraites du PDF
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> parseMatchSheet(MultipartFile file) {
        log.info("Envoi du fichier '{}' au Parser Service ({})",
                file.getOriginalFilename(), parserBaseUrl);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    parserBaseUrl + "/api/parse",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class);

            log.info("Parser Service a répondu avec le statut {}", response.getStatusCode());
            return response.getBody();

        } catch (IOException e) {
            log.error("Erreur lors de la lecture du fichier", e);
            throw new RuntimeException("Impossible de lire le fichier uploadé", e);
        }
    }
}
