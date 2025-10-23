package com.provenance.backend.dto;

import lombok.Data;

@Data
public class AnalyzeRequest {
    private String code;
    private String filePath;
    private int startLine;
    private int endLine;
    private String jiraTicketId;
    private String slackThreadUrl;
}
