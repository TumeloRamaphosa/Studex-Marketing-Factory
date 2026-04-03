import dotenv from 'dotenv';
dotenv.config();

const HIGGSFIELD_BASE_URL = 'https://platform.higgsfield.ai';

export class HiggsfieldClient {
  constructor(apiKey = process.env.HIGGSFIELD_API_KEY) {
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async generateImage(prompt, options = {}) {
    const response = await fetch(`${HIGGSFIELD_BASE_URL}/higgsfield-ai/soul/standard`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        prompt,
        aspect_ratio: options.aspectRatio || '9:16',
        resolution: options.resolution || '720p'
      })
    });
    return response.json();
  }

  async getGenerationResult(jobId) {
    const response = await fetch(`${HIGGSFIELD_BASE_URL}/generations/${jobId}`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  async imageToVideo(imageUrl, prompt, options = {}) {
    const response = await fetch(`${HIGGSFIELD_BASE_URL}/image-to-video`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        image_url: imageUrl,
        prompt,
        model: options.model || 'kling',
        duration: options.duration || 5
      })
    });
    return response.json();
  }

  async getVideoResult(jobId) {
    const response = await fetch(`${HIGGSFIELD_BASE_URL}/video-generations/${jobId}`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  async getSoulStyles() {
    const response = await fetch(`${HIGGSFIELD_BASE_URL}/soul-styles`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  async createInfluencerProfile(name, description, style = 'realistic') {
    const profile = {
      name,
      description,
      style,
      created_at: new Date().toISOString()
    };
    return profile;
  }

  async generateInfluencerImage(influencerProfile,场景) {
    const prompt = `Professional photo of ${influencerProfile.name}, ${influencerProfile.description}, ${场景}, high quality, realistic, Instagram style`;
    return this.generateImage(prompt, {
      model: 'flux',
      width: 1024,
      height: 1536
    });
  }
}

export default HiggsfieldClient;