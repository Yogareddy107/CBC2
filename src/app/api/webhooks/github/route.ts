import { NextRequest, NextResponse } from "next/server";
import { analyzeGitHubPR } from "@/lib/analysis/pr-analyzer";
import { postPRComment } from "@/lib/github/pr-client";
import { createHmac, timingSafeEqual } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-hub-signature-256");
        const secret = process.env.GH_WEBHOOK_SECRET;

        // 0. Verify Signature (if secret is configured)
        if (secret && signature) {
            const hmac = createHmac("sha256", secret);
            const digest = Buffer.from("sha256=" + hmac.update(body).digest("hex"), "utf8");
            const checksum = Buffer.from(signature, "utf8");

            if (checksum.length !== digest.length || !timingSafeEqual(digest, checksum)) {
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            }
        }

        const payload = JSON.parse(body);
        
        // 1. Identify Event Type
        const event = req.headers.get("x-github-event");
        
        if (event === "ping") {
            return NextResponse.json({ message: "pong" });
        }

        if (event === "pull_request") {
            const action = payload.action;
            // Only analyze on open or update
            if (action !== "opened" && action !== "synchronize") {
                return NextResponse.json({ message: `Ignoring PR action: ${action}` });
            }

            const prNumber = payload.pull_request.number.toString();
            const owner = payload.repository.owner.login;
            const repo = payload.repository.name;

            console.log(`Webhook: Analyzing PR ${owner}/${repo}#${prNumber}...`);

            // 2. Run Analysis (Centralized logic)
            const { analysis, isStateful, deterministicImpact } = await analyzeGitHubPR(owner, repo, prNumber);

            // 3. Format Markdown Comment
            const commentBody = formatPRComment(analysis, isStateful, deterministicImpact);

            // 4. Post Comment Back to GitHub
            await postPRComment(owner, repo, prNumber, commentBody);

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ message: `Ignoring event: ${event}` });

    } catch (err) {
        console.error("GitHub Webhook Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function formatPRComment(analysis: any, isStateful: boolean, deterministicImpact: any[]) {
    const riskEmoji = analysis.riskAssessment.level === 'Low' ? '✅' : analysis.riskAssessment.level === 'Medium' ? '⚠️' : '🚨';
    
    let body = `## 🧠 CBC Architectural Guardrail Review\n\n`;
    
    if (isStateful) {
        body += `> [!NOTE]\n> **Deep Sync Active**: This review is contextualized with historical codebase knowledge and hotspots.\n\n`;
    }

    body += `### ${riskEmoji} Risk Level: **${analysis.riskAssessment.level.toUpperCase()}**\n`;
    body += `${analysis.riskAssessment.reason}\n\n`;

    if (analysis.governanceAlerts && analysis.governanceAlerts.length > 0) {
        body += `## 🛡️ ARCHITECTURAL GOVERNANCE ALERT\n`;
        body += `**Critical violations detected against team policies:**\n\n`;
        analysis.governanceAlerts.forEach((g: any) => {
            const severityEmoji = g.severity === 'Error' ? '🔴' : '🟡';
            body += `${severityEmoji} **${g.ruleName}**: ${g.violation}\n`;
            body += `> 💡 **Advice**: ${g.advice}\n\n`;
        });
    }

    body += `### 📝 Summary\n${analysis.humanReadableSummary}\n\n`;

    if (analysis.hotspotAlerts && analysis.hotspotAlerts.length > 0) {
        body += `### 🏴󠁡󠁦󠁲󠁿 Hotspot Alerts\n`;
        body += `These files were previously identified as high-risk or architectural debt:\n`;
        analysis.hotspotAlerts.forEach((a: any) => {
            body += `- **${a.file}** (${a.riskType}): ${a.advice}\n`;
        });
        body += `\n`;
    }

    if (deterministicImpact && deterministicImpact.length > 0) {
        const topImpact = deterministicImpact.sort((a,b) => b.reach - a.reach).slice(0, 5);
        body += `### ☄️ Top Blast Radius (Deterministic)\n`;
        body += `| File | Reach | Impact Level |\n`;
        body += `|:---|:---:|:---:|\n`;
        topImpact.forEach(i => {
            body += `| \`${i.file}\` | ${i.reach} | ${i.risk} |\n`;
        });
        body += `\n`;
    }

    body += `### 🔍 Nitpicks & Suggestions\n`;
    analysis.nitpicksAndSuggestions.forEach((n: string) => {
        body += `- ${n}\n`;
    });

    body += `\n---\n*Sent by [CheckBeforeCommit](https://checkbeforecommit.com)*`;

    return body;
}
