import { GitHubFile } from "../../types/git-types.js";

// External function to list files (no reliance on `this`)
export async function listFiles(
  getApiUrl: (repoUrl: string) => string,
  fetchFromGitHub: <T>(url: string) => Promise<T>,
  filterFields: <T extends object>(data: T, fields?: string[]) => Partial<T>,
  repoUrl: string,
  branch = "main",
  filePath = "",
  fields?: string[]
): Promise<Partial<GitHubFile>[]> {
  const apiUrl = `${getApiUrl(repoUrl)}/contents/${filePath}?ref=${branch}`;
  const files = await fetchFromGitHub<GitHubFile[]>(apiUrl);

  if (!Array.isArray(files)) {
    return [filterFields(files, fields)];
  }

  const allFiles: Partial<GitHubFile>[] = [];
  for (const file of files) {
    if (file.type === "file") {
      allFiles.push(filterFields(file, fields));
    } else if (file.type === "dir") {
      const nestedFiles = await listFiles(
        getApiUrl,
        fetchFromGitHub,
        filterFields,
        repoUrl,
        branch,
        file.path,
        fields
      );
      allFiles.push(...nestedFiles);
    }
  }

  return allFiles;
}
