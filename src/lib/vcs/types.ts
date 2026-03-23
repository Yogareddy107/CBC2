export interface RepoMetadata {
    name: string;
    owner: string;
    description: string | null;
    stars: number;
    language: string | null;
    isPrivate: boolean;
    defaultBranch: string;
    tree: string[];
    readme: string;
    packageJson: string;
    architecture: string;
    contributing: string;
}

export interface RepoListItem {
    id: string;
    name: string;
    owner: string;
    description: string | null;
    isPrivate: boolean;
    url: string;
    stars: number;
    language: string | null;
}

export interface PullRequestMetadata {
    prNumber: number;
    title: string;
    body: string;
    state: string;
    author: string;
    repoFullName: string;
    summary: string[];
    diffContext: {
        filename: string;
        status: string;
        additions: number;
        deletions: number;
        patch: string;
    }[];
    totalFiles: number;
    additions: number;
    deletions: number;
}

export interface VCSProvider {
    baseUrl?: string;
    getRepoData(owner: string, repo: string, token?: string): Promise<RepoMetadata>;
    getFileContent(owner: string, repo: string, path: string, token?: string): Promise<string>;
    listRepositories(token: string): Promise<RepoListItem[]>;
    getPRData(owner: string, repo: string, prNumber: string, token?: string): Promise<PullRequestMetadata>;
    postPRComment(owner: string, repo: string, prNumber: string, body: string, token?: string): Promise<any>;
    createBranch(owner: string, repo: string, baseBranch: string, newBranch: string, token?: string): Promise<void>;
    updateFile(owner: string, repo: string, branch: string, path: string, content: string, message: string, token?: string): Promise<void>;
    createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string, token?: string): Promise<any>;
}

export function detectProvider(url: string): 'github' | 'gitlab' | 'bitbucket' | null {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('github')) return 'github';
    if (lowerUrl.includes('gitlab')) return 'gitlab';
    if (lowerUrl.includes('bitbucket')) return 'bitbucket';
    return null;
}
