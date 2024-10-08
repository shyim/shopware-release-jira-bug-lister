if (process.argv.length < 4) {
    console.error('Usage: bun index.ts <jira-email> <jira-token> <sw-version>');
    process.exit(1);
}

const jiraEmail = process.argv[2];
const jiraToken = process.argv[3];
const swVersion = process.argv[4];


const bodyData = {
  "jql": `project = "Shopware Next" AND fixVersion = ${swVersion} and "Public[Dropdown]" = Yes`,
  fields: ['summary', 'comment', "customfield_12101", "customfield_12100", "issuetype"]
}

const response = await fetch('https://shopware.atlassian.net/rest/api/3/search', {
  method: 'POST',
  body: JSON.stringify(bodyData),
  headers: {
    'Authorization': `Basic ${Buffer.from(
      `${jiraEmail}:${jiraToken}`
    ).toString('base64')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

const issues = await response.json();

const contributedUsers = {};

console.log("## Fixed bugs");
console.log("");

for (const issue of issues.issues) {
  const user = issue.fields.customfield_12101;

  if (!contributedUsers[user]) {
    contributedUsers[user] = [];
  }
  contributedUsers[user].push(issue);

  if (issue.fields.issuetype.name === 'Bug') {
    let githubIssue: string|null = null;

    issue.fields.comment.comments.forEach(comment => {

      if (comment.author.accountId === '712020:701732c3-697a-4e59-b86b-d341af27666b') {
        comment.body.content.forEach(content => {
          content.content.forEach(block => {
            const result = /\[created from (\d+)/gm.exec(block.text);

            if (result) {
              githubIssue = result[1];
            }
          });
        });
      }
    })

    if (githubIssue) {
      console.log(`* [${issue.key}](https://github.com/shopware/shopware/issues/${githubIssue}) - ${issue.fields.summary}`);
    }
  }
}

console.log("");
console.log('## Credits');
console.log("");

for (const user of Object.keys(contributedUsers)) {
  console.log(`* [${user}](https://github.com/${user})`);
}

console.log("");

console.log('Thanks to all diligent friends for helping us make Shopware better and better with each pull request!');
console.log("");
