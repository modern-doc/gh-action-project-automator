/* eslint-disable @typescript-eslint/no-explicit-any */
import { addProjectDraftIssueMutation, getFieldsUpdateQuery } from './queries';
import { parseDraftIssueResp } from './util';
import type { DraftIssue, Octokit, Project } from './types';
import * as core from '@actions/core';

export interface AddProjectDraftIssueData {
    title: string;
    body?: string;
    assigneeIds?: string[];
    fieldValuesByName?: Record<string, string>;
}

export async function addProjectDraftIssue(octokit: Octokit, project: Project, data: AddProjectDraftIssueData): Promise<DraftIssue> {
    const { fieldValuesByName, ...input } = data;
    const {
        addProjectDraftIssue: { projectNextItem: draftIssueResp },
    } = await octokit.graphql(addProjectDraftIssueMutation, { projectId: project.id, ...input });
    const draftIssue = parseDraftIssueResp(draftIssueResp, project.fieldsById);

    if (fieldValuesByName) {
        core.debug(JSON.stringify(project.fieldsById, null, 2));
        const response = await octokit.graphql(getFieldsUpdateQuery(project.fieldsById, fieldValuesByName), {
            projectId: project.id,
            itemId: draftIssue.id,
        });
        core.debug(JSON.stringify(response, null, 2));
    }

    return draftIssue;
}
