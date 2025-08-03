import { GitHubFile } from "../../types/git-types.js";

// External function to get a file (no reliance on `this`)
export async function getFile(
  getApiUrl: (repoUrl: string) => string,
  fetchFromGitHub: <T>(url: string) => Promise<T>,
  filterFields: <T extends object>(data: T, fields?: string[]) => Partial<T>,
  repoUrl: string,
  filePath: string,
  branch = "main",
  fields?: string[]
): Promise<Partial<GitHubFile>> {
  const apiUrl = `${getApiUrl(repoUrl)}/contents/${filePath}?ref=${branch}`;
  const fileResponse = await fetchFromGitHub<GitHubFile>(apiUrl);

  if (fileResponse.content) {
    const decodedContent = Buffer.from(fileResponse.content, "base64").toString(
      "utf-8"
    );
    return filterFields({ ...fileResponse, decodedContent }, fields);
  }

  return filterFields(fileResponse, fields);
}
