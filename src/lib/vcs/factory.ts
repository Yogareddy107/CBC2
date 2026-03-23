import { GitHubProvider } from "./github";
import { GitLabProvider } from "./gitlab";
import { VCSProvider, detectProvider } from "./types";

export function getVCSProvider(url: string, baseUrl?: string): VCSProvider {
    const type = detectProvider(url);

    switch (type) {
        case 'github':
            return new GitHubProvider(baseUrl);
        case 'gitlab':
            return new GitLabProvider(baseUrl);
        default:
            throw new Error(`Unsupported VCS provider for URL: ${url}`);
    }
}
