const esbuild = require("esbuild");

const isProd = process.env.NODE_ENV === "production";
const isOnce = process.argv.includes("--once");

async function run() {
    const config = {
        entryPoints: ["src/app.js"],
        bundle: true,
        platform: "node",
        target: "node18",
        outfile: "dist/app.js",
        sourcemap: !isProd,
        minify: isProd,
        logLevel: "info",
    };

    // 👉 build ครั้งเดียว (ใช้กับ start:dev)
    if (isProd || isOnce) {
        await esbuild.build(config);
        console.log("✅ build completed (once)");
        return;
    }

    // 👉 dev watch
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log("👀 watching for changes...");
}

run().catch(() => process.exit(1));
