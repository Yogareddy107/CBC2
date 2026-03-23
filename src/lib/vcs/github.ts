import { RepoMetadata, VCSProvider } from "./types";

export class GitHubProvider implements VCSProvider {
    constructor(public baseUrl: string = "https://api.github.com") {}

    private headers(token?: string): HeadersInit {
        const h: HeadersInit = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CheckBeforeCommit-App"
        };
        const activeToken = token || process.env.GITHUB_TOKEN;
        if (activeToken) {
            h["Authorization"] = `Bearer ${activeToken}`;
        }
        return h;
    }

    async getRepoData(owner: string, repo: string, token?: string): Promise<RepoMetadata> {
        const h = this.headers(token);
        
        // 1. Fetch Repository Metadata
        const repoRes = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, { headers: h, cache: 'no-store' });
        if (!repoRes.ok) throw new Error(`GitHub API Error: ${repoRes.statusText}`);
        const repoData = await repoRes.json();

        // 2. Fetch File Tree
        const treeUrl = `${this.baseUrl}/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`;
        const treeRes = await fetch(treeUrl, { headers: h, cache: 'no-store' });
        const treeData = await treeRes.json();

        // 3. Fetch High-Value Content
        const [readme, packageJson, architecture, contributing] = await Promise.all([
            this.getFileContent(owner, repo, 'README.md', token).catch(() => this.getFileContent(owner, repo, 'readme.md', token)),
            this.getFileContent(owner, repo, 'package.json', token),
            this.getFileContent(owner, repo, 'architecture.md', token).catch(() => this.getFileContent(owner, repo, 'docs/architecture.md', token)),
            this.getFileContent(owner, repo, 'CONTRIBUTING.md', token)
        ]);

        return {
            name: repoData.name,
            owner: repoData.owner.login,
            description: repoData.description,
            stars: repoData.stargazers_count,
            language: repoData.language,
            isPrivate: repoData.private,
            defaultBranch: repoData.default_branch,
            tree: (treeData.tree || []).map((t: any) => t.path).slice(0, 1000),
            readme: readme.slice(0, 15000),
            packageJson: packageJson,
            architecture: architecture.slice(0, 10000),
            contributing: contributing.slice(0, 5000)
        };
    }

    async getFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
        const h = this.headers(token);
        const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, { headers: h, cache: 'no-store' });
        if (!res.ok) return "";
        const json = await res.json();
        if (json.content) {
            return Buffer.from(json.content, 'base64').toString('utf-8');
        }
        return "";
    }

    async listRepositories(token: string): Promise<any[]> {
        const h = this.headers(token);
        // Fetch repositories owned by the user (both public and private)
        const res = await fetch(`${this.baseUrl}/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator`, { headers: h, cache: 'no-store' });
        if (!res.ok) throw new Error(`GitHub API Error: ${res.statusText}`);
        const repos = await res.json();
        return repos.map((r: any) => ({
            id: r.id.toString(),
            name: r.name,
            owner: r.owner.login,
            description: r.description,
            isPrivate: r.private,
            url: r.html_url,
            stars: r.stargazers_count,
            language: r.language
        }));
    }

    async getPRData(owner: string, repo: string, prNumber: string, token?: string): Promise<any> {
        const h = this.headers(token);

        // 1. Fetch PR Metadata
        const prRes = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`, { headers: h, cache: 'no-store' });
        if (!prRes.ok) throw new Error(`Failed to fetch PR parameters: ${prRes.statusText}`);
        const prData = await prRes.json();

        // 2. Fetch PR Files with Diffs
        const filesRes = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`, { headers: h, cache: 'no-store' });
        if (!filesRes.ok) throw new Error(`Failed to fetch PR files: ${filesRes.statusText}`);
        const filesData = await filesRes.json();

        let diffs = filesData.map((f: any) => ({
            filename: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            patch: f.patch || "No textual diff available for this file."
        }));

        const allFilesSummary = diffs.map((d: any) => `${d.status.toUpperCase()}: ${d.filename} (+${d.additions} -${d.deletions})`);
        
        diffs.sort((a: any, b: any) => (b.additions + b.deletions) - (a.additions + a.deletions));
        diffs = diffs.slice(0, 30); 

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

    async postPRComment(owner: string, repo: string, prNumber: string, body: string, token?: string): Promise<any> {
        const h = {
            ...this.headers(token),
            "Content-Type": "application/json"
        };

        const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
            method: 'POST',
            headers: h as HeadersInit,
            body: JSON.stringify({ body })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(`Failed to post PR comment: ${error}`);
        }

        return await res.json();
    }

    async createBranch(owner: string, repo: string, baseBranch: string, newBranch: string, token?: string): Promise<void> {
        const h = this.headers(token);
        
        // Get base branch SHA
        const refRes = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`, { headers: h });
        if (!refRes.ok) throw new Error(`Failed to get base branch: ${refRes.statusText}`);
        const refData = await refRes.json();
        const sha = refData.object.sha;

        // Create new branch
        const createRes = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/refs`, {
            method: 'POST',
            headers: { ...h, "Content-Type": "application/json" } as HeadersInit,
            body: JSON.stringify({
                ref: `refs/heads/${newBranch}`,
                sha
            })
        });

        if (!createRes.ok) {
            const error = await createRes.text();
            throw new Error(`Failed to create branch: ${error}`);
        }
    }

    async updateFile(owner: string, repo: string, branch: string, path: string, content: string, message: string, token?: string): Promise<void> {
        const h = this.headers(token);

        // Get file SHA if it exists
        const fileRes = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers: h });
        let sha: string | undefined;
        if (fileRes.ok) {
            const fileData = await fileRes.json();
            sha = fileData.sha;
        }

        const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: { ...h, "Content-Type": "application/json" } as HeadersInit,
            body: JSON.stringify({
                message,
                content: Buffer.from(content).toString('base64'),
                branch,
                sha
            })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(`Failed to update file: ${error}`);
        }
    }

    async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string, token?: string): Promise<any> {
        const h = this.headers(token);
        const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
            method: 'POST',
            headers: { ...h, "Content-Type": "application/json" } as HeadersInit,
            body: JSON.stringify({
                title,
                body,
                head,
                base
            })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(`Failed to create PR: ${error}`);
        }

        return await res.json();
    }
}
