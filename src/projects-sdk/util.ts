/* eslint-disable @typescript-eslint/no-explicit-any */

import { DraftIssue, Issue } from './types';

export const getIssueRespFieldValuesByName = (issue: any, fieldsById: any) => {
    return issue.fieldValues.nodes.reduce((obj: Record<string, string>, fieldValue: any) => {
        const { name, settings } = fieldsById[fieldValue.projectField.id];
        obj[name] = Array.isArray(settings.options) ? settings.options.find((o: any) => o.id === fieldValue.value).name : fieldValue.value;
        return obj;
    }, {} as Record<string, string>);
};

export const escapeQuotes = (str: unknown) => {
    return String(str).replace(/\"/g, '\\"');
};

export const parseDraftIssueResp = (issueResp: any, fieldsById: any): DraftIssue => {
    const { Title, ...fieldValuesByName } = getIssueRespFieldValuesByName(issueResp, fieldsById);
    return {
        id: issueResp.id,
        databaseId: issueResp.databaseId,
        title: Title,
        fieldValuesByName,
    };
};

export const parseIssueResp = (issueResp: any, fieldsById: any): Issue => {
    const fieldValuesByName = getIssueRespFieldValuesByName(issueResp, fieldsById);
    delete fieldValuesByName.Title;
    const { number, title, url, closed } = issueResp.content;
    const labels = issueResp.content.labels.nodes.map((n: any) => n.name);
    const assignees = issueResp.content.assignees.nodes.map((n: any) => n.login);
    return {
        id: issueResp.id,
        databaseId: issueResp.databaseId,
        number,
        title,
        url,
        closed,
        labels,
        assignees,
        fieldValuesByName,
    };
};
