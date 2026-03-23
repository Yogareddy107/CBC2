/**
 * Core analysis engine for providing deterministic repository intelligence.
 */

export interface EntryPoint {
    file: string;
    type: string;
    description: string;
}

export interface ArchitectureMapping {
    frontend: string[];
    backend: string[];
    api: string[];
    logic: string[];
    database: string[];
    infrastructure: string[];
}

/**
 * Detects probable entry points based on file system signatures.
 */
export function detectEntryPoints(tree: string[]): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];
    const files = new Set(tree);

    // Next.js (App Router)
    if (files.has('src/app/page.tsx') || files.has('app/page.tsx')) {
        entryPoints.push({
            file: files.has('src/app/page.tsx') ? 'src/app/page.tsx' : 'app/page.tsx',
            type: 'Frontend (Next.js App Router)',
            description: 'Main landing page and root layout'
        });
    }

    // Next.js (Pages Router)
    if (files.has('pages/index.tsx') || files.has('src/pages/index.tsx')) {
        entryPoints.push({
            file: files.has('src/pages/index.tsx') ? 'src/pages/index.tsx' : 'pages/index.tsx',
            type: 'Frontend (Next.js Pages Router)',
            description: 'Main entry point for pages-based routing'
        });
    }

    // React/Vite/SPA
    if (files.has('src/main.tsx') || files.has('src/index.tsx')) {
        entryPoints.push({
            file: files.has('src/main.tsx') ? 'src/main.tsx' : 'src/index.tsx',
            type: 'Frontend (React SPA)',
            description: 'Client-side application bootstrap'
        });
    }

    // Node.js/Express Backend
    const backendEntryCandidates = ['server.ts', 'app.ts', 'index.ts', 'src/server.ts', 'src/app.ts', 'src/index.ts', 'main.py', 'app.py'];
    for (const candidate of backendEntryCandidates) {
        if (files.has(candidate)) {
            // Filter out common frontend-only index.ts
            if (candidate.includes('index.ts') && (files.has('src/app/page.tsx') || files.has('src/main.tsx'))) continue;
            
            entryPoints.push({
                file: candidate,
                type: 'Backend/API Entry',
                description: 'Server-side application entry point'
            });
            break; 
        }
    }

    return entryPoints;
}

/**
 * Maps repository files to architectural layers.
 */
export function mapArchitecture(tree: string[]): ArchitectureMapping {
    const mapping: ArchitectureMapping = {
        frontend: [],
        backend: [],
        api: [],
        logic: [],
        database: [],
        infrastructure: []
    };

    for (const path of tree) {
        const lower = path.toLowerCase();

        // Database
        if (lower.includes('db/') || lower.includes('schema') || lower.includes('migrations/') || lower.includes('models/')) {
            mapping.database.push(path);
        }
        // API Layer
        else if (lower.includes('api/') || lower.includes('routes/') || lower.includes('controllers/')) {
            mapping.api.push(path);
        }
        // Business Logic
        else if (lower.includes('services/') || lower.includes('logic/') || lower.includes('actions/') || lower.includes('use-cases/')) {
            mapping.logic.push(path);
        }
        // Frontend
        else if (lower.includes('components/') || lower.includes('hooks/') || lower.includes('pages/') || lower.includes('styles/')) {
            mapping.frontend.push(path);
        }
        // Infrastructure / Cloud
        else if (lower.includes('terraform/') || lower.includes('.tf') || lower.includes('serverless') || lower.includes('infra/') || lower.includes('kubernetes') || lower.includes('k8s/') || lower.includes('docker-compose') || lower.includes('cdk/') || lower.includes('amplify/')) {
            mapping.infrastructure.push(path);
        }
        // Generic Backend (catch-all for server-side if not categorized)
        else if (lower.includes('server/') || lower.includes('backend/') || lower.includes('services/')) {
            mapping.backend.push(path);
        }
    }

    return mapping;
}

/**
 * Generates a structured architecture flow string.
 */
export function generateArchitectureFlow(mapping: ArchitectureMapping): string {
    const flow = [];
    
    if (mapping.frontend.length > 0) flow.push("Frontend (UI/Components)");
    if (mapping.api.length > 0) flow.push("API Layer (Routes/Controllers)");
    if (mapping.logic.length > 0) flow.push("Business Logic (Services/Actions)");
    if (mapping.database.length > 0) flow.push("Database (Schema/Models)");
    if (mapping.infrastructure.length > 0) flow.push("Cloud Infrastructure (IaC)");

    return flow.join(" -> ");
}
