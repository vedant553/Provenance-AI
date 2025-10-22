package com.provenance.backend.controller;

import org.springframework.web.bind.annotation.*;
import com.provenance.backend.dto.AnalyzeRequest;

@RestController
@RequestMapping("/analyze")
public class AnalysisController {

    @PostMapping
    public String analyze(@RequestBody AnalyzeRequest request) {
        // For now, just echo the data received
        return String.format(
          "Received code: %s\nFile: %s\nStart line: %d\nEnd line: %d", 
          request.getCode(), request.getFilePath(), request.getStartLine(), request.getEndLine()
        );
    }
}
