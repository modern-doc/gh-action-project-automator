import { getProjectWithItemsQuery } from './queries';
import type { Octokit } from './types';

export interface GetProjectWithCardsRequest {
    owner: string;
    projectNumber: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getProjectWithCards(octokit: Octokit, req: GetProjectWithCardsRequest): Promise<any> {
    const { projectNumber, owner } = req;
    const response = await octokit.graphql(getProjectWithItemsQuery, {
        org: owner,
        number: projectNumber,
    });

    return response;
}
