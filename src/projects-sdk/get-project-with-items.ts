/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProjectWithItemsQuery } from './queries';
import type { Octokit } from './types';

export interface ProjectField {
    id: string;
    name: string;
    settings: Record<string, unknown>;
}

export interface DraftIssue {
    id: string;
    title: string;
    fieldValues: Record<string, string>;
}

export interface Issue {
    id: string;
    title: string;
    number: number;
    url: string;
    closed: boolean;
    repository: string;
    labels: string[];
    assignees: string[];
    fieldValues: Record<string, string>;
}

export interface GetProjectWithItemsRequest {
    owner: string;
    projectNumber: number;
}

export interface GetProjectWithItemsResponse {
    id: string;
    title: string;
    description: string;
    url: string;
    fields: Record<string, ProjectField>;
    draftIssues: DraftIssue[];
    issues: Issue[];
}

export const getIssueFieldValues = (issue: any, fields: any) => {
    return issue.fieldValues.nodes.reduce((obj: Record<string, string>, fieldValue: any) => {
        const { name, settings } = fields[fieldValue.projectField.id];
        obj[name] = Array.isArray(settings.options) ? settings.options.find((o: any) => o.id === fieldValue.value).name : fieldValue.value;
        return obj;
    }, {} as Record<string, string>);
};

export async function getProjectWithItems(octokit: Octokit, req: GetProjectWithItemsRequest): Promise<GetProjectWithItemsResponse> {
    const { projectNumber, owner } = req;
    const {
        organization: { projectNext },
    } = await octokit.graphql(getProjectWithItemsQuery, {
        org: owner,
        number: projectNumber,
    });

    const fields = projectNext.fields.nodes.reduce((obj: Record<string, ProjectField>, field: any) => {
        obj[field.id] = {
            id: field.id,
            name: field.name,
            settings: JSON.parse(field.settings || '{}'),
        };
        return obj;
    }, {} as Record<string, ProjectField>);

    const draftIssues = projectNext.items.nodes
        .filter((item: any) => item.type === 'DRAFT_ISSUE')
        .map((issue: any) => {
            const { Title, ...fieldValues } = getIssueFieldValues(issue, fields);
            return {
                id: issue.id,
                title: Title,
                fieldValues,
            };
        });

    const issues = projectNext.items.nodes
        .filter((item: any) => item.type === 'ISSUE')
        .map((item: any) => {
            const fieldValues = getIssueFieldValues(item, fields);
            delete fieldValues.Title;
            const { number, title, url, closed } = item.content;
            const labels = item.content.labels.nodes;
            const assignees = item.content.assignees.nodes;
            return {
                id: item.id,
                type: item.type,
                number,
                title,
                url,
                closed,
                labels,
                assignees,
                fieldValues,
            };
        });

    return {
        id: projectNext.id,
        title: projectNext.title,
        description: projectNext.description || '',
        url: projectNext.url,
        fields,
        draftIssues,
        issues,
    };
}
