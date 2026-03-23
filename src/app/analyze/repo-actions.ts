'use server';

import { createSessionClient } from "@/lib/appwrite";
import { GitHubProvider } from "@/lib/vcs/github";
import { GitLabProvider } from "@/lib/vcs/gitlab";
import { BitbucketProvider } from "@/lib/vcs/bitbucket";
import { RepoListItem } from "@/lib/vcs/types";

export async function getConnectedRepositories() {
    try {
        const { account } = await createSessionClient();
        const prefs = await account.getPrefs();
        
        const providers = [
            { id: 'github', provider: new GitHubProvider(), token: prefs?.github_token },
            { id: 'gitlab', provider: new GitLabProvider(), token: prefs?.gitlab_token },
            { id: 'bitbucket', provider: new BitbucketProvider(), token: prefs?.bitbucket_token },
        ];

        console.log("DEBUG: Repository Browser Prefs check:", {
            hasGithub: !!prefs?.github_token,
            hasGitlab: !!prefs?.gitlab_token,
            hasBitbucket: !!prefs?.bitbucket_token
        });

        const allRepos: (RepoListItem & { provider: string })[] = [];

        await Promise.all(providers.map(async (p) => {
            if (p.token) {
                try {
                    console.log(`DEBUG: Fetching repos for ${p.id}...`);
                    const repos = await p.provider.listRepositories(p.token);
                    console.log(`DEBUG: Successfully fetched ${repos.length} repos for ${p.id}`);
                    allRepos.push(...repos.map(r => ({ ...r, provider: p.id })));
                } catch (err) {
                    console.error(`Failed to fetch repos for ${p.id}:`, err);
                }
            } else {
                console.log(`DEBUG: No token found for provider ${p.id}`);
            }
        }));

        // Sort by most recently updated if possible, or just alphabetically
        return allRepos.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error fetching connected repositories:", error);
        return [];
    }
}
