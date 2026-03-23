import { detectProvider } from "./types";

/**
 * Retrieves the appropriate VCS token from user preferences based on the repository URL.
 * @param repoUrl The repository URL to check
 * @param account The Appwrite account instance
 * @returns The token string or undefined
 */
export async function getVCSToken(repoUrl: string, account: any): Promise<string | undefined> {
    try {
        const prefs = await account.getPrefs();
        const providerType = detectProvider(repoUrl);
        if (!providerType) return undefined;
        
        // Map common provider names to their preference keys
        const key = `${providerType}_token`;
        return prefs[key];
    } catch (e) {
        console.warn("Failed to fetch user preferences for VCS token", e);
        return undefined;
    }
}
