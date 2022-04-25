import * as github from '@actions/github';
export type Octokit = ReturnType<typeof github.getOctokit>;

export interface Project {
    id: string;
    title: string;
    url: string;
    fields: Record<string, ProjectField>;
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
