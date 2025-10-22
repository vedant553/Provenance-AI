package com.provenance.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GitHubService {
    public String getPullRequestForCommit(String owner, String repo, String commitSha, String githubToken) {
        // Example endpoint:
        // https://api.github.com/repos/{owner}/{repo}/commits/{commit_sha}/pulls
        String url = String.format("https://api.github.com/repos/%s/%s/commits/%s/pulls", owner, repo, commitSha);
        RestTemplate restTemplate = new RestTemplate();

        // Add authentication headers, error handling etc.
        // This is a skeleton; flesh out in next phase.

        return "PR info (placeholder)";
    }
}
