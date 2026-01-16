import express from "express";
import path from "path";
import { setupAuth } from "./auth";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupAuth(app);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "dist")));
  
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    }
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
