'use client';

import { useParams } from 'next/navigation';

export default function CommunityHomePage() {
  const params = useParams();
  const communityId = params.communityId as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Home</h1>
        <p className="text-gray-600">Community ID: {communityId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">Activity feed will appear here</p>
        </div>

        {/* Community Tools */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Content Tools</h2>
          <ul className="space-y-2">
            <li><a href={`/communities/${communityId}/content/presentation-maker`} className="text-blue-600 hover:underline">Presentation Maker</a></li>
            <li><a href={`/communities/${communityId}/content/resume-builder`} className="text-blue-600 hover:underline">Resume Builder</a></li>
            <li><a href={`/communities/${communityId}/content/ebook-creator`} className="text-blue-600 hover:underline">Ebook Creator</a></li>
            <li><a href={`/communities/${communityId}/content/social-posts`} className="text-blue-600 hover:underline">Social Posts</a></li>
            <li><a href={`/communities/${communityId}/content/email-templates`} className="text-blue-600 hover:underline">Email Templates</a></li>
            <li><a href={`/communities/${communityId}/content/cover-letter`} className="text-blue-600 hover:underline">Cover Letter Pro</a></li>
          </ul>
        </div>
      </div>

      {/* Projects */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <p className="text-gray-500">Projects will appear here</p>
      </div>
    </div>
  );
}
