export function renderHomepage(opts: { name: string; version?: string }) {
  const { name, version = "dev" } = opts;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${name} Status</title>
    <style>
      body {
        background: radial-gradient(circle, #0f172a 0%, #1e293b 50%, #020617 100%);
        color: white;
        font-family: system-ui, Arial, sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        text-align: center;
      }
      a {
        color: #93c5fd;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      .circle {
        width: 20px;
        height: 20px;
        background-color: #22c55e;
        border-radius: 50%;
        animation: pulse 2s infinite;
        margin-bottom: 20px;
      }
      @keyframes pulse {
        0%   { transform: scale(1); opacity: 1; }
        50%  { transform: scale(1.5); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      h1 {
        margin: 0.5rem 0;
        font-size: 1.8rem;
      }
      p {
        margin: 0.25rem 0;
      }
      .muted {
        color: #94a3b8;
        font-size: 0.9rem;
      }
      .links {
        margin-top: 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .links a {
        padding: 0.5rem 1rem;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 0.5rem;
        transition: all 0.2s;
      }
      .links a:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.5);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="circle"></div>
    <h1>${name} is running 🚀</h1>
    <p>Eventuras experimental OpenID Connect Provider</p>
    <p class="muted">version ${version}</p>

    <div class="links">
      <a href="/health">Health Check</a>
      <a href="/.well-known/openid-configuration">OIDC Discovery</a>
      <a href="/.well-known/jwks.json">Public Keys (JWKS)</a>
    </div>
  </body>
</html>`;
}
