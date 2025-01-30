import Head from "next/head";
import Link from "next/link";

export default function Legal() {
  return (
    <>
      <Head>
        <title>Legal Stuff - SmartAss X Post Generator</title>
        <meta name="description" content="Terms of Service and Privacy Policy for SmartAss X Post Generator" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          {/* Back to Home */}
          <Link 
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
          >
            ← Back to generator
          </Link>

          {/* Header */}
          <h1 className="text-4xl font-bold mb-12 text-white">
            Legal Stuff
          </h1>

          {/* Terms and Privacy Content */}
          <div className="space-y-12 text-white/90">
            <section className="glass rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4">What This App Does</h2>
              <p className="mb-4">
                SmartAss X Post Generator is a fun tool that helps you create smart-sounding and pretentious posts for X (formerly Twitter) using artificial intelligence. It takes your input and generates three different variations in various writing styles.
              </p>
              <p>
                The app is intended for entertainment and creative purposes. While we aim to generate innocent content, please use your judgment when posting to social media.
              </p>
            </section>

            <section className="glass rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4">Technology We Use</h2>
              <p className="mb-4">
                We use the Mixtral-8x7b model through the Groq API to generate posts. This is a large language model that has been trained on publicly available data to understand and generate human-like text.
              </p>
              <p>
                The app is built with Next.js and uses Supabase for data storage. All communication with our AI provider is done securely through encrypted connections.
              </p>
            </section>

            <section className="glass rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4">Data We Store</h2>
              <p className="mb-4">
                For quality improvement and monitoring purposes, we store:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Your input prompts</li>
                <li>The generated posts</li>
                <li>Your IP address</li>
                <li>Timestamp of generation</li>
              </ul>
              <p>
                We do not store any personal information beyond this, and we do not track your social media activity or whether you actually post the generated content.
              </p>
            </section>

            <section className="glass rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Request deletion of your data</li>
                <li>Ask what data we have about you</li>
                <li>Opt-out of data collection (though this will prevent the app from working)</li>
              </ul>
            </section>

            <section className="glass rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p>
                For any questions about your data or this policy, you can reach out to me on{" "}
                <a 
                  href="https://x.com/georgipep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors"
                >
                  X (@georgipep)
                </a>
                .
              </p>
            </section>

            <section className="glass rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p>
                This policy may be updated occasionally. Significant changes will be announced on the main page. Last updated: January 2025.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
} 