import { DependencyNode } from "./dependency-graph";
import minimatch from 'minimatch';

export interface GovernanceRule {
    id: string;
    name: string;
    description: string;
    definition: {
        type: 'dependency' | 'module_structure';
        from: string; // glob pattern
        to: string;   // glob pattern
        prohibited: boolean;
    };
}

export interface GovernanceViolation {
    ruleId: string;
    ruleName: string;
    fromFile: string;
    toFile: string;
    severity: 'Error' | 'Warning';
    message: string;
}

/**
 * Checks a dependency graph against a set of governance rules.
 */
export function checkGovernanceRules(
    graph: Record<string, DependencyNode>,
    rules: GovernanceRule[]
): GovernanceViolation[] {
    const violations: GovernanceViolation[] = [];

    for (const rule of rules) {
        if (rule.definition.type === 'dependency') {
            const { from, to, prohibited } = rule.definition;

            // Iterate through every module in the graph
            Object.values(graph).forEach(node => {
                // Check if this module matches the 'from' pattern
                if (minimatch(node.file, from)) {
                    // Check all its dependencies
                    node.dependencies.forEach(dep => {
                        const isMatch = minimatch(dep, to);

                        if (prohibited && isMatch) {
                            // VIOLATION: Prohibited dependency found
                            violations.push({
                                ruleId: rule.id,
                                ruleName: rule.name,
                                fromFile: node.file,
                                toFile: dep,
                                severity: 'Error',
                                message: `Architectural Violation: '${node.file}' incorrectly imports '${dep}'. Rule: ${rule.description}`
                            });
                        } else if (!prohibited && !isMatch && node.dependencies.length > 0) {
                            // This is for "Must only import from" rules, but harder to implement generically
                            // For now we focus on "Prohibited" rules.
                        }
                    });
                }
            });
        }
    }

    return violations;
}
