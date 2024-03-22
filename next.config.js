/** @type {import('next').NextConfig} */
// const nextConfig = { }

if (
  process.env.LD_LIBRARY_PATH == null ||
  !process.env.LD_LIBRARY_PATH.includes(
    `${process.env.PWD}/node_modules/canvas/build/Release:`,
  )
) {
  process.env.LD_LIBRARY_PATH = `${
    process.env.PWD
  }/node_modules/canvas/build/Release:${process.env.LD_LIBRARY_PATH || ''}`;
}

// module.exports = nextConfig
module.exports = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "azikaban.top" },
          { key: "Access-Control-Allow-Methods", value: "azikaban.top" },
          { key: "Access-Control-Allow-Headers", value: "azikaban.top" },
        ],
      },
    ];
  },
};
