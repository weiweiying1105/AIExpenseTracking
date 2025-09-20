const path = require("path");
const fs = require("fs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 在构建时复制文件到输出目录
    if (!dev && isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env.CUSTOM_KEY": '"build-time-copy"',
        })
      );

      // 添加自定义插件来复制文件
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap("CopyFilePlugin", () => {
            const sourceFile = path.join(__dirname, "46R8uJqlv3.txt");
            const targetDir = path.join(__dirname, ".next/standalone");
            const targetFile = path.join(targetDir, "46R8uJqlv3.txt");

            if (fs.existsSync(sourceFile)) {
              fs.copyFileSync(sourceFile, targetFile);
              console.log("Copied 46R8uJqlv3.txt to standalone output");
            }
          });
        },
      });
    }

    return config;
  },
};

module.exports = nextConfig;
