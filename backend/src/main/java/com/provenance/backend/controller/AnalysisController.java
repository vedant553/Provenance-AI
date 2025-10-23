package com.provenance.backend.controller;

import org.springframework.web.bind.annotation.*;
import com.provenance.backend.dto.AnalyzeRequest;
import com.provenance.backend.service.JiraService;
import com.provenance.backend.service.SlackService;
import com.provenance.backend.service.LLMService;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/analyze")
public class AnalysisController {

    @Autowired private JiraService jiraService;
    @Autowired private SlackService slackService;
    @Autowired private LLMService llmService;

    @PostMapping
    public String analyze(@RequestBody AnalyzeRequest request) {
        // Fetch Jira info if ticket provided
        String jiraData = null;
        if (request.getJiraTicketId() != null && !request.getJiraTicketId().isBlank()) {
            jiraData = jiraService.fetchJiraInfo(request.getJiraTicketId().trim());
        }
        
        // Fetch Slack info if thread provided
        String slackData = null;
        if (request.getSlackThreadUrl() != null && !request.getSlackThreadUrl().isBlank()) {
            slackData = slackService.fetchSlackThread(request.getSlackThreadUrl().trim());
        }
        
        // Prepare context for LLM
        String context = "Code:\n" + request.getCode() +
                "\nJira Info:\n" + (jiraData != null ? jiraData : "") +
                "\nSlack Info:\n" + (slackData != null ? slackData : "");
                
        // Pass to LLM API
        String summary = llmService.getSummary(context);
        return summary;
    }
}
