import { createGitClient } from "../../git/createGitClient.js";
export const gitRepoReaderTool = {
    definition: {
        type: "function",
        function: {
            name: "read_git_repo",
            description: "Read metadata, files, or commits from a Git repository.",
            parameters: {
                type: "object",
                properties: {
                    repoUrl: {
                        type: "string",
                        description: "URL of the Git repository to read.",
                    },
                    branch: {
                        type: "string",
                        description: "Branch to operate on (default: 'main').",
                    },
                    filePath: {
                        type: "string",
                        description: "Path to a file or directory (optional).",
                    },
                    commitHash: {
                        type: "string",
                        description: "Specific commit hash for certain operations (optional).",
                    },
                    action: {
                        type: "string",
                        enum: [
                            "read_metadata",
                            "list_files",
                            "get_file",
                            "list_commits",
                            "diff",
                        ],
                        description: "Action to perform on the repository.",
                    },
                },
                required: ["repoUrl", "action"],
            },
        },
    },
    handler: async ({ repoUrl, branch, filePath, commitHash, action }) => {
        console.log("handler", await getGitrepo({ repoUrl, branch, filePath, commitHash, action }));
        return JSON.stringify(await getGitrepo({ repoUrl, branch, filePath, commitHash, action }));
    },
};
// Function that handles Git repo actions
async function getGitrepo({ repoUrl, branch = "main", filePath, commitHash, action, }) {
    // Initialize the Git client
    const gitClient = new createGitClient({ token: process.env.GIT_ACCESS });
    try {
        switch (action) {
            case "read_metadata":
                return await gitClient.readMetadata(repoUrl);
            case "list_files":
                return await gitClient.listFiles(repoUrl, branch, filePath);
            case "get_file":
                if (!filePath) {
                    throw new Error("filePath is required for the 'get_file' action.");
                }
                return await gitClient.getFile(repoUrl, filePath, branch);
            case "list_commits":
                return await gitClient.listCommits(repoUrl, branch);
            case "diff":
                if (!commitHash) {
                    throw new Error("commitHash is required for the 'diff' action.");
                }
                return await gitClient.getCommitDiff(repoUrl, commitHash);
            default:
                throw new Error(`Unsupported action: ${action}`);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`GitRepoReader Error [${action}]:`, error.message);
            throw new Error(`Error performing ${action} on the repository: ${error.message}`);
        }
        else {
            console.error("Unknown Error:", error);
            throw new Error("An unknown error occurred.");
        }
    }
}
// Example: List files with specific fields
// const gitClientExample = new createGitClient(process.env.GIT_ACCESS);
// const filteredFiles = await gitClientExample.listFiles(
//   "https://github.com/zhingPin/project-neo",
//   "main",
//   "",
//   ["name", "path", "size"]
// );
// console.log("Filtered Files:", filteredFiles);
// // Example: Get metadata with specific fields
// const metadata = await gitClientExample.readMetadata(
//   "https://github.com/zhingPin/project-neo",
//   ["name", "description", "stargazers_count"]
// );
// console.log("Filtered Metadata:", metadata);
