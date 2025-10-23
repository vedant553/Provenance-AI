package com.provenance.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import java.util.*;

@Service
public class LLMService {
    
    @Value("${openai.api.key:${OPENAI_API_KEY:}}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();

    public String getSummary(String context) {
        // Skip API call if no API key is configured
        if (apiKey == null || apiKey.isEmpty()) {
            return "LLM API key not configured. Please set 'openai.api.key' in application.properties";
        }

        String url = "https://api.openai.com/v1/chat/completions";

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-3.5-turbo");
        body.put("messages", Arrays.asList(
            Map.of("role", "user", "content", "Analyze this code and related context:\n" + context)
        ));
        body.put("temperature", 0.7);
        body.put("max_tokens", 1000);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {}
            );
            
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    if (choice != null && choice.containsKey("message")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> message = (Map<String, Object>) choice.get("message");
                        if (message != null && message.containsKey("content")) {
                            return message.get("content").toString();
                        }
                    }
                }
            }
            return "No response from LLM service";
        } catch (Exception e) {
            return "Error calling LLM service: " + e.getMessage();
        }
    }
}
