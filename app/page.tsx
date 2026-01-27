// TEST DEPLOYMENT - Jan 27, 2026 11:35 PM ✅ pls work
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find LinkedIn Profiles Fast
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Search for LinkedIn profiles by name and school. Get confidence
              scores and generate personalized outreach messages in seconds.
            </p>

            <div className="flex gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-sm text-gray-600">
                Find profiles by name and school
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Confidence Scores
              </h3>
              <p className="text-sm text-gray-600">
                Know how accurate each match is
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="text-4xl mb-2">✍️</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Draft Messages
              </h3>
              <p className="text-sm text-gray-600">
                Generate personalized outreach
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="text-4xl mb-2">📤</div>
              <h3 className="font-semibold text-gray-900 mb-2">Batch Upload</h3>
              <p className="text-sm text-gray-600">
                Search up to 100 names at once
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-teal-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Enter Names & Schools
              </h3>
              <p className="text-gray-600">
                Submit manually (1-10) or upload a CSV file (1-100 names)
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-teal-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                AI Finds Profiles
              </h3>
              <p className="text-gray-600">
                Our AI searches and extracts LinkedIn profiles with confidence
                scores
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-teal-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Generate Messages
              </h3>
              <p className="text-gray-600">
                Get personalized message templates to send to prospects
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
