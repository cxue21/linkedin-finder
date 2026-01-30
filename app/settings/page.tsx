'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for client-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const [profileText, setProfileText] = useState('');
  const [parsedProfile, setParsedProfile] = useState<any>(null);
  const [parsing, setParsing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('sender_profile, profile_raw_text')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfileText(data.profile_raw_text || '');
      setParsedProfile(data.sender_profile);
    }
  }

  async function handleParseAndSave() {
    if (!profileText.trim()) {
      setMessage('Please paste some text first');
      return;
    }

    setParsing(true);
    setMessage('');

    try {
      // Get auth token to pass to API
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call API to parse with DeepSeek
      const response = await fetch('/api/profile/parse', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ profileText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse profile');
      }

      setParsedProfile(data.profile);
      setMessage('✅ Profile parsed and saved successfully!');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            📝 Improve Your AI Message Quality
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            Paste your LinkedIn "About" section, resume summary, or any professional bio below. 
            Our AI will extract key details to generate better personalized connection messages.
          </p>
          <p className="text-sm text-blue-700">
            <strong>We'll automatically extract:</strong> Education, work experience, current role, skills, and interests.
          </p>
        </div>

        {/* Text area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Professional Background
          </label>
          <textarea
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            placeholder="Paste your LinkedIn About section, resume summary, or bio here...

Example:
I'm a Product Manager at Acme Corp with 5 years of experience in B2B SaaS. 
I studied Computer Science at the University of Hong Kong and previously worked at Google and Stripe.
Passionate about AI, developer tools, and building products that scale."
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
            rows={12}
          />
          <p className="text-xs text-gray-500 mt-1">
            {profileText.length} characters
          </p>
        </div>

        {/* Parse button */}
        <button
          onClick={handleParseAndSave}
          disabled={parsing || !profileText.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {parsing ? '🤖 Parsing with AI...' : '✨ Parse & Save Profile'}
        </button>

        {/* Status message */}
        {message && (
          <div className={`p-4 rounded-md text-sm ${
            message.includes('❌') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Show parsed results */}
        {parsedProfile && Object.keys(parsedProfile).length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              📊 Extracted Profile Data
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              
              {parsedProfile.education && parsedProfile.education.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Education</span>
                  <p className="text-sm text-gray-800 mt-1">
                    {parsedProfile.education.join(', ')}
                  </p>
                </div>
              )}

              {parsedProfile.experience && parsedProfile.experience.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Companies</span>
                  <p className="text-sm text-gray-800 mt-1">
                    {parsedProfile.experience.join(', ')}
                  </p>
                </div>
              )}

              {parsedProfile.current_role && (
                <div>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Current Role</span>
                  <p className="text-sm text-gray-800 mt-1">
                    {parsedProfile.current_role}
                  </p>
                </div>
              )}

              {parsedProfile.current_company && (
                <div>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Current Company</span>
                  <p className="text-sm text-gray-800 mt-1">
                    {parsedProfile.current_company}
                  </p>
                </div>
              )}

              {parsedProfile.interests && parsedProfile.interests.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Interests/Skills</span>
                  <p className="text-sm text-gray-800 mt-1">
                    {parsedProfile.interests.join(', ')}
                  </p>
                </div>
              )}

            </div>

            <p className="text-xs text-gray-500 mt-3">
              💡 This data will be used to personalize your LinkedIn connection messages
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
