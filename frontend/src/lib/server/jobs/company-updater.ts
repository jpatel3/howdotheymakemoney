import { getDB } from '@/lib/server/db';
import { companyUpdates } from '@/lib/server/schema';
// Import the Google AI SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define the structure expected from the LLM
interface FetchedCompanyData {
  description?: string | null;
  website?: string | null;
  headquarters?: string | null;
  primaryRevenue?: string | null;
  revenueBreakdown?: string | null; // Keep as string (JSON) for flexibility
  businessModel?: string | null;
  // Add other fields from the 'companies' table you want the LLM to fetch
}

// Structure for the JSON output we ask the model for
const jsonOutputStructure: FetchedCompanyData = {
    description: "",
    website: "",
    headquarters: "",
    primaryRevenue: "",
    revenueBreakdown: "{}", // Expecting a JSON string here
    businessModel: "",
};

/**
 * Fetches updated data for a company using web search and an LLM,
 * then stores it for admin review.
 *
 * @param companyId The ID of the company to update.
 * @param companyName The name of the company (for search queries).
 * @param requesterUserId The ID of the admin user initiating the refresh.
 * @param contextText Manually provided context text for the LLM.
 */
export async function triggerCompanyUpdate(
  companyId: number, 
  companyName: string, 
  requesterUserId: number, 
  contextText: string
): Promise<void> {
  console.log(`Starting update process for company: ${companyName} (ID: ${companyId}) using provided context.`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Gemini API Key (GEMINI_API_KEY) not found in environment variables.');
    // Don't proceed if the key is missing
    return; 
  }

  // --- Strategy 2 Implementation --- 

  // 1. Use the provided context text directly
  const collatedSearchText = contextText;
  console.log("Using provided context text.");

  // 2. Call Gemini API
  let fetchedData: FetchedCompanyData | null = null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Or another suitable model
      // Optional: Configure safety settings if needed
      // safetySettings: [
      //   { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      // ],
      generationConfig: {
        responseMimeType: "application/json", // Request JSON output
      },
    });

    const prompt = `
      Based ONLY on the following text provided about ${companyName}, extract the requested information.
      Respond ONLY with a valid JSON object matching this exact structure: ${JSON.stringify(jsonOutputStructure)}
      If information for a field is not found in the text, use null for its value.
      For 'revenueBreakdown', provide the data as a JSON string if possible, otherwise use null.

      Context:
      ---
      ${collatedSearchText}
      ---
    `;

    console.log(`Sending request to Gemini for ${companyName}...`);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    console.log(`Gemini response received for ${companyName}.`);
    
    // Attempt to parse the JSON response
    try {
      fetchedData = JSON.parse(responseText);
      // Basic validation (can be expanded)
      if (typeof fetchedData !== 'object' || fetchedData === null) {
        throw new Error('Parsed response is not a valid object.');
      }
      console.log("Successfully parsed Gemini JSON response.", fetchedData);
    } catch (parseError) {
      console.error(`Failed to parse Gemini JSON response for ${companyName}:`, parseError);
      console.error("Raw response text:", responseText);
      // Set fetchedData back to null if parsing fails
      fetchedData = null; 
    }

  } catch (llmError) {
    console.error(`Gemini API call failed for company ${companyName}:`, llmError);
    // Keep fetchedData as null
  }

  // 3. Save fetched data (if successful) to companyUpdates table for review
  if (fetchedData) {
    try {
      const db = await getDB();
      await db.insert(companyUpdates).values({
        companyId: companyId,
        fetchedData: JSON.stringify(fetchedData), // Store the validated/parsed object
        status: 'pending_review',
        requesterUserId: requesterUserId,
      });
      console.log(`Successfully saved pending update for company ${companyName} (ID: ${companyId})`);
    } catch (dbError) {
      console.error(`Database error saving pending update for company ${companyName}:`, dbError);
    }
  } else {
    console.warn(`No valid data fetched from Gemini for ${companyName}. Skipping database insert.`);
  }
} 