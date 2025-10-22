type AnalyzeRequest = {
    code: string;
    filePath: string;
    startLine: number;
    endLine: number;
};

export async function sendAnalyzeRequest(request: AnalyzeRequest) {
    try {
        const response = await fetch('http://localhost:8080/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        if (!response.ok) {
            throw new Error(`Backend returned status ${response.status}`);
        }
        const data = await response.text();
        return data;
    } catch (error) {
        return `Error: ${(error as Error).message}`;
    }
}
