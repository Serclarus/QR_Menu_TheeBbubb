// GitHub API Integration for Real-time Menu Updates
// This file handles automatic updates to menu-data.json via GitHub API

class GitHubAPI {
    constructor() {
        this.repository = 'Serclarus/QR_Menu_TheeBbubb';
        this.filePath = 'menu-data.json';
        this.token = null;
        this.baseURL = 'https://api.github.com';
    }

    // Set GitHub token (client-side storage)
    setToken(token) {
        this.token = token;
        // Store in localStorage for persistence
        if (token) {
            localStorage.setItem('githubToken', token);
            console.log('✅ GitHub token stored locally');
        }
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
            console.log('🔄 Starting GitHub API update...');
            
            // Get current file info with retry mechanism
            let currentFile;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    currentFile = await this.getCurrentContent();
                    console.log('✅ Current file info retrieved, SHA:', currentFile.sha);
                    break;
                } catch (error) {
                    retryCount++;
                    console.warn(`⚠️ Attempt ${retryCount} failed to get current file info:`, error.message);
                    if (retryCount >= maxRetries) {
                        throw new Error(`Failed to get current file info after ${maxRetries} attempts: ${error.message}`);
                    }
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }
            
            // Prepare new content with validation
            const content = JSON.stringify(newData, null, 2);
            console.log('📝 Content prepared, size:', content.length, 'characters');
            
            // Validate content size (GitHub has 100MB limit, but we'll be more conservative)
            if (content.length > 1000000) { // 1MB limit
                throw new Error('Content too large for GitHub API (over 1MB)');
            }
            
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            console.log('🔐 Content encoded, size:', encodedContent.length, 'characters');
            
            // Update the file with retry mechanism
            let response;
            retryCount = 0;
            
            while (retryCount < maxRetries) {
                try {
                    response = await fetch(`${this.baseURL}/repos/${this.repository}/contents/${this.filePath}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${this.token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'Content-Type': 'application/json',
                            'User-Agent': 'QR-Menu-Admin/1.0'
                        },
                        body: JSON.stringify({
                            message: `Update menu data - ${new Date().toISOString()}`,
                            content: encodedContent,
                            sha: currentFile.sha
                        })
                    });
                    
                    if (response.ok) {
                        break;
                    } else {
                        const errorData = await response.json();
                        console.warn(`⚠️ GitHub API error (attempt ${retryCount + 1}):`, response.status, errorData.message);
                        
                        // Check for specific error types
                        if (response.status === 409) {
                            // Conflict - file was modified by someone else
                            console.log('🔄 File conflict detected, refreshing and retrying...');
                            // Get fresh file info
                            currentFile = await this.getCurrentContent();
                            retryCount++;
                            continue;
                        } else if (response.status === 422) {
                            // Validation error - might be content encoding issue
                            throw new Error(`GitHub validation error: ${errorData.message}`);
                        } else if (response.status === 403) {
                            // Rate limit or permission error
                            if (errorData.message.includes('rate limit')) {
                                const resetTime = response.headers.get('X-RateLimit-Reset');
                                const waitTime = resetTime ? (parseInt(resetTime) * 1000 - Date.now()) : 60000;
                                console.log(`⏳ Rate limit hit, waiting ${waitTime}ms...`);
                                await new Promise(resolve => setTimeout(resolve, waitTime));
                                retryCount++;
                                continue;
                            } else {
                                throw new Error(`GitHub permission error: ${errorData.message}`);
                            }
                        } else {
                            throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
                        }
                    }
                } catch (error) {
                    retryCount++;
                    console.warn(`⚠️ Attempt ${retryCount} failed:`, error.message);
                    if (retryCount >= maxRetries) {
                        throw error;
                    }
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                }
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API error after retries: ${response.status} - ${errorData.message}`);
            }

            const result = await response.json();
            console.log('✅ Menu data updated successfully via GitHub API');
            console.log('📝 Commit SHA:', result.commit.sha);
            console.log('🕒 Timestamp:', new Date().toISOString());
            
            // Verify the save by checking the file content
            setTimeout(async () => {
                try {
                    const verifyFile = await this.getCurrentContent();
                    console.log('✅ Save verification: File SHA updated to', verifyFile.sha);
                } catch (error) {
                    console.warn('⚠️ Could not verify save:', error.message);
                }
            }, 2000);
            
            return {
                success: true,
                commitSha: result.commit.sha,
                timestamp: new Date().toISOString(),
                retryCount: retryCount
            };
        } catch (error) {
            console.error('❌ Error updating menu data via GitHub API:', error);
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

    // Test GitHub connection
    async testConnection() {
        try {
            if (!this.token) {
                throw new Error('No GitHub token provided');
            }

            const response = await fetch(`${this.baseURL}/repos/${this.repository}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                console.log('✅ GitHub connection successful');
                return true;
            } else {
                console.error('❌ GitHub connection failed:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ GitHub connection error:', error);
            return false;
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
