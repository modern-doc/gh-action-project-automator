import * as core from '@actions/core';
import * as github from '@actions/github';
import { addProjectDraftIssue } from './projects-sdk/add-project-draft-issue';
import { getProjectWithItems } from './projects-sdk/get-project-with-items';
import { updateProjectDraftIssue } from './projects-sdk/update-project-draft-issue';

interface Input {
    ghToken: string;
    owner: string;
    projectNumber: number;
    overviewProjectNumber: number;
}

export function getInputs(): Input {
    if (!github.context) throw new Error('No GitHub context.');
    if (!github.context.payload) throw new Error('No event. Make sure this is an issue or pr event.');

    const input = {} as Record<string, string>;
    const requiredInputs: (keyof Input)[] = ['ghToken', 'projectNumber', 'overviewProjectNumber'];
    requiredInputs.forEach(prop => {
        input[prop] = core.getInput(prop);
        if (input[prop] === undefined) {
            throw new Error(`Missing required input: ${prop}`);
        }
    });

    return {
        ...input,
        owner: github.context.repo.owner,
        projectNumber: Number(input.projectNumber),
        overviewProjectNumber: Number(input.overviewProjectNumber),
    } as Input;
}

async function run(): Promise<void> {
    try {
        const { ghToken, projectNumber, overviewProjectNumber, owner } = getInputs();
        const octokit = github.getOctokit(ghToken);
        const project = await getProjectWithItems(octokit, { projectNumber, owner });

        const issueCountByTeam: Record<string, number> = {};

        let body = `\n --- \n`;
        body += `### Issue Summary`;

        project.issues.forEach(issue => {
            const { Team: team, Status: status } = issue.fieldValuesByName;
            if (issue.closed && status !== 'Done') return;
            if (team) {
                if (issueCountByTeam[team] === undefined) {
                    issueCountByTeam[team] = 0;
                }
                if (status === 'In Progress') {
                    issueCountByTeam[team]++;
                }
            }
            const strike = status === 'Done' ? '~~' : '';
            body += `\n+ [${strike}${issue.title} (${team || 'Team not Set'})${strike}](${issue.url})`;
        });

        body += '\n --- \n';

        const currentTeam = Object.entries(issueCountByTeam).sort(([, countA], [, countB]) => countB - countA)[0][0] || '';

        const overviewProject = await getProjectWithItems(octokit, { projectNumber: overviewProjectNumber, owner });

        core.debug(JSON.stringify(project.issues, null, 2));

        const existingOverviewIssue = overviewProject.draftIssues.find(i => i.title === project.title);

        if (existingOverviewIssue) {
            await updateProjectDraftIssue(octokit, overviewProject, {
                id: existingOverviewIssue.id,
                body,
                fieldValuesByName: {
                    Team: currentTeam,
                },
            });
        } else {
            await addProjectDraftIssue(octokit, overviewProject, {
                title: project.title,
                body,
                fieldValuesByName: {
                    Team: currentTeam,
                },
            });
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run();
