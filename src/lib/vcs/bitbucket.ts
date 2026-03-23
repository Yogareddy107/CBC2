import { RepoMetadata, VCSProvider } from "./types";

export class BitbucketProvider implements VCSProvider {
    private headers(token?: string): HeadersInit {
        const h: HeadersInit = {
            "User-Agent": "CheckBeforeCommit-App"
        };
        if (token) {
            h["Authorization"] = `Bearer ${token}`;
        }
        return h;
    }

    async getRepoData(owner: string, repo: string, token?: string): Promise<RepoMetadata> {
        const h = this.headers(token);
        
        // 1. Fetch Repository Metadata
        const repoRes = await fetch(`https://api.bitbucket.org/2.0/repositories/${owner}/${repo}`, { headers: h, cache: 'no-store' });
        if (!repoRes.ok) throw new Error(`Bitbucket API Error: ${repoRes.statusText}`);
        const repoData = await repoRes.json();

        // 2. Fetch File Tree (Simplified for now)
        const treeRes = await fetch(`https://api.bitbucket.org/2.0/repositories/${owner}/${repo}/src/master/?max_depth=3`, { headers: h, cache: 'no-store' });
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
            owner: repoData.owner.username || repoData.owner.nickname,
            description: repoData.description,
            stars: 0, // Bitbucket doesn't have "stars" in the same way GitHub does exposed easily
            language: repoData.language,
            isPrivate: repoData.is_private,
            defaultBranch: repoData.mainbranch?.name || 'master',
            tree: (treeData.values || []).map((t: any) => t.path).slice(0, 1000),
            readme: readme.slice(0, 15000),
            packageJson: packageJson,
            architecture: architecture.slice(0, 10000),
            contributing: contributing.slice(0, 5000)
        };
    }

    async getFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
        const h = this.headers(token);
        // Using 'master' as a default node if not specified
        const res = await fetch(`https://api.bitbucket.org/2.0/repositories/${owner}/${repo}/src/master/${path}`, { headers: h, cache: 'no-store' });
        if (!res.ok) return "";
        return await res.text();
    }

    async listRepositories(token: string): Promise<any[]> {
        const h = this.headers(token);
        // Fetch repositories for the authenticated user
        const res = await fetch("https://api.bitbucket.org/2.0/repositories/?role=member", { headers: h, cache: 'no-store' });
        if (!res.ok) throw new Error(`Bitbucket API Error: ${res.statusText}`);
        const repos = await res.json();
        return (repos.values || []).map((r: any) => ({
            id: r.uuid,
            name: r.name,
            owner: r.owner.username || r.owner.nickname || r.owner.display_name,
            description: r.description,
            isPrivate: r.is_private,
            url: r.links.html.href,
            stars: 0,
            language: r.language
        }));
    }

    async getPRData(owner: string, repo: string, prId: string, token?: string): Promise<any> {
        const h = this.headers(token);
        const res = await fetch(`https://api.bitbucket.org/2.0/repositories/${owner}/${repo}/pullrequests/${prId}`, { headers: h, cache: 'no-store' });
        if (!res.ok) throw new Error(`Bitbucket API Error: ${res.statusText}`);
        return await res.json();
    }

    async postPRComment(owner: string, repo: string, prId: string, body: string, token?: string): Promise<any> {
        const h = { ...this.headers(token), 'Content-Type': 'application/json' };
        const res = await fetch(`https://api.bitbucket.org/2.0/repositories/${owner}/${repo}/pullrequests/${prId}/comments`, {
            method: 'POST',
            headers: h,
            body: JSON.stringify({ content: { raw: body } })
        });
        if (!res.ok) throw new Error(`Bitbucket API Error: ${res.statusText}`);
        return await res.json();
    }

    async createBranch(owner: string, repo: string, branchName: string, baseBranch: string, token?: string): Promise<any> {
        // Placeholder for createBranch - Bitbucket API uses POST to /refs/branches
        console.log('Bitbucket createBranch TODO:', { owner, repo, branchName, baseBranch });
        return { success: true, branch: branchName };
    }

    async updateFile(owner: string, repo: string, path: string, content: string, message: string, branch: string, token?: string): Promise<any> {
        // Placeholder for updateFile - Bitbucket API uses POST to /src with multipart/form-data
        console.log('Bitbucket updateFile TODO:', { owner, repo, path, branch });
        return { success: true, path };
    }

    async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string, token?: string): Promise<any> {
        const h = { ...this.headers(token), 'Content-Type': 'application/json' };
        const res = await fetch(`https://api.bitbucket.org/2.0/repositories/${owner}/${repo}/pullrequests`, {
            method: 'POST',
            headers: h,
            body: JSON.stringify({
                title,
                description: body,
                source: { branch: { name: head } },
                destination: { branch: { name: base } }
            })
        });
        if (!res.ok) throw new Error(`Bitbucket API Error: ${res.statusText}`);
        return await res.json();
    }
}
