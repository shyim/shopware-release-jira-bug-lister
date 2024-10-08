# Map shopware jira issues to github for release notes

## requirements

- bun

## usage

- Download CSV of filtered issues from Jira: https://shopware.atlassian.net/issues/?jql=project%20%3D%20%22Shopware%20Next%22%20and%20fixVersion%20%3D%20%226.6.7.0%22%20and%20%22Public%5BDropdown%5D%22%20%3D%20Yes%20and%20type%20%3D%20Bug%20and%20summary%20%21~%20%22Github%22

- Run `bun index.ts <path-to-csv> <github-token>`
- This will output in markdown all bugs fixed in that release
