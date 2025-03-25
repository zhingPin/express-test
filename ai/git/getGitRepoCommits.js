import { Octokit } from "octokit";
const octokit = new Octokit();
/**
 * Fetches commit information for a given GitHub repository with dynamic fields.
 * @param {string} owner - The repository owner's username or organization.
 * @param {string} repo - The repository name.
 * @param {string[]} fields - The list of fields to include in the response.
 * @returns {Promise<any>} Commit data based on requested fields.
 */
export async function getGitRepoCommits(owner, repo, fields = []) {
    try {
        const { data } = await octokit.log.listCommits({ owner, repo });
        // Initialize the response object
        const commits = [];
        // Process commits and return only the requested fields
        for (const commit of data) {
            const commitData = {};
            if (fields.length === 0) {
                // If no fields are specified, return all available commit data
                commitData.sha = commit.sha;
                commitData.author = commit.commit.author.name;
                commitData.date = commit.commit.author.date;
                commitData.message = commit.commit.message;
                commits.push(commitData);
                continue;
            }
            if (fields.includes("sha"))
                commitData.sha = commit.sha;
            if (fields.includes("author"))
                commitData.author = commit.commit.author.name;
            if (fields.includes("date"))
                commitData.date = commit.commit.author.date;
            if (fields.includes("message"))
                commitData.message = commit.commit.message;
            commits.push(commitData);
        }
        return commits;
    }
    catch (error) {
        console.error("Error fetching repository commits:", error);
        throw new Error("Failed to fetch repository commits");
    }
}
