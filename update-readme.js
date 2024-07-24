const axios = require('axios');
const fs = require('fs');
const username = 'TannerAssenmacher';
const orgs = ['Tanner-Assenmacher-MCCC', 'Tanner-Assenmacher-UCF'];
const token = process.env.GH_TOKEN;
const headers = {
  'Authorization': `token ${token}`,
  'Accept': 'application/vnd.github.v3+json'
};
const getRepoCount = async (org) => {
  let page = 1;
  let repoCount = 0;
  let hasMoreRepos = true;
  while (hasMoreRepos) {
    const response = await axios.get(`https://api.github.com/orgs/${org}/repos?page=${page}&per_page=100`, { headers });
    repoCount += response.data.length;
    if (response.data.length < 100) {
      hasMoreRepos = false;
    }
    page++;
  }
  return repoCount;
};
(async () => {
  let orgRepoCounts = {};
  for (const org of orgs) {
    orgRepoCounts[org] = await getRepoCount(org);
  }
  const getPersonalRepoCount = async () => {
    let page = 1;
    let repoCount = 0;
    let hasMoreRepos = true;
    while (hasMoreRepos) {
      const response = await axios.get(`https://api.github.com/users/${username}/repos?page=${page}&per_page=100`, { headers });
      repoCount += response.data.length;
      if (response.data.length < 100) {
        hasMoreRepos = false;
      }
      page++;
    }
    return repoCount;
  };
  const personalRepoCount = await getPersonalRepoCount();
  let readme = fs.readFileSync('README.md', 'utf8');
  const updateReadme = (readme, startMarker, endMarker, countLine) => {
    const newCountSection = `${startMarker}\n${countLine}\n${endMarker}`;
    const regex = new RegExp(`${startMarker}[\s\S]*${endMarker}`);
    if (regex.test(readme)) {
      readme = readme.replace(regex, newCountSection);
    } else {
      readme += `\n\n${newCountSection}`;
    }
    return readme;
  };
  readme = updateReadme(readme, '<!-- PERSONAL-REPO-COUNT-START -->', '<!-- PERSONAL-REPO-COUNT-END -->', `Total Repositories (Personal): ${personalRepoCount}`);
  for (const org in orgRepoCounts) {
    const orgLabel = org.replace(/-/g, ' '); // Replace dashes with spaces for better readability
    readme = updateReadme(readme, `<!-- ${orgLabel.toUpperCase()}-REPO-COUNT-START -->`, `<!-- ${orgLabel.toUpperCase()}-REPO-COUNT-END -->`, `Total Repositories (${orgLabel}): ${orgRepoCounts[org]}`);
  }
  fs.writeFileSync('README.md', readme);
})();
