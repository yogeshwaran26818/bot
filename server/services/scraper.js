const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class WebScraper {
  async scrapeAnchors(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const anchors = [];
      const seenUrls = new Set();

      $('a[href]').each((i, element) => {
        if (anchors.length >= 15) return false;

        const href = $(element).attr('href');
        const text = $(element).text().trim();

        if (!href || !text || text.length < 3) return;

        let fullUrl;
        try {
          fullUrl = new URL(href, url).href;
        } catch {
          return;
        }

        if (!seenUrls.has(fullUrl) && fullUrl.startsWith('http')) {
          seenUrls.add(fullUrl);
          anchors.push({
            url: fullUrl,
            text: text.substring(0, 200)
          });
        }
      });

      return anchors;
    } catch (error) {
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
  }

  async scrapeContent(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      $('script, style, nav, footer, header, aside').remove();
      
      const content = $('body').text()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000);

      return content;
    } catch (error) {
      console.error(`Failed to scrape content from ${url}:`, error.message);
      return '';
    }
  }
}

module.exports = new WebScraper();