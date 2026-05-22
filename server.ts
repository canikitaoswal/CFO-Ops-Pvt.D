import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;

if (api_key) {
  try {
    ai = new GoogleGenAI({
      apiKey: api_key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined. AI CFO Advisory will operate with helper fallback strategies.");
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: !!ai });
});

// Full-stack intelligent route: CFO strategy advisory and Proposal writing
app.post("/api/cfo-consulting", async (req: express.Request, res: express.Response): Promise<any> => {
  const { mode, payload } = req.body;

  if (!ai) {
    // Elegant system fallback if API key is not present yet so the application remains 100% functional
    return res.json({
      success: true,
      text: `### [Offline Mode] System Advisory Strategy\n\n**Note: To unlock live full-context AI answers, please add a valid Gemini API Key in the Settings > Secrets panel.**\n\n#### Direct CFO Advisory Measures:\n1. **Manufacturing Inventory & Raw Material Optimization**:\n   * Transition raw components to a Just-In-Time (JIT) model with active supplier credit lines.\n   * Segment stock by value through ABC classification to conserve working capital.\n2. **Hotel & Resort Working Capital Improvement**:\n   * Re-evaluate seasonality rates and pre-booked credit terms with corporate travel associations.\n   * Shorten debtor collection metrics through early billing discounts.\n3. **Financial Planning Cash Flow Health**:\n   * Maintain an emergency reserve corresponding to at least 4.5 months of persistent overhead.\n   * Re-finance expensive short-term bridge debt to long-term floating alternatives.`,
      sources: ["Local Operations Knowledge Base", "CFO Offline Strategy Guild"]
    });
  }

  try {
    let prompt = "";
    let systemInstruction = "";

    if (mode === "proposal") {
      const { clientName, industry, revenue, specificProblems, totalValue } = payload;
      systemInstruction = "You are a professional Outsourced CFO and financial strategist drafting a client proposal.";
      prompt = `Draft a comprehensive, highly customized and beautifully structured business proposal for ${clientName}.
      
      Client Segment Details:
      - Industry: ${industry}
      - Estimated Annual Revenue: ${revenue}
      - Key Financial Problems: ${specificProblems}
      - Proposed Service Deal Value: US$ ${totalValue.toLocaleString()} per year
      
      The proposal must contain they following sections:
      1. Executive Summary & Problem Diagnosis: Resonate deeply with their business challenges.
      2. Scope of Outscourced CFO Services: Tailored to their industry (manufacturing needs cost of gods sold (COGS) control & inventory cycle tuning; hotels need occupancy revenue pricing & room-level cost audit; individual planning needs asset allocation & net-worth dashboarding).
      3. Action Plan & Operational Milestones: 30-60-90 day timeline showing team layout (4 members available).
      4. Pricing Model & ROI Projection: Present the US$ ${totalValue.toLocaleString()}/yr as an investment representing positive returns through cost savings or margin enhancement.
      5. Next Steps to Initiate Onboarding with GST/PAN details and contract finalization.
      
      Use rich markup and clear executive language.`;
    } else {
      // General Consulting Mode
      const { query, focusArea } = payload;
      systemInstruction = "You are an elite Outsourced CFO, business consultant, and corporate financial controller advising on manufacturing, resort operations, and cash management.";
      prompt = `Provide a comprehensive strategic roadmap and expert financial analysis addressing: "${query}" in the context of "${focusArea}".
      
      Structure your response professionally:
      - Key CFO Diagnostic Metrics (e.g., Working Capital Days, Days Sales Outstanding, Gross Margin EBITDA optimization)
      - Immediate Cost Reduction or Revenue Enhancement measures
      - Suggested Workflow Automation & Audit controls for a 4-person team
      - Client & Service Partner Follow-up checklist to keep accountability high.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      text: response.text,
      sources: ["Gemini 3.5 AI CFO Consulting Engine"]
    });
  } catch (error: any) {
    console.error("Gemini request failed:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while generating CFO advisory responses."
    });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CFO Operations Portal Server booted on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Vite server failed to start:", err);
});
