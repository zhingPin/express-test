// External function to list files (no reliance on `this`)
export async function listFiles(getApiUrl, fetchFromGitHub, filterFields, repoUrl, branch = "main", filePath = "", fields) {
    const apiUrl = `${getApiUrl(repoUrl)}/contents/${filePath}?ref=${branch}`;
    const files = await fetchFromGitHub(apiUrl);
    if (!Array.isArray(files)) {
        return [filterFields(files, fields)];
    }
    const allFiles = [];
    for (const file of files) {
        if (file.type === "file") {
            allFiles.push(filterFields(file, fields));
        }
        else if (file.type === "dir") {
            const nestedFiles = await listFiles(getApiUrl, fetchFromGitHub, filterFields, repoUrl, branch, file.path, fields);
            allFiles.push(...nestedFiles);
        }
    }
    return allFiles;
}
