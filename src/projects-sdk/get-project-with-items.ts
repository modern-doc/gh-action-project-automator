/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProjectWithItemsQuery } from './queries';
import { getIssueFieldValues } from './util';
import type { Octokit, ProjectField, ProjectWithItems } from './types';

export interface GetProjectWithItemsRequest {
    owner: string;
    projectNumber: number;
}

export async function getProjectWithItems(octokit: Octokit, req: GetProjectWithItemsRequest): Promise<ProjectWithItems> {
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
        .map((issue: any) => {
            const fieldValues = getIssueFieldValues(issue, fields);
            delete fieldValues.Title;
            const { number, title, url, closed } = issue.content;
            const labels = issue.content.labels.nodes.map((n: any) => n.name);
            const assignees = issue.content.assignees.nodes.map((n: any) => n.login);
            return {
                id: issue.id,
                type: issue.type,
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
        url: projectNext.url,
        fields,
        draftIssues,
        issues,
    };
}
