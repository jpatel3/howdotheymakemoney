import { NextRequest, NextResponse } from 'next/server';
import { CompanyData } from '../company/route';
import { OpenAI } from 'openai';
import { counters } from '@/lib/server/schema';
import { getDB } from '@/lib/server/db';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-development',
});

// Define company data types for report generation
interface CompanyInfo {
  name: string;
  industry?: string;
  description?: string;
  publiclyTraded?: boolean;
  stockSymbol?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { companyName, industry, publicInfo } = await request.json();
    
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }
    
    // Generate a unique ID for the company
    const companyId = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check if report already exists in cache
    try {
      const cacheResponse = await fetch(`${request.nextUrl.origin}/api/cache?id=${companyId}`);
      
      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json();
        
        if (cacheData.success) {
          return NextResponse.json({
            success: true,
            report: cacheData.report,
            cached: true,
            cachedAt: cacheData.cachedAt
          });
        }
      }
    } catch (error) {
      console.error('Error checking cache:', error);
      // Continue with generation if cache check fails
    }
    
    // Check if report already exists in main company API
    try {
      const existingResponse = await fetch(`${request.nextUrl.origin}/api/company?id=${companyId}`);
      const existingData = await existingResponse.json();
      
      if (existingData.success) {
        return NextResponse.json({
          success: true,
          report: existingData.company,
          cached: true
        });
      }
    } catch (error) {
      console.error('Error checking existing report:', error);
      // Continue with generation if check fails
    }
    
    // In a real implementation, this would call the OpenAI API
    // For development, we'll create a mock response if no API key
    const isDevelopment = process.env.NODE_ENV !== 'production' || !process.env.OPENAI_API_KEY;
    
    let generatedReport: Partial<CompanyData>;
    
    if (isDevelopment) {
      // Generate mock report
      generatedReport = await generateMockReport(companyName, industry, publicInfo);
    } else {
      // Call OpenAI API to generate report
      generatedReport = await generateAIReport(companyName, industry, publicInfo);
    }
    
    // Store the generated report in cache
    try {
      await fetch(`${request.nextUrl.origin}/api/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          reportData: generatedReport
        }),
      });
    } catch (error) {
      console.error('Error caching report:', error);
      // Continue even if caching fails
    }
    
    // Increment reports generated counter
    try {
      const db = request.env.DB;
      const dbClient = getDB(db);
      
      await dbClient
        .update(counters)
        .set({ 
          value: sql`value + 1` 
        })
        .where(eq(counters.name, 'reports_generated'));
    } catch (error) {
      console.error('Error incrementing reports counter:', error);
      // Continue even if counter update fails
    }
    
    return NextResponse.json({
      success: true,
      report: generatedReport,
      cached: false
    });
  } catch (error) {
    console.error('Generate report error:', error);
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while generating the company report' },
      { status: 500 }
    );
  }
}

// Helper function to generate a mock report for development
async function generateMockReport(companyName: string, industry?: string, publicInfo?: string): Promise<Partial<CompanyData>> {
  const currentYear = new Date().getFullYear();
  
  // Create a mock report based on the company name
  const mockReport: Partial<CompanyData> = {
    id: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: companyName,
    description: `${companyName} is a ${industry || 'technology'} company that provides innovative solutions to customers worldwide.`,
    founded: currentYear - Math.floor(Math.random() * 30) - 5,
    headquarters: 'San Francisco, California, USA',
    industry: industry || 'Technology',
    publiclyTraded: Math.random() > 0.5,
    employees: Math.floor(Math.random() * 10000) + 100,
    financials: [
      { 
        year: currentYear - 1, 
        revenue: Math.floor(Math.random() * 10000000000) + 1000000000,
        netIncome: Math.floor(Math.random() * 1000000000) + 100000000
      },
      { 
        year: currentYear - 2, 
        revenue: Math.floor(Math.random() * 8000000000) + 1000000000,
        netIncome: Math.floor(Math.random() * 800000000) + 100000000
      }
    ],
    revenueSegments: [
      { 
        name: 'Primary Product', 
        percentage: 60 + Math.floor(Math.random() * 20), 
        description: `The main product offering from ${companyName}` 
      },
      { 
        name: 'Secondary Service', 
        percentage: 20 + Math.floor(Math.random() * 20), 
        description: 'Complementary services that enhance the primary product' 
      },
      { 
        name: 'Other Revenue', 
        percentage: 5 + Math.floor(Math.random() * 10), 
        description: 'Miscellaneous revenue sources including partnerships and licensing' 
      }
    ],
    businessModel: `${companyName} primarily makes money through a combination of product sales and subscription services. Their main revenue stream comes from their flagship product, which accounts for the majority of their income. They supplement this with service contracts, maintenance fees, and strategic partnerships.`,
    keyRevenueDrivers: [
      'Market penetration in key regions',
      'Customer retention and recurring revenue',
      'New product development and innovation',
      'Strategic partnerships and ecosystem growth'
    ],
    sources: [
      `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/about`,
      'https://www.example.com/industry-reports',
      'https://www.example.com/financial-analysis'
    ],
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  
  // Adjust revenue segments to ensure they add up to 100%
  const totalPercentage = mockReport.revenueSegments?.reduce((sum, segment) => sum + segment.percentage, 0) || 0;
  if (totalPercentage !== 100 && mockReport.revenueSegments && mockReport.revenueSegments.length > 0) {
    const diff = 100 - totalPercentage;
    mockReport.revenueSegments[0].percentage += diff;
  }
  
  // Add amounts to revenue segments based on most recent year's revenue
  if (mockReport.financials && mockReport.financials.length > 0 && mockReport.revenueSegments) {
    const mostRecentRevenue = mockReport.financials[0].revenue;
    mockReport.revenueSegments.forEach(segment => {
      segment.amount = Math.round(mostRecentRevenue * (segment.percentage / 100));
    });
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return mockReport;
}

// Function to generate a report using OpenAI
async function generateAIReport(companyName: string, industry?: string, publicInfo?: string): Promise<Partial<CompanyData>> {
  // Create a system prompt that instructs the AI how to generate the report
  const systemPrompt = `You are a financial analyst specializing in business models and revenue analysis. 
Your task is to generate a detailed report on how companies make money, focusing on their revenue streams, 
business model, and key financial metrics. The report should be accurate, well-structured, and easy to understand.`;

  // Create a user prompt with specific instructions for the report
  const userPrompt = `Generate a detailed report on how ${companyName} makes money.
${industry ? `Industry: ${industry}` : ''}
${publicInfo ? `Additional information: ${publicInfo}` : ''}

The report should include:
1. A brief company description
2. Key information like founding year, headquarters, industry, and public/private status
3. Financial data if publicly available (revenue, net income for recent years)
4. Revenue segments with percentages and descriptions (must add up to 100%)
5. A clear explanation of the business model in simple terms
6. Key revenue drivers
7. Potential data sources for further research

Format the response as a structured JSON object with the following fields:
- id: a URL-friendly version of the company name (lowercase, hyphens instead of spaces)
- name: the full company name
- description: a brief description of what the company does
- founded: founding year (integer)
- headquarters: city and country
- industry: primary industry
- publiclyTraded: boolean
- stockSymbol: if applicable
- employees: approximate number if known
- financials: array of yearly financial data with year, revenue, and netIncome
- revenueSegments: array of revenue streams with name, percentage, description, and amount
- businessModel: paragraph explaining how the company makes money
- keyRevenueDrivers: array of factors that drive revenue
- sources: array of URLs or references
- lastUpdated: today's date

Be as accurate as possible with real data. If exact figures aren't known, provide reasonable estimates based on industry knowledge.`;

  try {
    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }
    
    const reportData = JSON.parse(responseText);
    
    // Validate and clean up the data
    const report = validateAndCleanReport(reportData, companyName);
    
    return report;
  } catch (error) {
    console.error('Error generating AI report:', error);
    // Fall back to mock report if AI generation fails
    return generateMockReport(companyName, industry, publicInfo);
  }
}

