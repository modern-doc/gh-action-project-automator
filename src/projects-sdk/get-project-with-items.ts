/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProjectWithItemsQuery } from './queries';
import type { Octokit } from './types';

export interface ProjectField {
    id: string;
    name: string;
    settings: Record<string, unknown>;
}

export interface ProjectItem {
    id: string;
    type: 'ISSUE' | 'DRAFT_ISSUE';
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
    items: ProjectItem[];
}

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

    const items = projectNext.items.nodes.map((item: any) => {
        const fieldValues = item.fieldValues.nodes.reduce((obj: Record<string, string>, fieldValue: any) => {
            const { name, settings } = fields[fieldValue.projectField.id];
            obj[name] = Array.isArray(settings.options)
                ? settings.options.find((o: any) => o.id === fieldValue.value).name
                : fieldValue.value;
            return obj;
        }, {} as Record<string, string>);
        return {
            id: item.id,
            type: item.type,
            fieldValues,
        };
    });

    return {
        id: projectNext.id,
        title: projectNext.title,
        description: projectNext.description || '',
        url: projectNext.url,
        fields,
        items,
    };
}
