# Map shopware jira issues to github for release notes

## requirements

- bun

## usage

- Create a Jira API token at https://id.atlassian.com/manage-profile/security/api-tokens
- Run `bun index.ts <your-email> <the-token> <shopware-version>`
- This will output in markdown all bugs fixed in that release
