import { RepoMetadata, VCSProvider, PullRequestMetadata } from "./types";

export class GitLabProvider implements VCSProvider {
    constructor(public baseUrl: string = "https://gitlab.com/api/v4") {}

    private headers(token?: string): HeadersInit {
        const h: HeadersInit = {
            "Content-Type": "application/json"
        };
        const activeToken = token || process.env.GITLAB_TOKEN;
        if (activeToken) {
            h["PRIVATE-TOKEN"] = activeToken;
        }
        return h;
    }

    async getRepoData(owner: string, repo: string, token?: string): Promise<RepoMetadata> {
        const h = this.headers(token);
        const projectPath = encodeURIComponent(`${owner}/${repo}`);
        
        const res = await fetch(`${this.baseUrl}/projects/${projectPath}`, { headers: h });
        if (!res.ok) throw new Error(`GitLab API Error: ${res.statusText}`);
        const data = await res.json();

        // Recursively fetch file tree
        const treeRes = await fetch(`${this.baseUrl}/projects/${projectPath}/repository/tree?recursive=true&per_page=100`, { headers: h });
        const tree = await treeRes.json();

        const defaultBranch = data.default_branch || 'main';

        return {
            name: data.name,
            owner: data.namespace.path,
            description: data.description,
            stars: data.star_count,
            language: null, // GitLab requires separate call for languages
            isPrivate: data.visibility === 'private',
            defaultBranch: defaultBranch,
            tree: (tree || []).map((t: any) => t.path),
            readme: await this.fetchReadme(owner, repo, defaultBranch, h),
            packageJson: "",
            architecture: "",
            contributing: ""
        };
    }

    private async fetchReadme(owner: string, repo: string, ref: string, headers: HeadersInit): Promise<string> {
        const projectPath = encodeURIComponent(`${owner}/${repo}`);
        const names = ['README.md', 'readme.md', 'README.txt', 'readme.txt', 'README'];
        for (const name of names) {
            const filePath = encodeURIComponent(name);
            const res = await fetch(`${this.baseUrl}/projects/${projectPath}/repository/files/${filePath}/raw?ref=${ref}`, { headers });
            if (res.ok) return await res.text();
        }
        return "";
    }

    async getFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
        const h = this.headers(token);
        const projectPath = encodeURIComponent(`${owner}/${repo}`);
        const filePath = encodeURIComponent(path);
        
        // Fetch project to get default branch if token is needed
        const projRes = await fetch(`${this.baseUrl}/projects/${projectPath}`, { headers: h });
        if (!projRes.ok) return "";
        const proj = await projRes.json();
        const ref = proj.default_branch || 'main';

        const res = await fetch(`${this.baseUrl}/projects/${projectPath}/repository/files/${filePath}/raw?ref=${ref}`, { headers: h });
        if (!res.ok) return "";
        return await res.text();
    }

    async listRepositories(token: string): Promise<any[]> {
        const h = this.headers(token);
        const res = await fetch(`${this.baseUrl}/projects?membership=true&owned=true`, { headers: h });
        if (!res.ok) throw new Error(`GitLab API Error: ${res.statusText}`);
        const projects = await res.json();
        return projects.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            owner: p.namespace.path,
            description: p.description,
            isPrivate: p.visibility === 'private',
            url: p.web_url,
            stars: p.star_count,
            language: null
        }));
    }

    async getPRData(_owner: string, _repo: string, _prNumber: string, _token?: string): Promise<PullRequestMetadata> {
        // TODO: Implement GitLab Merge Request fetching
        throw new Error("GitLab Merge Request analysis not yet fully implemented.");
    }

    async postPRComment(owner: string, repo: string, prNumber: string, body: string, token?: string): Promise<any> {
        const h = this.headers(token);
        const projectPath = encodeURIComponent(`${owner}/${repo}`);
        
        const res = await fetch(`${this.baseUrl}/projects/${projectPath}/merge_requests/${prNumber}/notes`, {
            method: 'POST',
            headers: h,
            body: JSON.stringify({ body })
        });

        if (!res.ok) throw new Error(`GitLab API Error: ${res.statusText}`);
        return await res.json();
    }

    async createBranch(_owner: string, _repo: string, _baseBranch: string, _newBranch: string, _token?: string): Promise<void> {
        // TODO: Implement GitLab branch creation
        throw new Error("GitLab branch creation not yet implemented.");
    }

    async updateFile(_owner: string, _repo: string, _branch: string, _path: string, _content: string, _message: string, _token?: string): Promise<void> {
        // TODO: Implement GitLab file update
        throw new Error("GitLab file update not yet implemented.");
    }

    async createPullRequest(_owner: string, _repo: string, _title: string, _body: string, _head: string, _base: string, _token?: string): Promise<any> {
        // TODO: Implement GitLab Merge Request creation
        throw new Error("GitLab Merge Request creation not yet implemented.");
    }
}
