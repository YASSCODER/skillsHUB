import axios from 'axios';

interface GitHubRepo {
  language: string | null;
  description: string | null;
  updated_at: string;
}

interface ValidatedSkill {
  name: string;
  reposCount: number;
  lastUsed: Date;
}

export class GitHubService {
  private static readonly API_URL = 'https://api.github.com';


static async validateSkill(username: string, skill: string): Promise<boolean> {
  try {
    const repos = await this.getUserRepos(username);  // Appel API GitHub
    // Vérifie que repos est bien un tableau
    if (!Array.isArray(repos)) throw new Error("Invalid repos format");

    return repos.some(repo => 
      repo.language?.toLowerCase() === skill.toLowerCase() || 
      (repo.description?.toLowerCase().includes(skill.toLowerCase()))
    );
  } catch (err) {
    console.error("validateSkill error:", err);
    throw err; // Remonte l’erreur pour que le controller la capture
  }
}


  static async scanUserSkills(username: string): Promise<ValidatedSkill[]> {
    const repos = await this.getUserRepos(username);
    const skillsMap = new Map<string, { count: number; lastUsed: Date }>();

    repos.forEach(repo => {
      if (!repo.language) return;

      const lang = repo.language.toLowerCase();
      const entry = skillsMap.get(lang) || { count: 0, lastUsed: new Date(0) };
      
      entry.count++;
      const repoDate = new Date(repo.updated_at);
      if (repoDate > entry.lastUsed) {
        entry.lastUsed = repoDate;
      }
      skillsMap.set(lang, entry);
    });

    return Array.from(skillsMap.entries()).map(([name, data]) => ({
      name,
      reposCount: data.count,
      lastUsed: data.lastUsed
    }));
  }

  private static async getUserRepos(username: string): Promise<GitHubRepo[]> {
    const response = await axios.get<GitHubRepo[]>(
      `${this.API_URL}/users/${username}/repos`,
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        timeout: 5000
      }
    );
    return response.data;
  }
}