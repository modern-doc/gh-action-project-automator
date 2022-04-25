/* eslint-disable @typescript-eslint/no-explicit-any */
import { addProjectDraftIssueMutation, getFieldsUpdateQuery } from './queries';
import type { DraftIssue, Octokit, Project } from './types';
import { getIssueFieldValues } from './util';
import * as core from '@actions/core';

export interface AddProjectDraftIssueData {
    title: string;
    body?: string;
    assigneeIds?: string[];
    fieldValues?: Record<string, string>;
}

export async function addProjectDraftIssue(octokit: Octokit, project: Project, data: AddProjectDraftIssueData): Promise<DraftIssue> {
    const { fieldValues: newFieldValues, ...input } = data;
    const {
        addProjectDraftIssue: { projectNextItem: issue },
    } = await octokit.graphql(addProjectDraftIssueMutation, { projectId: project.id, ...input });
    if (newFieldValues) {
        core.debug(JSON.stringify(project.fields, null, 2));
        const response = await octokit.graphql(getFieldsUpdateQuery(project.fields, newFieldValues), {
            projectId: project.id,
            itemId: issue.id,
        });
        core.debug(JSON.stringify(response, null, 2));
    }

    const { Title, ...fieldValues } = getIssueFieldValues(issue, project.fields);
    return {
        id: issue.id,
        title: Title,
        fieldValues,
    };
}
