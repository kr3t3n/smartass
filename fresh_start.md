# SmartAss X Post Generator - Fresh Start Documentation

## Core Functionality
The app generates witty/smart social media posts based on user input and allows direct posting to X (Twitter).

### Main Components & Data Flow

1. **Main Page (index.js)**
   - State Management:
     ```javascript
     const [prompt, setPrompt] = useState("")        // User input
     const [outputs, setOutputs] = useState([])      // Generated posts
     const [error, setError] = useState("")          // Error messages
     const [includeSignature, setIncludeSignature] = useState(true)  // Toggle for signature
     ```
   - Key Functions:
     - `handleGenerate()`: Calls API to generate posts
     - `constructXLink(text)`: Creates Twitter intent URL with optional signature
     - `handleKeyPress(e)`: Enables Enter key submission

2. **API Integration (/api/generate)**
   - Endpoint: POST /api/generate
   - Input: { prompt: string }
   - Output: { outputs: string[] }
   - Error Handling: Returns appropriate error messages

3. **Posts Carousel Component**
   - Uses embla-carousel-react for smooth sliding
   - Configuration:
     ```javascript
     const options = {
       align: "center",
       containScroll: "trimSnaps",
       dragFree: true
     }
     ```
   - Handles slide selection and animation states

### UI/UX Requirements

1. **Layout**
   - Full-width, centered design
   - Max-width container for content
   - Responsive padding/margins
   - Glass-morphism effects

2. **Input Section**
   - Text input with placeholder
   - Submit button
   - Error message display (animated)

3. **Generated Posts Display**
   - Carousel of posts
   - Each post in a glass-effect card
   - "Post to X" button for each card
   - Signature toggle checkbox

### Styling Guidelines

1. **Color Scheme**
   - Background: Gradient from #667eea to #764ba2
   - Text: White with varying opacity
   - Glass Effect: rgba(255, 255, 255, 0.1) with blur

2. **Typography**
   - System font stack
   - Responsive text sizes
   - Title: 4xl -> 6xl
   - Body: lg -> xl

3. **Interactive Elements**
   - Hover effects with scale transforms
   - Smooth transitions (0.3s ease)
   - Focus states for inputs
   - Loading states for actions

### Carousel Implementation Notes

1. **Structure**
   ```
   .embla (wrapper)
   └── .emblaViewport (overflow container)
       └── .emblaContainer (slides container)
           └── .emblaSlide (individual slides)
               └── .card (content container)
   ```

2. **Responsive Breakpoints**
   - Mobile: 90% width
   - SM (640px): 80% width
   - MD (768px): 70% width
   - LG (1024px): 60% width

3. **Animation States**
   - Non-selected slides: opacity 0.4, scale 0.95
   - Selected slide: opacity 1, scale 1
   - Smooth transitions for all state changes

### Key CSS Classes

1. **Utility Classes**
   ```css
   .glass {
     background: rgba(255, 255, 255, 0.1);
     backdrop-filter: blur(10px);
     border: 1px solid rgba(255, 255, 255, 0.2);
   }

   .gradient-button {
     background: linear-gradient(to right, #667eea, #764ba2);
   }
   ```

2. **Custom Animations**
   ```css
   .animate-bounce {
     animation: bounce 1s infinite;
   }
   ```

### Error Handling

1. **User Input Validation**
   - Empty prompt check
   - Trim whitespace
   - Descriptive error messages

2. **API Error Handling**
   - Network errors
   - Server response errors
   - Fallback error messages

### Performance Considerations

1. **Optimizations**
   - Debounced input handling
   - Lazy loading for carousel
   - Minimal re-renders
   - Efficient state updates

2. **Loading States**
   - Clear feedback during API calls
   - Smooth transitions between states
   - Fallback UI for loading states 

### AI Implementation

1. **GROQ Integration**
   - Environment Setup:
     ```javascript
     const GROQ_API_KEY = process.env.GROQ_API_KEY
     const MODEL = "mixtral-8x7b-32768"  // High context, good for creative tasks
     ```
   - Client Configuration:
     ```javascript
     const groq = new Groq({
       apiKey: GROQ_API_KEY,
       dangerouslyAllowBrowser: false  // Server-side only
     })
     ```

