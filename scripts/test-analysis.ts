import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getRepoData } from '../src/lib/github/client';
import { analyzeRepo } from '../src/lib/llm/client';

async function main() {
    try {
        console.log("Fetching repo data for 'facebook/react'..."); // Use a known public repo
        const repoData = await getRepoData('facebook', 'react');
        console.log("Repo data fetched via GitHub API.");

        console.log("Running analysis...");
        const result = await analyzeRepo(repoData);
        console.log("Analysis result:", JSON.stringify(result, null, 2));
        console.log("SUCCESS: Real analysis returned.");

    } catch (error) {
        console.error("Script failed:", error);
    }
}

main();
