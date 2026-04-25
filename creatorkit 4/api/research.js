export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, profile, chips } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  function buildSystem() {
    let s = `You are an expert content research assistant for digital creators. Research the given topic using web search and return ONLY a raw JSON array — no markdown, no backticks, no explanation before or after.`;

    if (profile && profile.niche) {
      s += `\n\nCREATOR PROFILE:`;
      if (profile.niche) s += `\nNiche: ${profile.niche}`;
      if (profile.platform) s += `\nPlatform: ${profile.platform}`;
      if (profile.audience) s += `\nAudience: ${profile.audience}`;
      if (profile.style) s += `\nContent Style: ${profile.style}`;
      if (profile.competitors) s += `\nCompetitors/Inspirations: ${profile.competitors}`;
      if (profile.extra) s += `\nExtra context: ${profile.extra}`;
      s += `\n\nTailor ALL research to fit this creator's niche, platform, and audience.`;
    }

    s += `\n\nReturn a JSON array of exactly 3 content ideas. Each object must have:
- title: a compelling video/post title
- type: one of "trending", "evergreen", "viral", "niche"
- why_it_works: 2 sentences why this resonates with this creator's audience
- content_angles: array of 3 unique angles to approach the topic
${chips && chips.hooks ? '- hook: one powerful opening hook line for the content\n' : ''}- search_insights: what people are actively searching/asking about this right now
${chips && chips.seo ? '- keywords: array of 5 SEO keywords\n' : ''}- sources_to_check: array of 3 platforms or communities to research (e.g. Reddit, Quora, YouTube)
- tags: array of 4 hashtags without the # symbol

Use web search to find what is actually trending NOW. Be specific and tailored, not generic.`;

    return s;
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system: buildSystem(),
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Research this topic for my content: "${topic}". Use web search to find what's trending right now, what people are asking, and what content gaps exist. Return only the JSON array.`
        }]
      })
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json();
      return res.status(anthropicRes.status).json({ error: err.error?.message || 'Anthropic API error' });
    }

    const data = await anthropicRes.json();
    const allText = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    const match = allText.match(/\[[\s\S]*\]/);
    if (!match) {
      return res.status(500).json({ error: 'Could not parse AI response. Please try again.' });
    }

    const ideas = JSON.parse(match[0]);
    return res.status(200).json({ ideas });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
