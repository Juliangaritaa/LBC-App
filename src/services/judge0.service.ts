export async function executeCode(langId: number, code: string) {

    const URL = import.meta.env.PROXY_URL;

    const response = await fetch(URL, {
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