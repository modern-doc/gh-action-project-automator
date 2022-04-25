import * as github from '@actions/github';
export type Octokit = ReturnType<typeof github.getOctokit>;

export interface Project {
    id: string;
    title: string;
    url: string;
    fieldsById: Record<string, ProjectField>;
    fieldsByName: Record<string, ProjectField>;
}

export interface ProjectWithItems extends Project {
    draftIssues: DraftIssue[];
    issues: Issue[];
}

export interface ProjectField {
    id: string;
    name: string;
    settings: Record<string, unknown>;
}

export interface DraftIssue {
    id: string;
    databaseId: string;
    title: string;
    fieldValuesByName: Record<string, string>;
}

export interface Issue {
    id: string;
    databaseId: string;
    title: string;
    number: number;
    url: string;
    closed: boolean;
    labels: string[];
    assignees: string[];
    fieldValuesByName: Record<string, string>;
}
