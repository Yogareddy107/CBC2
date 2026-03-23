export async function getPRData(owner: string, repo: string, prNumber: string) {
    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
        "Accept": "application/vnd.github.v3+json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // 1. Fetch PR Metadata
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, { headers });
    if (!prRes.ok) throw new Error(`Failed to fetch PR parameters: ${prRes.statusText}`);
    const prData = await prRes.json();

    // 2. Fetch PR Files with Diffs
    const filesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`, { headers });
    if (!filesRes.ok) throw new Error(`Failed to fetch PR files: ${filesRes.statusText}`);
    const filesData = await filesRes.json();

    // Limit to prevent context window blowout
    let diffs = filesData.map((f: any) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch || "No textual diff available for this file."
    }));

    // If there are too many files, we truncate it but capture the metadata
    const allFilesSummary = diffs.map((d: any) => `${d.status.toUpperCase()}: ${d.filename} (+${d.additions} -${d.deletions})`);
    
    // Sort so we get the most complex patches first (most lines changed)
    diffs.sort((a: any, b: any) => (b.additions + b.deletions) - (a.additions + a.deletions));
    diffs = diffs.slice(0, 30); // Hard limit to avoiding token blowout

    return {
        prNumber: prData.number,
        title: prData.title,
        body: prData.body,
        state: prData.state,
        author: prData.user.login,
        repoFullName: `${owner}/${repo}`,
        summary: allFilesSummary,
        diffContext: diffs,
        totalFiles: filesData.length,
        additions: prData.additions,
        deletions: prData.deletions
    };
}

export async function postPRComment(owner: string, repo: string, prNumber: string, body: string) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN not configured for commenting.");

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
        method: 'POST',
        headers: {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ body })
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Failed to post PR comment: ${error}`);
    }

    return await res.json();
}
