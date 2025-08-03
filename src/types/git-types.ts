export type GitClientConfig = {
    token?: string; // Optional token
    baseUrl?: string; // Optional base URL for GitHub Enterprise
};

// Define types for GitHub API responses
export interface GitHubFile {
    name: string;
    path: string;
    type: string;
    content?: string; // Base64 encoded content for files
    [key: string]: any;
}

export interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author: { name: string; email: string; date: string };
    };
    [key: string]: any;
}

export interface GitRepoContributors {
    login: string;
    id: number;
    contributions: number;
    avatar_url: string;
    html_url: string;
}

export interface GitRepoMetadata {
    name?: string;
    owner?: string;
    description?: string;
    defaultBranch?: string;
    visibility?: string;
    createdAt?: string;
    updatedAt?: string;
    latestCommit?: string;
}
