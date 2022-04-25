/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateProjectDraftIssueMutation, getFieldsUpdateQuery } from './queries';
import { parseDraftIssueResp } from './util';
import type { DraftIssue, Octokit, Project } from './types';

export interface UpdateProjectDraftIssueData {
    id: string;
    title?: string;
    body?: string;
    assigneeIds?: string[];
    fieldValuesByName?: Record<string, string>;
}

export async function updateProjectDraftIssue(octokit: Octokit, project: Project, data: UpdateProjectDraftIssueData): Promise<DraftIssue> {
    const { id, fieldValuesByName, ...input } = data;
    const {
        updateProjectDraftIssue: {
            draftIssue: { projectItem: draftIssueResp },
        },
    } = await octokit.graphql(updateProjectDraftIssueMutation, { draftIssueId: id, ...input });
    const draftIssue = parseDraftIssueResp(draftIssueResp, project.fieldsById);

    if (fieldValuesByName) {
        const response: any = await octokit.graphql(getFieldsUpdateQuery(project.fieldsById, fieldValuesByName), {
            projectId: project.id,
            itemId: draftIssueResp.id,
        });

        for (const key in response) {
            if (response[key].projectNextItem) {
                return parseDraftIssueResp(response[key].projectNextItem, project.fieldsById);
            }
        }
    }

    return draftIssue;
}
