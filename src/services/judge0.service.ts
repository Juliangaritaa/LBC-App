export async function executeCode(langId: number, code: string) {
    
    const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            source_code: code,
            language_id: langId
        })
    });

    await validate(response);
    return response.json();
}

async function validate(res: any) {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);        
    }
    return res;
}