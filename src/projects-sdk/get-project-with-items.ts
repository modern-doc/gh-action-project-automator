/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProjectWithItemsQuery } from './queries';
import { parseDraftIssueResp, parseIssueResp } from './util';
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

    const fieldsById: Record<string, ProjectField> = {};
    const fieldsByName: Record<string, ProjectField> = {};

    projectNext.fields.nodes.forEach((field: any) => {
        fieldsById[field.id] = {
            id: field.id,
            name: field.name,
            settings: JSON.parse(field.settings || '{}'),
        };
        fieldsById[field.name] = fieldsById[field.id];
    });

    const draftIssues = projectNext.items.nodes
        .filter((item: any) => item.type === 'DRAFT_ISSUE')
        .map((issue: any) => parseDraftIssueResp(issue, fieldsById));

    const issues = projectNext.items.nodes
        .filter((item: any) => item.type === 'ISSUE')
        .map((issue: any) => parseIssueResp(issue, fieldsById));

    return {
        id: projectNext.id,
        title: projectNext.title,
        url: projectNext.url,
        fieldsById,
        fieldsByName,
        draftIssues,
        issues,
    };
}
