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

RULES: DO NOT USE QUOTATION MARKS OR HASHTAGS`;

  const completion = await groq.chat.completions.create({
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
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content generated');
  }

  // Clean up the response
  return content.trim().split('\n')[0].replace(/^[^:]+:\s*/, '').trim();
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
    // 1) Check if user has exceeded 3 generations in the past hour
    try {
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

      // 2) Call Groq LLM
      console.log('🤖 Generating posts...');
      
      if (!prompt?.trim()) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      // Get 3 random styles
      const selectedStyles = getRandomStyles();
      console.log('🎨 Using styles:', selectedStyles.map(s => s.style).join(', '));

      try {
        // Generate posts in parallel
        const outputs = await Promise.all(
          selectedStyles.map(style => generateSinglePost(prompt, style))
        );

        // Validate outputs
        const validOutputs = outputs.filter(post => 
          post && post.trim() && post.length <= 280
        );

        if (validOutputs.length < 3) {
          throw new Error('Failed to generate all posts');
        }

        console.log('✨ Generated posts successfully!');
        
        // Store in Supabase
        const { error: insertError } = await supabase.from("generation_logs").insert({
          ip_address: userIp,
          prompt: prompt,
          output: JSON.stringify(validOutputs)
        });

        if (insertError) {
          console.error('⚠️ Error storing generation log:', insertError);
          // Continue anyway as this shouldn't block the response
        }

        return res.status(200).json({ outputs: validOutputs });
      } catch (groqError) {
        console.error('❌ Groq API error:', groqError);
        return res.status(500).json({ message: 'Error calling Groq API: ' + groqError.message });
      }
    } catch (supabaseError) {
      console.error('❌ Supabase error:', supabaseError);
      return res.status(500).json({ message: 'Database error: ' + supabaseError.message });
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({ message: 'Unexpected error: ' + error.message });
  }
}
