/* eslint-disable @typescript-eslint/no-explicit-any */
import { addProjectDraftIssueMutation, getFieldsUpdateQuery } from './queries';
import { parseDraftIssueResp } from './util';
import type { DraftIssue, Octokit, Project } from './types';

export interface AddProjectDraftIssueData {
    title: string;
    body?: string;
    assigneeIds?: string[];
    fieldValuesByName?: Record<string, string>;
}

export async function addProjectDraftIssue(
    octokit: Octokit,
    project: Project,
    data: AddProjectDraftIssueData
): Promise<DraftIssue> {
    const { fieldValuesByName, ...input } = data;
    const {
        addProjectDraftIssue: { projectNextItem: draftIssueResp },
    } = await octokit.graphql(addProjectDraftIssueMutation, { projectId: project.id, ...input });
    const draftIssue = parseDraftIssueResp(draftIssueResp, project.fieldsById);

    if (fieldValuesByName) {
        const response: any = await octokit.graphql(getFieldsUpdateQuery(project.fieldsByName, fieldValuesByName), {
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
