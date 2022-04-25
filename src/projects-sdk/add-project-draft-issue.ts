/* eslint-disable @typescript-eslint/no-explicit-any */
import { addDraftIssueToProjectMutation } from './queries';
import { Octokit } from './types';

export interface AddProjectDraftIssueInput {
    projectId: string;
    title: string;
    body?: string;
    assigneeIds?: string[];
}

export async function addProjectDraftIssue(octokit: Octokit, input: AddProjectDraftIssueInput): Promise<any> {
    const response = await octokit.graphql(addDraftIssueToProjectMutation, input as any);
    return response;
}
