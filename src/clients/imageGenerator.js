import dotenv from 'dotenv';
dotenv.config();

export class ImageGenerator {
  constructor() {
    this.provider = process.env.IMAGE_PROVIDER || 'higgsfield';
    this.higgsfieldKey = process.env.HIGGSFIELD_API_KEY;
    this.replicateKey = process.env.REPLICATE_API_KEY;
  }

  async generateInfluencerImage(influencerProfile, scenario) {
    const prompt = `Professional photo of ${influencerProfile.name}, ${influencerProfile.description}, ${scenario}, high quality, realistic, Instagram style`;

    if (this.provider === 'higgsfield') {
      return this.generateWithHiggsfield(prompt);
    } else if (this.provider === 'replicate') {
      return this.generateWithReplicate(prompt);
    } else {
      return this.generatePlaceholder(influencerProfile, scenario);
    }
  }

  async generateWithHiggsfield(prompt) {
    const HIGGSFIELD_BASE_URL = 'https://api.higgsfield.ai/v1';
    
    try {
      const response = await fetch(`${HIGGSFIELD_BASE_URL}/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.higgsfieldKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'bytedance/seedream/v4/text-to-image',
          arguments: {
            prompt,
            resolution: '2K',
            aspect_ratio: '9:16',
            camera_fixed: false
          }
        })
      });

      const text = await response.text();
      console.log('Higgsfield status:', response.status);

      if (!text.startsWith('{')) {
        throw new Error('Invalid response from Higgsfield');
      }

      const result = JSON.parse(text);
      
      if (result.request_id) {
        console.log('Polling for result...');
        return this.pollHiggsfield(result.request_id);
      }
      
      return result;
    } catch (e) {
      console.log('Higgsfield failed, using placeholder:', e.message);
      return this.generatePlaceholderPrompt(prompt);
    }
  }

  async pollHiggsfield(requestId) {
    const HIGGSFIELD_BASE_URL = 'https://api.higgsfield.ai/v1';
    const maxAttempts = 30;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${HIGGSFIELD_BASE_URL}/generations/${requestId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Key ${this.higgsfieldKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        const status = await response.json();
        console.log('Status:', status.status);
        
        if (status.status === 'completed') {
          return status;
        }
        if (status.status === 'failed') {
          throw new Error('Generation failed');
        }
        
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.log('Poll error:', e.message);
        break;
      }
    }
    
    return { status: 'timeout', message: 'Polling timed out' };
  }

  async generateWithReplicate(prompt) {
    if (!this.replicateKey) {
      return this.generatePlaceholderPrompt(prompt);
    }

    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.replicateKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: 'a8c6eb3c67d7a4c7a4e4b4b4a4e4b4b4a4e4b4b4a4e4b4b4a4e4b4b4a4e4b4b4',
          input: {
            prompt,
            width: 1024,
            height: 1536
          }
        })
      });
      return response.json();
    } catch (e) {
      return { error: e.message };
    }
  }

  generatePlaceholderPrompt(prompt) {
    const encodedPrompt = encodeURIComponent(prompt.substring(0, 50));
    return {
      status: 'placeholder',
      images: [{
        url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1536&nologin=true`
      }],
      prompt,
      note: 'Using Pollinations AI as fallback (Higgsfield unavailable)'
    };
  }

  generatePlaceholder(influencerProfile, scenario) {
    const encodedPrompt = encodeURIComponent(`${influencerProfile.name} ${scenario} professional photo`);
    return {
      status: 'placeholder',
      images: [{
        url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1536&nologin=true`
      }],
      profile: influencerProfile,
      scenario
    };
  }
}

export default ImageGenerator;