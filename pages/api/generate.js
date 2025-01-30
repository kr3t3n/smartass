import Groq from "groq-sdk";
import supabase from "../../lib/supabaseClient";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Array of different writing styles
const WRITING_STYLES = [
  {
    style: "Tech Visionary",
    traits: "futuristic, bold predictions, tech buzzwords, disruption-focused"
  },
  {
    style: "Wellness Guru",
    traits: "mindful, spiritual, holistic wisdom, energy-focused"
  },
  {
    style: "Business Maverick",
    traits: "strategic, leadership-focused, success-oriented, bold statements"
  },
  {
    style: "Cultural Critic",
    traits: "analytical, witty observations, social commentary, intellectual"
  },
  {
    style: "Life Coach",
    traits: "motivational, action-oriented, empowering, direct"
  },
  {
    style: "Philosophy Nerd",
    traits: "deep thoughts, existential questions, abstract concepts, scholarly"
  },
  {
    style: "Trend Setter",
    traits: "cutting-edge, pop culture references, zeitgeist-aware, trendy"
  },
  {
    style: "Satirist",
    traits: "ironic, clever wordplay, subtle mockery, social criticism"
  }
];

function getRandomStyles(count = 3) {
  const shuffled = [...WRITING_STYLES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function generateSinglePost(prompt, style) {
  const systemPrompt = `You are a pretentious social media guru who crafts smart-sounding posts.
Write one post in the style of a "${style.style}" who is ${style.traits}.

Guidelines:
- Must be under 280 characters (max 2-3 sentences)
- Be overly clever and thought-provoking
- DON'T use hashtags and quotation marks
- Be assertive and confident
- Return ONLY the post text, nothing else

RULES: DO NOT USE QUOTATION MARKS OR HASHTAGS`;

  try {
    console.log(`🎯 Generating post for style: ${style.style}`);
    
    const completion = await Promise.race([
      groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.9,
        top_p: 0.9,
        max_tokens: 300,
        frequency_penalty: 0.7,
        presence_penalty: 0.7
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Generation timeout')), 30000)
      )
    ]);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Clean up the response
    const cleanedContent = content.trim()
      .split('\n')[0]
      .replace(/^[^:]+:\s*/, '')
      .replace(/^["']|["']$/g, '') // Remove any quotes at start/end
      .trim();

    if (!cleanedContent) {
      throw new Error('Empty content after cleanup');
    }

    if (cleanedContent.length > 280) {
      throw new Error(`Content too long: ${cleanedContent.length} chars`);
    }

    console.log(`✅ Generated post for ${style.style}: ${cleanedContent.substring(0, 50)}...`);
    return cleanedContent;
  } catch (error) {
    console.error(`❌ Failed to generate post for style ${style.style}:`, error.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check for required environment variables
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is not set');
    return res.status(500).json({ message: 'GROQ_API_KEY is not configured' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Supabase environment variables are not set');
    return res.status(500).json({ message: 'Supabase configuration is missing' });
  }

  const { prompt } = req.body;
  const userIp = req.headers["x-real-ip"] || req.connection.remoteAddress || "unknown";

  try {
    // Rate limiting check commented out for testing
    /* 
    const { data: logs, error: logsError } = await supabase
      .from("generation_logs")
      .select("created_at")
      .eq("ip_address", userIp)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (logsError) {
      console.error('⚠️ Error checking rate limit:', logsError);
      return res.status(500).json({ message: "Error checking rate limit: " + logsError.message });
    }

    if (logs && logs.length >= 3) {
      const oldestLog = new Date(logs[0].created_at);
      const timeUntilReset = new Date(oldestLog.getTime() + 60 * 60 * 1000) - new Date();
      const minutesLeft = Math.ceil(timeUntilReset / (60 * 1000));
      
      return res.status(429).json({ 
        message: `Rate limit exceeded. Try again in ${minutesLeft} minutes.`,
        resetInMinutes: minutesLeft
      });
    }
    */

    // 2) Validate prompt
    if (!prompt?.trim()) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // 3) Generate posts
    console.log('🤖 Generating posts...');
    
    // Get 4 random styles (one extra as backup)
    const selectedStyles = getRandomStyles(4);
    console.log('🎨 Selected styles:', selectedStyles.map(s => s.style).join(', '));

    // Generate posts in parallel with the extra style
    const outputs = await Promise.all(
      selectedStyles.map(style => generateSinglePost(prompt, style))
    );

    console.log('🔍 Raw outputs:', outputs);

    // Filter out nulls and validate outputs
    const validOutputs = outputs
      .filter(post => {
        const isValid = post && post.trim() && post.length <= 280;
        if (!isValid) {
          console.log('❌ Invalid post:', { post, length: post?.length });
        }
        return isValid;
      })
      .slice(0, 3); // Take only first 3 valid posts

    console.log('✅ Valid outputs:', validOutputs);

    if (validOutputs.length === 0) {
      throw new Error('Failed to generate any valid posts');
    }

    // If we got at least one valid post, consider it a success
    console.log(`✨ Generated ${validOutputs.length} posts successfully!`);
    
    // Store in Supabase (keeping this for tracking)
    const { error: insertError } = await supabase.from("generation_logs").insert({
      ip_address: userIp,
      prompt: prompt,
      output: JSON.stringify(validOutputs)
    });

    if (insertError) {
      console.error('⚠️ Error storing generation log:', insertError);
      // Continue anyway as this shouldn't block the response
    }

    // Return whatever valid posts we have (1-3)
    return res.status(200).json({ outputs: validOutputs });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      message: 'An unexpected error occurred. Please try again.' 
    });
  }
}
