/* eslint-disable @typescript-eslint/no-explicit-any */

export const getIssueFieldValues = (issue: any, fields: any) => {
    return issue.fieldValues.nodes.reduce((obj: Record<string, string>, fieldValue: any) => {
        const { name, settings } = fields[fieldValue.projectField.id];
        obj[name] = Array.isArray(settings.options) ? settings.options.find((o: any) => o.id === fieldValue.value).name : fieldValue.value;
        return obj;
    }, {} as Record<string, string>);
};

export const escapeQuotes = (str: unknown) => {
    return String(str).replace(/\"/g, '\\"');
};
