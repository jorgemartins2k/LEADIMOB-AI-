async function checkRepos() {
    try {
        const response = await fetch('https://api.github.com/users/jorgemartins2k/repos');
        const repos = await response.json();
        console.log("Repositories for jorgemartins2k:");
        repos.forEach(r => {
            console.log(`- ${r.name} (updated: ${r.updated_at})`);
        });
    } catch (e) {
        console.error(e);
    }
}
checkRepos();
