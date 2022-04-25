import * as core from '@actions/core';
import * as github from '@actions/github';
//import { addProjectDraftIssue } from './projects-sdk/add-project-draft-issue';
//import { addProjectDraftIssue } from './projects-sdk/add-project-draft-issue';
import { getProjectWithItems } from './projects-sdk/get-project-with-items';
import { updateProjectDraftIssue } from './projects-sdk/update-project-draft-issue';
//import { updateProjectDraftIssue } from './projects-sdk/update-project-draft-issue';

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
        const { ghToken, overviewProjectNumber, owner } = getInputs();
        const octokit = github.getOctokit(ghToken);
        //const project = await getProjectWithItems(octokit, { projectNumber, owner });
        const overviewProject = await getProjectWithItems(octokit, { projectNumber: overviewProjectNumber, owner });
        //core.debug(JSON.stringify(project, null, 2));
        //core.debug(JSON.stringify(overviewProject, null, 2));
        const updatedIssue = await updateProjectDraftIssue(octokit, overviewProject, {
            id: 'DI_lADOBWbI3c4ABXNHzgAZGDc',
            body: 'Here is the OG body.',
            fieldValuesByName: {
                Team: 'Dev',
            },
        });
        core.debug(JSON.stringify(updatedIssue, null, 2));
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run();
