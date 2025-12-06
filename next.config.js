// Example for older Next.js versions (less flexible)
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.co', 'plus.unsplash.com'],
    // Add other domains like 'another-allowed-domain.com' here
  },
};

module.exports = nextConfig;