# Doomsday Drill

An interactive Doomsday algorithm practice website with random dates from 1900–2099, instant weekday feedback, calculation explanations, keyboard shortcuts, accuracy, and streak tracking. Works on desktop and mobile.

## Deploy on Vercel

1. Upload this folder’s contents to your GitHub repository. Keep `public` and `tests` as folders. `package.json` and `vercel.json` belong at the repository root.
2. In Vercel, choose **Add New → Project**, import `Fischer-Kyle/doomsday-drill`, and click **Deploy**.
3. Use **Other** if asked for a framework. Leave the root directory at the repository root. The included configuration selects `public` as the output directory; no build or installation is needed.

The site runs entirely in the browser and needs no API keys, server, database, or environment variables. Progress is saved locally in each browser. Progress from the previous ChatGPT-hosted URL does not automatically transfer to the Vercel URL.

## Local preview

From this folder, run `python3 -m http.server 8000 --directory public` and open http://localhost:8000.

## Checks

With Node.js installed, run `npm test`.

Recovered from the original Doomsday Drill site and packaged for independent hosting. No license has been added.
