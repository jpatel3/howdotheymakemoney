import { getDB } from './db';
import { companyRequests, companies } from './schema';
import { eq, and } from 'drizzle-orm';
import { generateSlug } from '@/lib/utils';

// --- Main Job Processing Function ---
export async function processCompanyRequestJob(requestId: number): Promise<void> {
    console.log(`Starting job processing for request ID: ${requestId}`);
    const db = await getDB();
    if (!db) {
        throw new Error(`processCompanyRequestJob (${requestId}): Failed to get DB instance`);
    }

    // Fetch the request details (including companyName)
    const requestDetails = await db
        .select({ 
            id: companyRequests.id, 
            companyName: companyRequests.companyName, 
            status: companyRequests.status,
            userId: companyRequests.userId
        })
        .from(companyRequests)
        .where(eq(companyRequests.id, requestId))
        .limit(1)
        .get();

    if (!requestDetails) {
        throw new Error(`processCompanyRequestJob (${requestId}): Request details not found.`);
    }

    if (requestDetails.status !== 'processing') {
        console.warn(`processCompanyRequestJob (${requestId}): Request status was ${requestDetails.status}, expected 'processing'. Skipping.`);
        return; 
    }

    const companyName = requestDetails.companyName;
    let newStatus: 'approved' | 'failed' = 'failed'; 

    try {
        console.log(`Fetching data for "${companyName}" (Request ID: ${requestId})`);
        const companyData = await fetchCompanyData(companyName);
        console.log(`Successfully fetched data for "${companyName}"`);

        const slug = generateSlug(companyData.name || companyName);

        const existingCompany = await db.select({ id: companies.id })
                                    .from(companies)
                                    .where(eq(companies.slug, slug))
                                    .limit(1)
                                    .get();

        if (existingCompany) {
            console.log(`Company with slug "${slug}" already exists. Skipping insert for request ${requestId}.`);
            newStatus = 'approved'; 
        } else {
            console.log(`Inserting new company "${companyData.name || companyName}" with slug "${slug}"`);
            await db.insert(companies).values({
                name: companyData.name || companyName,
                slug: slug,
                description: companyData.description || 'Data needs review.',
                logo: companyData.logo,
                website: companyData.website,
                headquarters: companyData.headquarters || 'Data needs review.',
                primaryRevenue: companyData.primaryRevenue || 'Data needs review.',
                revenueBreakdown: companyData.revenueBreakdown || '{}',
                businessModel: companyData.businessModel || 'Data needs review.',
                requestedByUserId: requestDetails.userId,
            });
            newStatus = 'approved';
        }
    } catch (fetchError) {
        console.error(`Failed to fetch or process data for "${companyName}" (Request ID: ${requestId}):`, fetchError);
        newStatus = 'failed';
    } finally {
        console.log(`Updating request ${requestId} status to: ${newStatus}`);
        await db
            .update(companyRequests)
            .set({ status: newStatus })
            .where(eq(companyRequests.id, requestId));
        console.log(`Finished job processing for request ID: ${requestId}`);
    }
}

// --- Web Agent Data Fetching Function (Placeholder for Tool Calls) ---
interface FetchedCompanyData {
    name?: string; // Can potentially be refined by web search
    description?: string;
    logo?: string;
    website?: string;
    headquarters?: string;
    businessModel?: string;
    primaryRevenue?: string;
    revenueBreakdown?: string; // Store as JSON string, hard to get reliably
}

async function fetchCompanyData(companyName: string): Promise<FetchedCompanyData> {
    console.log(`[Agent] Starting data fetch for: ${companyName}`);
    const fetchedData: FetchedCompanyData = {};

    // --- TODO: Replace placeholder logic with actual web_search tool calls and parsing --- 

    // 1. Search for Website & Description
    try {
        const websiteQuery = `Official website and description for "${companyName}"`;
        console.log(`[Agent] Preparing web search: ${websiteQuery}`);
        // Placeholder: Simulate call and basic parsing
        // const siteSearchResults = await web_search(websiteQuery);
        // fetchedData.website = parseWebsite(siteSearchResults); // Requires parsing logic
        // fetchedData.description = parseDescription(siteSearchResults); // Requires parsing logic
        fetchedData.website = `https://example.com/${generateSlug(companyName)}`; // Placeholder
        fetchedData.description = `Placeholder description for ${companyName}. Needs web search results parsing.`; // Placeholder
        console.log(`[Agent] Placeholder Website: ${fetchedData.website}`);
        console.log(`[Agent] Placeholder Description: ${fetchedData.description}`);
    } catch (e) { console.error(`[Agent] Error during website/description search for ${companyName}:`, e); }

    // 2. Search for Headquarters
    try {
        const hqQuery = `Headquarters location for "${companyName}"`;
        console.log(`[Agent] Preparing web search: ${hqQuery}`);
        // Placeholder: Simulate call and basic parsing
        // const hqSearchResults = await web_search(hqQuery);
        // fetchedData.headquarters = parseHeadquarters(hqSearchResults); // Requires parsing logic
        fetchedData.headquarters = `Placeholder HQ for ${companyName}. Needs web search results parsing.`; // Placeholder
        console.log(`[Agent] Placeholder Headquarters: ${fetchedData.headquarters}`);
    } catch (e) { console.error(`[Agent] Error during headquarters search for ${companyName}:`, e); }

    // 3. Search for Business Model / Revenue (Most difficult)
    try {
        const bizQuery = `How does "${companyName}" make money? Business model and primary revenue sources.`;
        console.log(`[Agent] Preparing web search: ${bizQuery}`);
        // Placeholder: Simulate call and basic parsing
        // const bizSearchResults = await web_search(bizQuery);
        // fetchedData.businessModel = parseBusinessModel(bizSearchResults); // Requires complex parsing
        // fetchedData.primaryRevenue = parsePrimaryRevenue(bizSearchResults); // Requires complex parsing
        // fetchedData.revenueBreakdown = parseRevenueBreakdown(bizSearchResults); // Requires complex parsing, format as JSON string
        fetchedData.businessModel = `Placeholder business model for ${companyName}. Needs web search results parsing.`; // Placeholder
        fetchedData.primaryRevenue = `Placeholder revenue source for ${companyName}. Needs web search results parsing.`; // Placeholder
        fetchedData.revenueBreakdown = JSON.stringify({ Placeholder: 'Needs web search results parsing' }); // Placeholder
        console.log(`[Agent] Placeholder Business Model: ${fetchedData.businessModel}`);
    } catch (e) { console.error(`[Agent] Error during business model search for ${companyName}:`, e); }
    
    // 4. Attempt to Construct Logo URL (using placeholder website for now)
    try {
       if (fetchedData.website) { // Only attempt if website was found (even placeholder)
         const domain = new URL(fetchedData.website).hostname.replace(/^www./, '');
         if (domain) {
           fetchedData.logo = `https://logo.clearbit.com/${domain}`;
           console.log(`[Agent] Guessed Logo URL: ${fetchedData.logo}`);
         }
       }
    } catch(e) { console.warn(`[Agent] Could not guess logo domain for ${companyName}:`, e); }
    
    // 5. Refine Name (Optional)
    // Placeholder: Sometimes the official name might differ slightly
    // const nameQuery = `Official name for company known as "${companyName}"`;
    // const nameSearchResults = await web_search(nameQuery);
    // fetchedData.name = parseOfficialName(nameSearchResults) || companyName; 
    fetchedData.name = companyName; // Default to original name
    
    console.log(`[Agent] Finished data fetch for: ${companyName}`, fetchedData);
    return fetchedData;
} 