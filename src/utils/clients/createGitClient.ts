import { Octokit } from "octokit";
import { GitClientConfig, GitHubCommit, GitHubFile, GitRepoContributors, GitRepoMetadata } from "../../types/git-types.js";
import { listFiles } from "../git/getGitListFiles.js";
import { getFile } from "../git/getFile.js";
import { getGitRepoMetadata } from "../git/gitRepReader.js";
import { getGitRepoCommits } from "../git/getGitRepoCommits.js";
import { getGitRepoIssues } from "../git/getGitRepoIssues.js";



/**
 * Git client for interacting with GitHub API.
 */
export class createGitClient {
  private token: string | undefined;
  public octokit: Octokit;

  constructor(config: GitClientConfig) {
    this.token = config.token || process.env.GIT_ACCESS;
    if (!this.token) {
      console.warn(
        "GitHub token is not set. Only public repos will be accessible."
      );
    }
    this.octokit = new Octokit({ auth: this.token });
  }

  private getHeaders(): Record<string, string> {
    return this.token
      ? {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      }
      : {
        Accept: "application/vnd.github.v3+json",
      };
  }

  private async fetchFromGitHub<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, { headers: this.getHeaders() });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("GitHub API Error:", errorMessage);
        throw new Error(
          `Error fetching data: ${response.status} ${response.statusText}`
        );
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Fetch Error:", error.message);
        throw new Error(`Unable to fetch from GitHub: ${error.message}`);
      } else {
        console.error("Unexpected Error:", error);
        throw new Error(
          "An unknown error occurred while fetching from GitHub."
        );
      }
    }
  }

  private getApiUrl(repoUrl: string): string {
    return repoUrl.replace("github.com", "api.github.com/repos");
  }

  private filterFields<T extends object>(
    data: T,
    fields?: string[]
  ): Partial<T> {
    if (!fields || fields.length === 0) return data;
    return fields.reduce((filtered, key) => {
      if (key in data) {
        (filtered as any)[key] = (data as any)[key];
      }
      return filtered;
    }, {} as Partial<T>);
  }

  public async readMetadata(
    repoUrl: string,
    fields?: string[]
  ): Promise<Partial<any>> {
    const apiUrl = this.getApiUrl(repoUrl);
    const metadata = await this.fetchFromGitHub<any>(apiUrl);
    return this.filterFields(metadata, fields);
  }

  // Refactored listFiles method using the external function
  public async listFiles(
    repoUrl: string,
    branch = "main",
    filePath = "",
    fields?: string[]
  ): Promise<Partial<GitHubFile>[]> {
    return listFiles(
      this.getApiUrl,
      this.fetchFromGitHub,
      this.filterFields,
      repoUrl,
      branch,
      filePath,
      fields
    );
  }

  // Refactored getFile method using the external function
  public async getFile(
    repoUrl: string,
    filePath: string,
    branch = "main",
    fields?: string[]
  ): Promise<Partial<GitHubFile>> {
    return getFile(
      this.getApiUrl,
      this.fetchFromGitHub,
      this.filterFields,
      repoUrl,
      filePath,
      branch,
      fields
    );
  }

  // New method to fetch metadata using the external function
  public async getGitRepoMetadata(
    owner: string,
    repo: string,
    fields: string[] = []
  ): Promise<GitRepoMetadata> {
    // Calling the external getGitRepoMetadata function
    return getGitRepoMetadata(owner, repo, fields);
  }

  public async getGitRepoCommits(
    owner: string,
    repo: string,
    fields: string[] = []
  ): Promise<Partial<any>> {
    try {
      return await getGitRepoCommits(owner, repo, fields);
    } catch (error) {
      console.error("Error fetching commits:", error);
      throw new Error("Failed to fetch repository commits.");
    }
  }

  public async getGitRepoIssues(
    owner: string,
    repo: string,
    fields: string[] = []
  ): Promise<any> {
    try {
      return await getGitRepoIssues(owner, repo, fields);
    } catch (error) {
      console.error("Error fetching repo issues:", error);
      throw new Error("Failed to fetch repository issues.");
    }
  }
  public async listCommits(
    repoUrl: string,
    branch = "main",
    fields?: string[]
  ): Promise<Partial<GitHubCommit>[]> {
    const apiUrl = `${this.getApiUrl(repoUrl)}/commits?sha=${branch}`;
    const commits = await this.fetchFromGitHub<GitHubCommit[]>(apiUrl);
    return commits.map((commit) => this.filterFields(commit, fields));
  }

  public async getCommitDiff(
    repoUrl: string,
    commitHash: string,
    fields?: string[]
  ): Promise<Partial<GitHubCommit>> {
    const apiUrl = `${this.getApiUrl(repoUrl)}/commits/${commitHash}`;
    const diff = await this.fetchFromGitHub<GitHubCommit>(apiUrl);
    return this.filterFields(diff, fields);
  }

  // New method to fetch contributors
  public async getGitContributors(
    owner: string,
    repo: string,
    fields?: string[]
  ): Promise<GitRepoContributors[]> {
    try {
      // Fetch contributors using Octokit
      const { data } = await this.octokit.rest.repos.listContributors({
        owner,
        repo,
      });

      // Return the list of contributors with selected fields
      return data.map((contributor: any) => ({
        login: contributor.login,
        id: contributor.id,
        contributions: contributor.contributions,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url,
      }));
    } catch (error) {
      console.error("Error fetching contributors:", error);
      throw new Error("Failed to fetch contributors.");
    }
  }
}
