import app from "./index.js";

const port = Number(process.env["PORT"] ?? 3000);

app.listen(port, () => {
  console.log(`GoldMate API listening on http://localhost:${port}`);
});