export async function getRepoData(owner: string, repo: string) {
    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
        "Accept": "application/vnd.github.v3+json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // 1. Fetch Repository Metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) throw new Error(`Failed to fetch repo: ${repoRes.statusText}`);
    const repoData = await repoRes.json();

    // 2. Fetch File Tree (Recursive, truncated)
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`, { headers });
    if (!treeRes.ok) throw new Error(`Failed to fetch tree: ${treeRes.statusText}`);
    const treeData = await treeRes.json();

    // 3. Helper for fetching file content safely
    async function fetchFileContent(path: string) {
        try {
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
            if (res.ok) {
                const json = await res.json();
                if (json.content) {
                    return Buffer.from(json.content, 'base64').toString('utf-8');
                }
            }
        } catch (e) {
            console.warn(`Failed to fetch ${path}`, e);
        }
        return "";
    }

    // 4. Fetch High-Value Content
    const [readme, packageJson, architecture, contributing] = await Promise.all([
        fetchFileContent('README.md').then(c => c || fetchFileContent('readme.md')),
        fetchFileContent('package.json'),
        fetchFileContent('architecture.md').then(c => c || fetchFileContent('docs/architecture.md')),
        fetchFileContent('CONTRIBUTING.md')
    ]);

    // 5. Build Enriched Response
    return {
        name: repoData.name,
        owner: repoData.owner.login,
        description: repoData.description,
        stars: repoData.stargazers_count,
        language: repoData.language,
        tree: (treeData.tree as { path: string }[]).map((t) => t.path).slice(0, 400),
        readme: readme.slice(0, 10000), // Enriched README context
        packageJson: packageJson,
        architecture: architecture.slice(0, 8000),
        contributing: contributing.slice(0, 5000)
    };
}

export async function getImpactRepoData(owner: string, repo: string, targetPath: string) {
    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
        "Accept": "application/vnd.github.v3+json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    async function fetchFileContent(path: string) {
        try {
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
            if (res.ok) {
                const json = await res.json();
                if (json.content) return Buffer.from(json.content, 'base64').toString('utf-8');
            }
        } catch (e) {
            console.warn(`Failed to fetch ${path}`, e);
        }
        return "";
    }

    const [repoRes, treeRes, targetContent, packageJson] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }).then(r => r.json()),
        fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, { headers }).then(r => r.json()).catch(() => ({ tree: [] })), // fallback if main doesn't exist, though idealized
        fetchFileContent(targetPath),
        fetchFileContent('package.json')
    ]);

    // Re-fetch tree with default_branch if main failed
    let tree = treeRes.tree;
    if (!tree || tree.length === 0) {
        const branchTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoRes.default_branch}?recursive=1`, { headers }).then(r => r.json());
        tree = branchTreeRes.tree || [];
    }

    return {
        name: repoRes.name,
        targetFilePath: targetPath,
        targetFileContent: targetContent.slice(0, 15000), // Enforce limit
        tree: (tree as { path: string }[]).map((t) => t.path).slice(0, 1000),
        packageJson: packageJson
    };
}
