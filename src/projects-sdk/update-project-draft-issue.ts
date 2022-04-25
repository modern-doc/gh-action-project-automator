/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateProjectDraftIssueMutation, getFieldsUpdateQuery } from './queries';
import { parseDraftIssueResp } from './util';
import type { DraftIssue, Octokit, Project } from './types';

export interface UpdateProjectDraftIssueData {
    databaseId: string;
    title?: string;
    body?: string;
    assigneeIds?: string[];
    fieldValuesByName?: Record<string, string>;
}

export async function updateProjectDraftIssue(octokit: Octokit, project: Project, data: UpdateProjectDraftIssueData): Promise<DraftIssue> {
    const { databaseId, fieldValuesByName, ...input } = data;
    const {
        updateProjectDraftIssue: {
            draftIssue: { projectItem: draftIssueResp },
        },
    } = await octokit.graphql(updateProjectDraftIssueMutation, { draftIssueId: databaseId, ...input });
    const draftIssue = parseDraftIssueResp(draftIssueResp, project.fieldsById);

    if (fieldValuesByName) {
        const response: any = await octokit.graphql(getFieldsUpdateQuery(project.fieldsById, fieldValuesByName), {
            projectId: project.id,
            itemId: draftIssue.id,
        });

        for (const key in response) {
            if (response[key].projectNextItem) {
                return parseDraftIssueResp(response[key].projectNextItem, project.fieldsById);
            }
        }
    }

    return draftIssue;
}
