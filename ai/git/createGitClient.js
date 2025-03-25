import { Octokit } from "octokit";
import { getGitRepoCommits } from "./getGitRepoCommits.js";
import { getGitRepoMetadata } from "./gitRepReader.js";
import { getGitRepoIssues } from "./getGitRepoIssues.js";
import { listFiles } from "./getGitListFiles.js";
import { getFile } from "./getFile.js";
/**
 * Git client for interacting with GitHub API.
 */
export class createGitClient {
    token;
    octokit;
    constructor(config) {
        this.token = config.token || process.env.GIT_ACCESS;
        if (!this.token) {
            console.warn("GitHub token is not set. Only public repos will be accessible.");
        }
        this.octokit = new Octokit({ auth: this.token });
    }
    getHeaders() {
        return this.token
            ? {
                Authorization: `Bearer ${this.token}`,
                Accept: "application/vnd.github.v3+json",
            }
            : {
                Accept: "application/vnd.github.v3+json",
            };
    }
    async fetchFromGitHub(url) {
        try {
            const response = await fetch(url, { headers: this.getHeaders() });
            if (!response.ok) {
                const errorMessage = await response.text();
                console.error("GitHub API Error:", errorMessage);
                throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
            }
            return response.json();
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Fetch Error:", error.message);
                throw new Error(`Unable to fetch from GitHub: ${error.message}`);
            }
            else {
                console.error("Unexpected Error:", error);
                throw new Error("An unknown error occurred while fetching from GitHub.");
            }
        }
    }
    getApiUrl(repoUrl) {
        return repoUrl.replace("github.com", "api.github.com/repos");
    }
    filterFields(data, fields) {
        if (!fields || fields.length === 0)
            return data;
        return fields.reduce((filtered, key) => {
            if (key in data) {
                filtered[key] = data[key];
            }
            return filtered;
        }, {});
    }
    async readMetadata(repoUrl, fields) {
        const apiUrl = this.getApiUrl(repoUrl);
        const metadata = await this.fetchFromGitHub(apiUrl);
        return this.filterFields(metadata, fields);
    }
    // Refactored listFiles method using the external function
    async listFiles(repoUrl, branch = "main", filePath = "", fields) {
        return listFiles(this.getApiUrl, this.fetchFromGitHub, this.filterFields, repoUrl, branch, filePath, fields);
    }
    // Refactored getFile method using the external function
    async getFile(repoUrl, filePath, branch = "main", fields) {
        return getFile(this.getApiUrl, this.fetchFromGitHub, this.filterFields, repoUrl, filePath, branch, fields);
    }
    // New method to fetch metadata using the external function
    async getGitRepoMetadata(owner, repo, fields = []) {
        // Calling the external getGitRepoMetadata function
        return getGitRepoMetadata(owner, repo, fields);
    }
    async getGitRepoCommits(owner, repo, fields = []) {
        try {
            return await getGitRepoCommits(owner, repo, fields);
        }
        catch (error) {
            console.error("Error fetching commits:", error);
            throw new Error("Failed to fetch repository commits.");
        }
    }
    async getGitRepoIssues(owner, repo, fields = []) {
        try {
            return await getGitRepoIssues(owner, repo, fields);
        }
        catch (error) {
            console.error("Error fetching repo issues:", error);
            throw new Error("Failed to fetch repository issues.");
        }
    }
    async listCommits(repoUrl, branch = "main", fields) {
        const apiUrl = `${this.getApiUrl(repoUrl)}/commits?sha=${branch}`;
        const commits = await this.fetchFromGitHub(apiUrl);
        return commits.map((commit) => this.filterFields(commit, fields));
    }
    async getCommitDiff(repoUrl, commitHash, fields) {
        const apiUrl = `${this.getApiUrl(repoUrl)}/commits/${commitHash}`;
        const diff = await this.fetchFromGitHub(apiUrl);
        return this.filterFields(diff, fields);
    }
    // New method to fetch contributors
    async getGitContributors(owner, repo, fields) {
        try {
            // Fetch contributors using Octokit
            const { data } = await this.octokit.rest.repos.listContributors({
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
}
