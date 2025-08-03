import { Octokit } from "octokit";
const octokit = new Octokit();
/**
 * Fetches pull request data for a given GitHub repository with dynamic fields.
 * @param {string} owner - The repository owner's username or organization.
 * @param {string} repo - The repository name.
 * @param {string[]} fields - The list of fields to include in the response.
 * @returns {Promise<any>} Pull request data based on requested fields.
 */
export async function getGitRepoPullRequests(owner, repo, fields = []) {
    try {
        const { data } = await octokit.log.list({ owner, repo });
        // Initialize the response object
        const pullRequests = [];
        // Process pull requests and return only the requested fields
        for (const pr of data) {
            const prData = {};
            if (fields.length === 0) {
                // If no fields are specified, return all available pull request data
                prData.id = pr.id;
                prData.title = pr.title;
                prData.state = pr.state;
                prData.createdAt = pr.created_at;
                prData.updatedAt = pr.updated_at;
                prData.user = pr.user.login;
                pullRequests.push(prData);
                continue;
            }
            if (fields.includes("id"))
                prData.id = pr.id;
            if (fields.includes("title"))
                prData.title = pr.title;
            if (fields.includes("state"))
                prData.state = pr.state;
            if (fields.includes("createdAt"))
                prData.createdAt = pr.created_at;
            if (fields.includes("updatedAt"))
                prData.updatedAt = pr.updated_at;
            if (fields.includes("user"))
                prData.user = pr.user.login;
            pullRequests.push(prData);
        }
        return pullRequests;
    }
    catch (error) {
        console.error("Error fetching pull requests:", error);
        throw new Error("Failed to fetch pull requests");
    }
}
