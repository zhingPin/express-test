import { Octokit } from "octokit";
// Instantiate Octokit with an optional authentication token
const octokit = new Octokit({ auth: process.env.GIT_ACCESS });
export async function getGitContributors(owner, repo) {
    try {
        // Fetch contributors from GitHub using Octokit
        const { data } = await octokit.rest.repos.listContributors({
            owner,
            repo,
        });
        // Return the list of contributors with selected fields
        return data.map((contributor) => ({
            login: contributor.login,
            id: contributor.id,
            contributions: contributor.contributions,
            avatar_url: contributor.avatar_url,
            html_url: contributor.html_url,
        }));
    }
    catch (error) {
        console.error("Error fetching contributors:", error);
        throw new Error("Failed to fetch contributors.");
    }
}
