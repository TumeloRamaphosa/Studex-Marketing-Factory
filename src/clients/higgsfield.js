import dotenv from 'dotenv';
dotenv.config();

const HIGGSFIELD_BASE_URL = 'https://api.higgsfield.ai/v1';

export class HiggsfieldClient {
  constructor(apiKey = process.env.HIGGSFIELD_API_KEY) {
    this.apiKey = apiKey;
  }

  getHeaders() {
    return {
      'Authorization': `Key ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async generateImage(prompt, options = {}) {
    try {
      const response = await fetch(`${HIGGSFIELD_BASE_URL}/generations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: options.model || 'bytedance/seedream/v4/text-to-image',
          arguments: {
            prompt,
            resolution: options.resolution || '2K',
            aspect_ratio: options.aspectRatio || '9:16',
            camera_fixed: false
          }
        })
      });
      console.log('Higgsfield status:', response.status);
      const text = await response.text();
      if (!text.startsWith('{')) {
        console.log('Higgsfield response:', text.substring(0, 500));
        return { error: 'Invalid response', details: text };
      }
      return JSON.parse(text);
    } catch (e) {
      console.error('Higgsfield error:', e.message);
      return { error: e.message };
    }
  }

  async pollResult(requestId) {
    const response = await fetch(`${HIGGSFIELD_BASE_URL}/generations/${requestId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async subscribe(prompt, options = {}) {
    const result = await this.generateImage(prompt, options);
    if (result.request_id) {
      console.log('Polling for result...');
      while (true) {
        const status = await this.pollResult(result.request_id);
        console.log('Status:', status.status);
        if (status.status === 'completed') {
          return status;
        }
        if (status.status === 'failed') {
          throw new Error('Generation failed');
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    return result;
  }

  async imageToVideo(imageUrl, prompt, options = {}) {
    try {
      const response = await fetch(`${HIGGSFIELD_BASE_URL}/generations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: options.model || 'default',
          arguments: {
            input_image: imageUrl,
            prompt,
            duration: options.duration || 5
          }
        })
      });
      return response.json();
    } catch (e) {
      return { error: e.message };
    }
  }

  async createInfluencerProfile(name, description, style = 'realistic') {
    return { name, description, style, created_at: new Date().toISOString() };
  }

  async generateInfluencerImage(influencerProfile,场景) {
    const prompt = `Professional photo of ${influencerProfile.name}, ${influencerProfile.description}, ${场景}, high quality, realistic, Instagram style`;
    return this.subscribe(prompt, { resolution: '2K', aspectRatio: '9:16' });
  }
}

export default HiggsfieldClient;