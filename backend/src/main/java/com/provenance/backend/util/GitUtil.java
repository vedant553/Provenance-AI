package com.provenance.backend.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;

public class GitUtil {
    public static String gitBlame(String filePath, int startLine, int endLine) {
        try {
            String command = String.format("git blame -L %d,%d %s", startLine, endLine, filePath);
            Process process = Runtime.getRuntime().exec(command);
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            process.waitFor();
            return sb.toString();
        } catch (Exception e) {
            return "Error running git blame: " + e.getMessage();
        }
    }
}
