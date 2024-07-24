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
  const response = await axios.get(`https://api.github.com/orgs/${org}/repos`, { headers });
  return response.data.length;
};
(async () => {
  let orgRepoCounts = {};
  for (const org of orgs) {
    orgRepoCounts[org] = await getRepoCount(org);
  }
  const personalReposResponse = await axios.get(`https://api.github.com/users/${username}/repos`, { headers });
  const personalRepoCount = personalReposResponse.data.length;
  let readme = fs.readFileSync('README.md', 'utf8');
  const updateReadme = (readme, label, count) => {
    const countLine = `Total Repositories (${label}):`;
    const newCountLine = `${countLine} ${count}`;
    if (readme.includes(countLine)) {
      const regex = new RegExp(`${countLine} \d+`);
      readme = readme.replace(regex, newCountLine);
    } else {
      readme += `\n\n${newCountLine}`;
    }
    return readme;
  };
  readme = updateReadme(readme, 'Personal', personalRepoCount);
  for (const org in orgRepoCounts) {
    const orgLabel = org.replace(/-/g, ' '); // Replace dashes with spaces for better readability
    readme = updateReadme(readme, orgLabel, orgRepoCounts[org]);
  }
  fs.writeFileSync('README.md', readme);
})();
