import dotenv from 'dotenv';
dotenv.config();

const BLOTATO_BASE_URL = 'https://backend.blotato.com/v2';

export class BlotatoClient {
  constructor(apiKey = process.env.BLOTATO_API_KEY) {
    this.apiKey = apiKey;
    this.accountId = process.env.BLOTATO_ACCOUNT_ID;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'blotato-api-key': this.apiKey
    };
  }

  async getAccounts() {
    const response = await fetch(`${BLOTATO_BASE_URL}/users/me/accounts`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async post(content, platform, options = {}) {
    const payload = {
      post: {
        accountId: options.accountId || this.accountId,
        content: {
          text: content.text,
          mediaUrls: content.mediaUrls || [],
          platform
        },
        target: {
          targetType: platform,
          ...this.getPlatformOptions(platform, options)
        }
      },
      scheduledTime: options.scheduledTime || null,
      useNextFreeSlot: options.useNextFreeSlot || false
    };

    const response = await fetch(`${BLOTATO_BASE_URL}/posts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return response.json();
  }

  getPlatformOptions(platform, options) {
    const platformDefaults = {
      tiktok: {
        privacyLevel: options.privacyLevel || 'PUBLIC_TO_EVERYONE',
        disabledComments: options.disabledComments || false,
        disabledDuet: options.disabledDuet || false,
        disabledStitch: options.disabledStitch || false,
        isBrandedContent: options.isBrandedContent || false,
        isYourBrand: options.isYourBrand || false,
        isAiGenerated: options.isAiGenerated || true
      },
      instagram: {
        mediaType: options.mediaType || 'reel',
        altText: options.altText || '',
        shareToFeed: options.shareToFeed !== false
      },
      linkedin: {
        pageId: options.pageId || null
      },
      facebook: {
        pageId: options.pageId || null,
        link: options.link || null
      },
      pinterest: {
        boardId: options.boardId || '',
        title: options.pinTitle || '',
        link: options.link || null
      },
      youtube: {
        title: options.videoTitle || '',
        privacyStatus: options.privacyStatus || 'public',
        shouldNotifySubscribers: options.shouldNotifySubscribers !== false
      }
    };

    return platformDefaults[platform] || {};
  }

  async postToMultiplePlatforms(content, platforms) {
    const results = [];
    for (const platform of platforms) {
      try {
        const result = await this.post(content, platform);
        results.push({ platform, success: true, data: result });
      } catch (error) {
        results.push({ platform, success: false, error: error.message });
      }
    }
    return results;
  }

  async getPostStatus(postSubmissionId) {
    const response = await fetch(`${BLOTATO_BASE_URL}/posts/${postSubmissionId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getUploadHistory(profile) {
    const response = await fetch(`${BLOTATO_BASE_URL}/uploadposts/history?profile_username=${profile}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getAnalytics(profile, platforms = 'tiktok,instagram') {
    const response = await fetch(`${BLOTATO_BASE_URL}/analytics/${profile}?platforms=${platforms}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }
}

export default BlotatoClient;