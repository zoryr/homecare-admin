/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sgpfvzlyhdzfgdceisnx.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Default cover image (stockée dans /public, servie via le domaine du déploiement)
      { protocol: 'https', hostname: '*.vercel.app' },
      { protocol: 'https', hostname: 'homecare-admin-gray.vercel.app' },
    ],
  },
};

export default nextConfig;
