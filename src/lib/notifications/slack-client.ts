
/**
 * Slack Notification Client for real-time risk alerts.
 */
export async function sendHighRiskAlert(webhookUrl: string, data: {
    repoName: string;
    riskLevel: string;
    summary: string;
    reportUrl: string;
}) {
    if (!webhookUrl) return { success: false, error: "No webhook URL provided" };

    const payload = {
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🚨 High Risk Commit Detected"
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Repository:*\n${data.repoName}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Risk Level:*\n${data.riskLevel}`
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Summary:*\n${data.summary}`
                }
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "View Full Audit"
                        },
                        url: data.reportUrl,
                        style: "danger"
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Slack API error: ${response.statusText}`);
        }

        return { success: true };
    } catch (err: any) {
        console.error("Failed to send Slack alert:", err);
        return { success: false, error: err.message };
    }
}

/**
 * sendGovernanceNotice
 * Sends architectural violation alerts to Slack.
 */
export async function sendGovernanceNotice(webhookUrl: string, data: {
    repoName: string;
    violationCount: number;
    rulesViolated: string[];
    reportUrl: string;
}) {
    if (!webhookUrl) return { success: false, error: "No webhook URL provided" };

    const payload = {
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🛡️ Architectural Governance Alert"
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Repository:* ${data.repoName}\n*Violations Detected:* ${data.violationCount}`
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Rules Violated:*\n${data.rulesViolated.map(r => `• ${r}`).join('\n')}`
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "Architectural integrity is compromised. Please review the violations below and refactor to comply with team standards."
                }
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "View Governance Report"
                        },
                        url: data.reportUrl,
                        style: "primary"
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Slack API error: ${response.statusText}`);
        }

        return { success: true };
    } catch (err: any) {
        console.error("Failed to send Governance Slack alert:", err);
        return { success: false, error: err.message };
    }
}
