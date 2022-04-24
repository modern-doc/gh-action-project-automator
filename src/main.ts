import * as core from '@actions/core';
import * as github from '@actions/github';
import { getProjectWithCards } from './projects-sdk/get-project-with-cards';

interface Input {
    ghToken: string;
    owner: string;
    projectNumber: number;
}

export function getInputs(): Input {
    if (!github.context) throw new Error('No GitHub context.');
    if (!github.context.payload) throw new Error('No event. Make sure this is an issue or pr event.');

    const input = {} as Record<string, string>;
    const requiredInputs: (keyof Input)[] = ['ghToken', 'projectNumber'];
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
    } as Input;
}

async function run(): Promise<void> {
    try {
        const { ghToken, projectNumber, owner } = getInputs();
        const octokit = github.getOctokit(ghToken);
        const project = getProjectWithCards(octokit, { projectNumber, owner });
        core.debug(JSON.stringify(project, null, 2));
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run();
