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

  // Ajoutez cette méthode manquante
  static async validateSkill(username: string, skill: string): Promise<boolean> {
    const repos = await this.getUserRepos(username);
    return repos.some(repo => 
      repo.language?.toLowerCase() === skill.toLowerCase() || 
      repo.description?.toLowerCase().includes(skill.toLowerCase())
    );
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