import { useState } from "react";
import Head from "next/head";
import PostsCarousel from "../components/PostsCarousel";
import Link from "next/link";

export default function Home() {
  // State management
  const [prompt, setPrompt] = useState("");
  const [outputs, setOutputs] = useState([]);
  const [error, setError] = useState("");
  const [includeSignature, setIncludeSignature] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle post generation
  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Come on, SmartAss. Write something!");
      return;
    }

    setError("");
    setOutputs([]);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate posts");
      }
      
      if (!data.outputs || data.outputs.length === 0) {
        throw new Error("No valid posts were generated. Please try again.");
      }

      setOutputs(data.outputs);
      
      // If we got fewer than 3 posts, show a warning
      if (data.outputs.length < 3) {
        setError(`Generated ${data.outputs.length} post${data.outputs.length === 1 ? '' : 's'} instead of 3. You can try again for more variations.`);
      }
    } catch (err) {
      setError(err.message || "Failed to reach server");
      setOutputs([]); // Clear any partial results on error
    } finally {
      setIsGenerating(false);
    }
  }

  // Handle Twitter link creation
  function constructXLink(text) {
    const finalText = includeSignature
      ? `${text}\n\nwritten by SmartAss`
      : text;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(finalText)}`;
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleGenerate();
    }
  };

  return (
    <>
      <Head>
        <title>SmartAss X Post Generator</title>
        <meta name="description" content="Generate witty posts for X (Twitter) with AI" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header Section */}
          <header className="text-center mb-16 mt-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
              SmartAss X Post Generator
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              What do you want to write, SmartAss?
            </p>
          </header>

          {/* Input Section */}
          <div className="glass rounded-xl p-6 mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                className="flex-1 px-6 py-4 rounded-lg bg-white/5 border border-white/20 
                         text-white text-lg placeholder:text-white/40 
                         focus:outline-none focus:border-white/40 transition-colors"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your pompous idea... (e.g., 'water is the source of all life')"
                disabled={isGenerating}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gradient-button px-8 py-4 rounded-lg text-white font-medium 
                         whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed
                         hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                {isGenerating ? "Thinking..." : "Blow My Mind"}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-center mb-12 animate-bounce">
              <p className="text-red-300 text-lg font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="text-center mb-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white"></div>
              <p className="text-white/80 mt-4">Crafting witty responses...</p>
            </div>
          )}

          {/* Generated Posts Section */}
          {outputs.length > 0 && (
            <div className="space-y-8">
              {/* Signature Toggle */}
              <label className="flex justify-center items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded bg-white/10 border-2 border-white/20 
                           checked:bg-white/20 checked:border-white/40"
                  checked={includeSignature}
                  onChange={(e) => setIncludeSignature(e.target.checked)}
                />
                <span className="text-lg text-white/90">
                  Add "written by SmartAss"
                </span>
              </label>
              
              {/* Posts Carousel */}
              <PostsCarousel posts={outputs} constructXLink={constructXLink} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="py-8 mt-auto">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-center items-center gap-4 text-white/80">
            <Link
              href="/legal"
              className="hover:text-white transition-colors"
            >
              Legal stuff
            </Link>
            <span className="hidden sm:block text-white/40">•</span>
            <a
              href="https://www.buymeacoffee.com/georgipep"
              target="_blank"
              rel="noopener noreferrer"
              className="glass px-4 py-2 rounded-lg hover:text-white transition-colors flex items-center gap-2"
            >
              ☕️ Buy me a coffee
            </a>
            <span className="hidden sm:block text-white/40">•</span>
            <span className="flex items-center gap-1">
              Created by{" "}
              <a
                href="https://x.com/georgipep"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline"
              >
                @georgipep
              </a>
            </span>
          </div>
        </footer>
      </main>
    </>
  );
} 