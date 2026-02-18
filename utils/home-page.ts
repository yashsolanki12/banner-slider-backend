export const homePageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Usp Bar API</title>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f0f0f;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #fff;
      overflow: hidden;
    }
    .container {
      text-align: center;
      z-index: 10;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 0.5rem;
   
    }
    p {
      font-size: 1.2rem;
      color: #888;
    }
    .status {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 8px 24px;
      border: 1px solid #333;
      border-radius: 999px;
      font-size: 0.9rem;
      color: #00c853;
      background: rgba(0, 200, 83, 0.08);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Server is Running</h1>
    <p>Usp Bar API is live and ready.</p>
    <span class="status">● Online</span>
  </div>
  <script>
    function fire(particleRatio, opts) {
      confetti(Object.assign({}, { origin: { y: 0.7 } }, opts, {
        particleCount: Math.floor(200 * particleRatio),
      }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    setTimeout(() => {
      confetti({ particleCount: 150, spread: 180, origin: { y: 0.6 } });
    }, 750);
  </script>
</body>
</html>
`;