2. **Prompt Engineering**
   - System Prompt:
     ```javascript
     const SYSTEM_PROMPT = `You are SmartAss, a witty and intelligent AI with a talent for crafting 
     engaging social media posts. Your posts are:
     - Clever and thought-provoking
     - Sometimes sarcastic but never mean
     - Often include wordplay or puns
     - Limited to 280 characters
     - Written in a consistent voice
     Format: Generate 3 unique variations, each as a complete post.`
     ```
   - Message Structure:
     ```javascript
     const messages = [
       {
         role: "system",
         content: SYSTEM_PROMPT
       },
       {
         role: "user",
         content: userPrompt
       }
     ]
     ```

3. **Generation Parameters**
   ```javascript
   const GENERATION_CONFIG = {
     temperature: 0.9,        // High creativity
     top_p: 0.9,             // Diverse outputs
     max_tokens: 1000,       // Enough for multiple variations
     stop: ["###", "---"],   // Custom stop sequences
     frequency_penalty: 0.5,  // Reduce repetition
     presence_penalty: 0.3    // Encourage novelty
   }
   ```

### API Implementation (/api/generate)

1. **Request Handler**
   ```javascript
   export default async function handler(req, res) {
     if (req.method !== 'POST') {
       return res.status(405).json({ message: 'Method not allowed' })
     }

     try {
       const { prompt } = req.body
       const outputs = await generatePosts(prompt)
       res.status(200).json({ outputs })
     } catch (error) {
       console.error('Generation error:', error)
       res.status(500).json({ message: 'Failed to generate posts' })
     }
   }
   ```

2. **Post Generation Function**
   ```javascript
   async function generatePosts(prompt) {
     const completion = await groq.chat.completions.create({
       messages,
       model: MODEL,
       ...GENERATION_CONFIG
     })

     return parseAndValidateOutputs(completion.choices[0].message.content)
   }
   ```

3. **Output Processing**
   ```javascript
   function parseAndValidateOutputs(content) {
     const posts = content.split('\n').filter(line => 
       line.trim() && 
       line.length <= 280 &&
       !line.startsWith('-')
     )
     
     return posts.slice(0, 3)  // Ensure we return max 3 posts
   }
   ```

### Rate Limiting & Caching

1. **Rate Limiting Implementation**
   ```javascript
   import rateLimit from 'express-rate-limit'

   const limiter = rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 5 // 5 requests per minute
   })
   ```

2. **Response Caching**
   ```javascript
   const CACHE_DURATION = 60 * 60 * 1000  // 1 hour
   const promptCache = new Map()

   function getCachedResponse(prompt) {
     const cached = promptCache.get(prompt)
     if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
       return cached.outputs
     }
     return null
   }
   ```

### Error Messages & Validation

1. **User-Facing Error Messages**
   ```javascript
   const ERROR_MESSAGES = {
     EMPTY_PROMPT: "Come on, SmartAss. Write something!",
     RATE_LIMIT: "Whoa there! Take a breather, champ.",
     SERVER_ERROR: "My wit machine is temporarily offline.",
     NETWORK_ERROR: "Failed to reach server. Check your connection.",
     GENERATION_ERROR: "Even genius needs a second try sometimes."
   }
   ```

2. **Input Validation**
   ```javascript
   function validatePrompt(prompt) {
     if (!prompt?.trim()) {
       throw new Error(ERROR_MESSAGES.EMPTY_PROMPT)
     }
     
     if (prompt.length > 1000) {
       throw new Error("That's a bit too much to process. Keep it shorter!")
     }
   }
   ```

### Loading States & Animations

1. **Generation States**
   ```javascript
   const [isGenerating, setIsGenerating] = useState(false)
   const [progress, setProgress] = useState(0)
   ```

2. **Progress Animation**
   ```javascript
   useEffect(() => {
     if (isGenerating) {
       const interval = setInterval(() => {
         setProgress(p => p < 90 ? p + 10 : p)
       }, 500)
       return () => clearInterval(interval)
     } else {
       setProgress(0)
     }
   }, [isGenerating])
   ```

### Security Considerations

1. **API Protection**
   - Rate limiting per IP
   - Input sanitization
   - CORS configuration
   - API key protection

2. **Content Filtering**
   ```javascript
   function filterInappropriateContent(text) {
     const filtered = text.replace(/offensive|inappropriate/gi, '***')
     return filtered
   }
   ```

### Testing Strategy

1. **Unit Tests**
   - Input validation
   - Error handling
   - Response parsing
   - Cache functionality

2. **Integration Tests**
   - API endpoints
   - Rate limiting
   - Error responses
   - Success scenarios

3. **E2E Tests**
   - User flow
   - UI interactions
   - Loading states
   - Error displays 