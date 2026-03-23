import { GitHubProvider } from "./github";
import { GitLabProvider } from "./gitlab";
import { BitbucketProvider } from "./bitbucket";
import { VCSProvider, detectProvider } from "./types";

export function getVCSProvider(url: string, baseUrl?: string): VCSProvider {
    const provider = detectProvider(url);
    switch (provider) {
        case 'github':
            return new GitHubProvider(baseUrl);
        case 'gitlab':
            return new GitLabProvider(baseUrl);
        case 'bitbucket':
            return new BitbucketProvider(); // Bitbucket Enterprise support can be added similarly if needed
        default:
            throw new Error(`Unsupported VCS provider for URL: ${url}`);
    }
}

export * from "./types";
