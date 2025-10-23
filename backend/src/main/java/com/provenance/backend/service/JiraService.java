package com.provenance.backend.service;

import org.springframework.stereotype.Service;

@Service
public class JiraService {
    public String fetchJiraInfo(String ticketId) {
        // Use Jira REST API (requires Basic Auth or OAuth)
        // Example: GET https://yourdomain.atlassian.net/rest/api/2/issue/{ticketId}
        return "Jira info for " + ticketId; // Replace with real API call
    }
}
