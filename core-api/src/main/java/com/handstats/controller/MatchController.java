package com.handstats.controller;

import com.handstats.client.ParserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Controller pour l'upload et le parsing des feuilles de match (FDME).
 * <p>
 * Reçoit le PDF, le transmet au Parser Service, et retourne les données extraites.
 * L'enrichissement et la persistance seront ajoutés une fois le modèle de données défini.
 */
@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final ParserServiceClient parserClient;

    /**
     * Upload d'une feuille de match PDF pour extraction.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadMatchSheet(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Le fichier est vide"));
        }

        Map<String, Object> parsedData = parserClient.parseMatchSheet(file);
        return ResponseEntity.ok(parsedData);
    }

    /**
     * Placeholder : liste des matchs.
     * TODO: Implémenter avec le repository MongoDB.
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> listMatches() {
        return ResponseEntity.ok(Map.of(
                "message", "Endpoint en attente — modèle de données à définir"));
    }
}
