// Define the structure of the metadata response
/**
 * Fetches metadata for a given GitHub repository with dynamic fields.
 * @param {string} owner - The repository owner's username or organization.
 * @param {string} repo - The repository name.
 * @param {string[]} fields - The list of fields to include in the response.
 * @returns {Promise<GitRepoMetadata>} Repository metadata based on requested fields.
 */
export async function getGitRepoMetadata(owner, repo, fields = []) {
    try {
        // Fetch the data from GitHub API
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        const data = await response.json(); // This is the data that contains the repository details
        // Initialize the response object with the correct type
        const metadata = {};
        // If no fields are specified, return all available data
        if (fields.length === 0) {
            return {
                name: data.name,
                owner: data.owner.login,
                description: data.description,
                defaultBranch: data.default_branch,
                visibility: data.private ? "private" : "public",
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                latestCommit: data.pushed_at,
            };
        }
        // Add only the requested fields to the response object
        if (fields.includes("name"))
            metadata.name = data.name;
        if (fields.includes("owner"))
            metadata.owner = data.owner.login;
        if (fields.includes("description"))
            metadata.description = data.description;
        if (fields.includes("defaultBranch"))
            metadata.defaultBranch = data.default_branch;
        if (fields.includes("visibility"))
            metadata.visibility = data.private ? "private" : "public";
        if (fields.includes("createdAt"))
            metadata.createdAt = data.created_at;
        if (fields.includes("updatedAt"))
            metadata.updatedAt = data.updated_at;
        if (fields.includes("latestCommit"))
            metadata.latestCommit = data.pushed_at;
        return metadata;
    }
    catch (error) {
        console.error("Error fetching repository metadata:", error);
        throw new Error("Failed to fetch repository metadata");
    }
}
