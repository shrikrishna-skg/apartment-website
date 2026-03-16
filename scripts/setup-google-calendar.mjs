#!/usr/bin/env node
/**
 * Google Calendar Setup Script
 *
 * This script automates the Google Cloud setup for the Calendar API:
 * 1. Creates a project (or uses existing)
 * 2. Enables Calendar API
 * 3. Creates a service account
 * 4. Creates and downloads a key
 * 5. Updates .env.local with credentials
 *
 * Prerequisites: User must be authenticated via `gcloud auth login` OR
 * provide an access token via ACCESS_TOKEN env var.
 *
 * Usage:
 *   ACCESS_TOKEN=<token> node scripts/setup-google-calendar.mjs
 */

import https from "https";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import http from "http";
import { URL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const PROJECT_ID = "gen-lang-client-0857161630";
const SERVICE_ACCOUNT_NAME = "college-place-calendar";
const SERVICE_ACCOUNT_DISPLAY = "College Place Calendar";
const CALENDAR_ID = "office@collegeplace.us";

function request(method, url, token, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || "{}") });
        } catch {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const token = process.env.ACCESS_TOKEN;
  if (!token) {
    console.error("Please set ACCESS_TOKEN environment variable.");
    console.error("");
    console.error("To get a token, open this URL in Chrome where you're logged into Google Cloud:");
    console.error("https://accounts.google.com/o/oauth2/v2/auth?client_id=764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com&redirect_uri=http://localhost:8085&response_type=token&scope=https://www.googleapis.com/auth/cloud-platform+https://www.googleapis.com/auth/calendar");
    console.error("");
    console.error("Then copy the access_token from the redirect URL and run:");
    console.error("ACCESS_TOKEN=<token> node scripts/setup-google-calendar.mjs");

    // Start a temporary local server to catch the OAuth redirect
    console.log("\n🔄 Starting local server to capture OAuth token...");
    console.log("Opening browser for authentication...\n");

    const tokenPromise = startOAuthServer();

    // Open browser
    const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com&redirect_uri=http://localhost:8085&response_type=token&scope=https://www.googleapis.com/auth/cloud-platform+https://www.googleapis.com/auth/calendar";

    const { exec } = await import("child_process");
    exec(`open "${authUrl}"`);

    const accessToken = await tokenPromise;
    if (!accessToken) {
      console.error("Failed to get access token.");
      process.exit(1);
    }

    console.log("✅ Got access token!\n");
    await setupWithToken(accessToken);
    return;
  }

  await setupWithToken(token);
}

function startOAuthServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.url === "/" || req.url?.startsWith("/#")) {
        // The token comes as a hash fragment, so we need a page to extract it
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html>
          <body>
            <h2>Extracting token...</h2>
            <script>
              const hash = window.location.hash.substring(1);
              const params = new URLSearchParams(hash);
              const token = params.get('access_token');
              if (token) {
                fetch('/token?access_token=' + encodeURIComponent(token))
                  .then(() => {
                    document.body.innerHTML = '<h2>✅ Authentication successful! You can close this tab.</h2>';
                  });
              } else {
                document.body.innerHTML = '<h2>❌ No token found. Please try again.</h2>';
              }
            </script>
          </body>
          </html>
        `);
      } else if (req.url?.startsWith("/token?")) {
        const urlParams = new URL(req.url, "http://localhost:8085");
        const token = urlParams.searchParams.get("access_token");
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("OK");
        server.close();
        resolve(token);
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(8085, () => {
      console.log("Listening on http://localhost:8085 for OAuth callback...");
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      server.close();
      resolve(null);
    }, 120000);
  });
}

async function setupWithToken(token) {
  // Step 1: Enable Calendar API
  console.log("1️⃣  Enabling Google Calendar API...");
  const enableRes = await request(
    "POST",
    `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/calendar-json.googleapis.com:enable`,
    token
  );
  if (enableRes.status === 200 || enableRes.status === 409) {
    console.log("   ✅ Calendar API enabled (or already enabled)");
  } else {
    console.log("   Status:", enableRes.status, JSON.stringify(enableRes.data));
    if (enableRes.status === 403) {
      console.log("   ⚠️  You may need to enable it manually. Continuing anyway...");
    }
  }

  // Step 2: Create service account
  console.log("\n2️⃣  Creating service account...");
  const saEmail = `${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com`;
  const createSaRes = await request(
    "POST",
    `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/serviceAccounts`,
    token,
    {
      accountId: SERVICE_ACCOUNT_NAME,
      serviceAccount: {
        displayName: SERVICE_ACCOUNT_DISPLAY,
        description: "Service account for College Place apartment tour calendar integration",
      },
    }
  );
  if (createSaRes.status === 200) {
    console.log(`   ✅ Service account created: ${saEmail}`);
  } else if (createSaRes.status === 409) {
    console.log(`   ✅ Service account already exists: ${saEmail}`);
  } else {
    console.log("   Status:", createSaRes.status, JSON.stringify(createSaRes.data));
    console.log("   ⚠️  Continuing to try key creation...");
  }

  // Step 3: Create key
  console.log("\n3️⃣  Creating service account key...");
  const keyRes = await request(
    "POST",
    `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/serviceAccounts/${saEmail}/keys`,
    token,
    { keyAlgorithm: "KEY_ALG_RSA_2048", privateKeyType: "TYPE_GOOGLE_CREDENTIALS_FILE" }
  );

  if (keyRes.status === 200 && keyRes.data.privateKeyData) {
    const keyJson = JSON.parse(
      Buffer.from(keyRes.data.privateKeyData, "base64").toString("utf8")
    );
    console.log(`   ✅ Key created successfully`);
    console.log(`   Service Account Email: ${keyJson.client_email}`);

    // Save the key file
    const keyPath = join(projectRoot, "google-service-account-key.json");
    fs.writeFileSync(keyPath, JSON.stringify(keyJson, null, 2));
    console.log(`   📄 Key saved to: ${keyPath}`);

    // Step 4: Update .env.local
    console.log("\n4️⃣  Updating .env.local...");
    const envPath = join(projectRoot, ".env.local");
    let envContent = fs.readFileSync(envPath, "utf8");

    // Update GOOGLE_SERVICE_ACCOUNT_EMAIL
    envContent = envContent.replace(
      /GOOGLE_SERVICE_ACCOUNT_EMAIL=.*/,
      `GOOGLE_SERVICE_ACCOUNT_EMAIL=${keyJson.client_email}`
    );

    // Update GOOGLE_PRIVATE_KEY - escape newlines for .env format
    const escapedKey = keyJson.private_key.replace(/\n/g, "\\n");
    envContent = envContent.replace(
      /GOOGLE_PRIVATE_KEY=.*/,
      `GOOGLE_PRIVATE_KEY="${escapedKey}"`
    );

    fs.writeFileSync(envPath, envContent);
    console.log("   ✅ .env.local updated with credentials");

    // Step 5: Share calendar with service account
    console.log("\n5️⃣  Sharing Google Calendar with service account...");
    console.log(`   Calendar: ${CALENDAR_ID}`);
    console.log(`   Service Account: ${keyJson.client_email}`);

    const shareRes = await request(
      "POST",
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/acl`,
      token,
      {
        role: "writer",
        scope: {
          type: "user",
          value: keyJson.client_email,
        },
      }
    );

    if (shareRes.status === 200) {
      console.log("   ✅ Calendar shared with service account!");
    } else {
      console.log("   Status:", shareRes.status, JSON.stringify(shareRes.data));
      console.log("   ⚠️  You may need to share the calendar manually:");
      console.log(`      Go to Google Calendar > Settings for ${CALENDAR_ID} > Share with specific people`);
      console.log(`      Add: ${keyJson.client_email} with "Make changes to events" permission`);
    }

    console.log("\n🎉 Setup complete! Google Calendar integration is ready.");
    console.log("\n⚠️  IMPORTANT: Add 'google-service-account-key.json' to your .gitignore!");

    // Add to gitignore if not already there
    const gitignorePath = join(projectRoot, ".gitignore");
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, "utf8");
      if (!gitignore.includes("google-service-account-key.json")) {
        fs.appendFileSync(gitignorePath, "\n# Google service account key\ngoogle-service-account-key.json\n");
        console.log("   ✅ Added to .gitignore");
      }
    }
  } else {
    console.error("   ❌ Failed to create key:", keyRes.status, JSON.stringify(keyRes.data));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
