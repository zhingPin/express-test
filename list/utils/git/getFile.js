// External function to get a file (no reliance on `this`)
export async function getFile(getApiUrl, fetchFromGitHub, filterFields, repoUrl, filePath, branch = "main", fields) {
    const apiUrl = `${getApiUrl(repoUrl)}/contents/${filePath}?ref=${branch}`;
    const fileResponse = await fetchFromGitHub(apiUrl);
    if (fileResponse.content) {
        const decodedContent = Buffer.from(fileResponse.content, "base64").toString("utf-8");
        return filterFields({ ...fileResponse, decodedContent }, fields);
    }
    return filterFields(fileResponse, fields);
}
