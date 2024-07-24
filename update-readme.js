const axios = require('axios');
const fs = require('fs');
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
    console.log(`Fetched ${orgRepoCounts[org]} repos for ${org}`); // Log count
  }
  
  let readme = fs.readFileSync('README.md', 'utf8');
  console.log('Readme before update:', readme); // Log before update

  const updateReadmeSection = (readme, startMarker, endMarker, countLine) => {
    const newCountSection = `${startMarker}\n${countLine}\n${endMarker}`;
    const regex = new RegExp(`${startMarker}[\s\S]*${endMarker}`);
    if (regex.test(readme)) {
      return readme.replace(regex, newCountSection);
    } else {
      return readme;
    }
  };

  readme = updateReadmeSection(readme, '<!-- TANNER-ASSENMACHER-MCCC-REPO-COUNT-START -->', '<!-- TANNER-ASSENMACHER-MCCC-REPO-COUNT-END -->', `Total Repositories (Tanner Assenmacher MCCC): ${orgRepoCounts['Tanner-Assenmacher-MCCC']}`);
  readme = updateReadmeSection(readme, '<!-- TANNER-ASSENMACHER-UCF-REPO-COUNT-START -->', '<!-- TANNER-ASSENMACHER-UCF-REPO-COUNT-END -->', `Total Repositories (Tanner Assenmacher UCF): ${orgRepoCounts['Tanner-Assenmacher-UCF']}`);

  console.log('Readme after update:', readme); // Log after update

  fs.writeFileSync('README.md', readme);
})();
