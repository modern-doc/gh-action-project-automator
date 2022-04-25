/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProjectField } from './types';
import { escapeQuotes } from './util';

const queryIssuesAndPullRequestNodes = `
  id
  number
  title
  url
  createdAt
  databaseId
  assignees(first:10) {
    nodes {
      login
    }
  }
  labels(first:10){
    nodes {
      name
    }
  }
  closed
  closedAt
  createdAt
  milestone {
    number
    title
    state
  }
  repository {
    name
  }
`;

const queryProjectNodes = `
  id
  title
  description
  url
  fields(first: 50) {
    nodes {
      id
      name
      settings
    }
  }
`;

const queryContentNode = `
  content {
    __typename
    ... on Issue {
      ${queryIssuesAndPullRequestNodes}
    }
    ... on PullRequest {
      ${queryIssuesAndPullRequestNodes}
      merged
    }
  }
`;
export const queryItemFieldNodes = `
  id
  type
  ${queryContentNode}
  fieldValues(first: 20) {
    nodes {
      value
      projectField {
        id
      }
    }
  }
`;

export const getProjectWithItemsQuery = `
  query getProjectWithItems($org: String!, $number: Int!) {
    organization(login: $org) {
      projectNext(number: $number) {
        ${queryProjectNodes}
        items(first: 100) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            ${queryItemFieldNodes}
          }
        }
      }
    }
  }
`;

export const getProjectItemsPaginatedQuery = `
  query getProjectItems($org: String!, $number: Int!, $first: Int, $after: String) {
    organization(login: $org) {
      projectNext(number: $number) {
        items(first: $first, after: $after) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            ${queryItemFieldNodes}
          }
        }
      }
    }
  }
`;

export const getProjectCoreDataQuery = `
  query getProjectCoreData($org: String!, $number: Int!) {
    organization(login: $org) {
      projectNext(number: $number) {
        ${queryProjectNodes}
      }
    }
  }
`;

export const addIssueToProjectMutation = `
  mutation addIssueToProject($projectId:ID!, $contentId:ID!) {
    addProjectNextItem(input:{
      projectId:$projectId,
      contentId:$contentId
    }) {
      projectNextItem {
        ${queryItemFieldNodes}
      }
    }
  }
`;

export const removeItemFromProjectMutation = `
  mutation deleteProjectNextItem($projectId:ID!, $itemId:ID!) {
    deleteProjectNextItem(input:{
      projectId:$projectId,
      itemId:$itemId
    }) {
      clientMutationId
    }
  }
`;

export const addProjectDraftIssueMutation = `
  mutation addProjectDraftIssue($projectId:ID!, $title:String!, $body: String, $assigneeIds:[ID!]) {
    addProjectDraftIssue(input:{
      projectId:$projectId,
      title:$title,
      body:$body,
      assigneeIds:$assigneeIds
    }) {
      projectNextItem {
        ${queryItemFieldNodes}
      }
    }
  }
`;

export const updateProjectDraftIssueMutation = `
  mutation updateProjectDraftIssue($draftIssueId:ID!, $title:String, $body: String, $assigneeIds:[ID!]) {
    updateProjectDraftIssue(input:{
      draftIssueId:$draftIssueId,
      title:$title,
      body:$body,
      assigneeIds:$assigneeIds
    }) {
      projectNextItem {
        ${queryItemFieldNodes}
      }
    }
  }
`;

export function getFieldsUpdateQuery(fieldsByName: Record<string, ProjectField>, fieldValuesByName: Record<string, string>) {
    const updates = Object.entries(fieldValuesByName)
        .filter(([, fieldValue]) => fieldValue !== undefined)
        .map(([fieldName, fieldValue], index) => {
            const field = fieldsByName[fieldName];
            const valueOrOptionId = Array.isArray(field.settings.options)
                ? field.settings.options.find((o: any) => o.name === fieldValue).id
                : fieldValue;

            const queryNodes = !index ? `projectNextItem { ${queryItemFieldNodes} }` : 'clientMutationId';

            return `
${fieldName}: updateProjectNextItemField(input: {projectId: $projectId, itemId: $itemId, fieldId: "${field.id}", value: "${escapeQuotes(
                valueOrOptionId
            )}"}) {
  ${queryNodes}
}
`;
        })
        .join('');

    return `
    mutation setItemProperties($projectId: ID!, $itemId: ID!) {
      ${updates}
    }
  `;
}