// Helper function to validate and clean up the report data
function validateAndCleanReport(report: any, companyName: string): Partial<CompanyData> {
  const currentYear = new Date().getFullYear();
  
  // Ensure ID is properly formatted
  if (!report.id) {
    report.id = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  
  // Ensure name is present
  if (!report.name) {
    report.name = companyName;
  }
  
  // Ensure founded year is reasonable
  if (!report.founded || report.founded > currentYear || report.founded < 1800) {
    report.founded = currentYear - Math.floor(Math.random() * 30) - 5;
  }
  
  // Ensure revenue segments add up to 100%
  if (report.revenueSegments && report.revenueSegments.length > 0) {
    const totalPercentage = report.revenueSegments.reduce((sum: number, segment: any) => sum + (segment.percentage || 0), 0);
    
    if (Math.abs(totalPercentage - 100) > 1) {
      // Adjust the largest segment to make total 100%
      const largestSegment = report.revenueSegments.reduce(
        (largest: any, current: any) => (current.percentage > largest.percentage ? current : largest),
        report.revenueSegments[0]
      );
      
      largestSegment.percentage += (100 - totalPercentage);
    }
    
    // Round percentages to integers
    report.revenueSegments.forEach((segment: any) => {
      segment.percentage = Math.round(segment.percentage);
    });
    
    // Add amounts if financials are available
    if (report.financials && report.financials.length > 0 && report.financials[0].revenue) {
      const mostRecentRevenue = report.financials[0].revenue;
      report.revenueSegments.forEach((segment: any) => {
        segment.amount = Math.round(mostRecentRevenue * (segment.percentage / 100));
      });
    }
  }
  
  // Ensure lastUpdated is today's date
  report.lastUpdated = new Date().toISOString().split('T')[0];
  
  return report;
}
