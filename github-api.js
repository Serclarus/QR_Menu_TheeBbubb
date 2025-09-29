// GitHub API Integration for Real-time Menu Updates
// This file handles automatic updates to menu-data.json via GitHub API

class GitHubAPI {
    constructor() {
        this.repository = 'Serclarus/QR_Menu_TheeBbubb';
        this.filePath = 'menu-data.json';
        this.token = null;
        this.baseURL = 'https://api.github.com';
    }

    // Set GitHub token (you'll need to create this)
    setToken(token) {
        this.token = token;
    }

    // Get the current content of menu-data.json
    async getCurrentContent() {
        try {
            const response = await fetch(`${this.baseURL}/repos/${this.repository}/contents/${this.filePath}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                content: data.content,
                sha: data.sha
            };
        } catch (error) {
            console.error('Error fetching current content:', error);
            throw error;
        }
    }

    // Update menu-data.json with new content
    async updateMenuData(newData) {
        try {
            // Get current file info
            const currentFile = await this.getCurrentContent();
            
            // Prepare new content
            const content = JSON.stringify(newData, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            
            // Update the file
            const response = await fetch(`${this.baseURL}/repos/${this.repository}/contents/${this.filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update menu data - ${new Date().toISOString()}`,
                    content: encodedContent,
                    sha: currentFile.sha
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
            }

            const result = await response.json();
            console.log('Menu data updated successfully via GitHub API');
            console.log('Commit SHA:', result.commit.sha);
            
            return {
                success: true,
                commitSha: result.commit.sha,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error updating menu data via GitHub API:', error);
            throw error;
        }
    }

    // Check if GitHub API is configured
    isConfigured() {
        return this.token !== null && this.token.length > 0;
    }

    // Get repository info
    async getRepositoryInfo() {
        try {
            const response = await fetch(`${this.baseURL}/repos/${this.repository}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching repository info:', error);
            throw error;
        }
    }
}

// Create global instance
window.githubAPI = new GitHubAPI();

// Helper function to save data via GitHub API
async function saveToGitHub(data) {
    if (!window.githubAPI.isConfigured()) {
        console.warn('GitHub API not configured. Please set up your GitHub token.');
        return false;
    }

    try {
        const result = await window.githubAPI.updateMenuData(data);
        console.log('Data saved to GitHub successfully:', result);
        return true;
    } catch (error) {
        console.error('Failed to save to GitHub:', error);
        return false;
    }
}

// Helper function to check GitHub API status
function checkGitHubStatus() {
    if (window.githubAPI.isConfigured()) {
        console.log('✅ GitHub API is configured and ready');
        return true;
    } else {
        console.log('❌ GitHub API not configured. Please set up your GitHub token.');
        return false;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GitHubAPI, saveToGitHub, checkGitHubStatus };
}
