
import fs from 'fs';
import { parse } from 'csv-parse';
import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";

if (process.argv.length < 4) {
    console.error('Usage: bun index.ts <csv-file-path> <github-token>');
    process.exit(1);
}

const ThrottledOctokit = Octokit.plugin(throttling);
const octokit = new Octokit({
    auth: process.argv[3],
    throttle: {
        onRateLimit: (retryAfter, options, octokit, retryCount) => {
          octokit.log.warn(
            `Request quota exhausted for request ${options.method} ${options.url}`
          );
    
          if (retryCount < 2) {
            // Retry twice after hitting a rate limit error, then give up
            octokit.log.info(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
        onSecondaryRateLimit: (retryAfter, options, octokit, retryCount) => {
          octokit.log.warn(
            `Secondary rate limit hit for request ${options.method} ${options.url}`
          );
    
          if (retryCount < 2) {
            // Retry twice after hitting a secondary rate limit error, then give up
            octokit.log.info(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
      },
});

async function searchIssue(jiraKey) {
    try {
        const searchQuery = `[created from ${jiraKey} repo:shopware/shopware`;
        const result = await octokit.rest.search.issuesAndPullRequests({
            q: searchQuery,
            per_page: 1,
        });

        if (result.data.total_count > 0) {
            const issue = result.data.items[0];
            console.log(`* [${jiraKey}](${issue.html_url}) - ${issue.title}`);
        }
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
    }
}

const csvFile = fs.readFileSync(process.argv[2], 'utf8');

const parsedLines = await new Promise((resolve, reject) => {
    parse(csvFile, {
        columns: true,
        skip_empty_lines: true
    }, (err, records) => {
        if (err) {
            reject(err);
        } else {
            resolve(records);
        }
    });
}) as { 'Issue key': string }[];

for (const record of parsedLines) {
    await searchIssue(record['Issue key']);
    await new Promise(resolve => setTimeout(resolve, 200));
}
