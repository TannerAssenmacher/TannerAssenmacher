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
  let totalRepos = 0;
  for (const org of orgs) {
    totalRepos += await getRepoCount(org);
  }
  const personalReposResponse = await axios.get(`https://api.github.com/users/${username}/repos`, { headers });
  totalRepos += personalReposResponse.data.length;
  let readme = fs.readFileSync('README.md', 'utf8');
  const repoCountLine = 'Total Repositories:';
  const newRepoCountLine = `${repoCountLine} ${totalRepos}`;
  if (readme.includes(repoCountLine)) {
    const regex = new RegExp(`${repoCountLine} \d+`);
    readme = readme.replace(regex, newRepoCountLine);
  } else {
    readme += `\n\n${newRepoCountLine}`;
  }
  fs.writeFileSync('README.md', readme);
})();
