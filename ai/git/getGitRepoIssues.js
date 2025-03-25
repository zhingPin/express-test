import { createGitClient } from "./createGitClient.js";
/**
 * Fetches issues data for a given GitHub repository with dynamic fields.
 * @param {string} owner - The repository owner's username or organization.
 * @param {string} repo - The repository name.
 * @param {string[]} fields - The list of fields to include in the response.
 * @returns {Promise<any>} Issue data based on requested fields.
 */
export async function getGitRepoIssues(owner, repo, fields = []) {
    try {
        // Create an instance of createGitClient with a token
        const gitClient = new createGitClient({ token: process.env.GIT_ACCESS });
        // Use the instance's octokit property
        const { data } = await gitClient.octokit.rest.issues.listForRepo({
            owner,
            repo,
        });
        const issues = [];
        for (const issue of data) {
            const issueData = {};
            if (fields.length === 0) {
                issueData.id = issue.id;
                issueData.title = issue.title;
                issueData.state = issue.state;
                issueData.createdAt = issue.created_at;
                issueData.updatedAt = issue.updated_at;
                issues.push(issueData);
                continue;
            }
            if (fields.includes("id"))
                issueData.id = issue.id;
            if (fields.includes("title"))
                issueData.title = issue.title;
            if (fields.includes("state"))
                issueData.state = issue.state;
            if (fields.includes("createdAt"))
                issueData.createdAt = issue.created_at;
            if (fields.includes("updatedAt"))
                issueData.updatedAt = issue.updated_at;
            issues.push(issueData);
        }
        return issues;
    }
    catch (error) {
        console.error("Error fetching repository issues:", error);
        throw new Error("Failed to fetch repository issues");
    }
}
