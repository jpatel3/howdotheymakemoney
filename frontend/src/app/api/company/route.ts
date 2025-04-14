import { NextRequest, NextResponse } from 'next/server';

// Define company data types
export interface CompanyFinancial {
  year: number;
  revenue: number;
  revenueGrowth?: number;
  netIncome?: number;
  operatingIncome?: number;
}

export interface RevenueSegment {
  name: string;
  percentage: number;
  description: string;
  amount?: number;
}

export interface CompanyData {
  id: string;
  name: string;
  description: string;
  logo?: string;
  founded: number;
  headquarters: string;
  industry: string;
  publiclyTraded: boolean;
  stockSymbol?: string;
  employees?: number;
  website?: string;
  financials: CompanyFinancial[];
  revenueSegments: RevenueSegment[];
  businessModel: string;
  keyRevenueDrivers: string[];
  sources: string[];
  lastUpdated: string;
}

// Mock data for demonstration purposes
// In production, this would connect to a real data source
const mockCompanies: Record<string, CompanyData> = {
  'google': {
    id: 'google',
    name: 'Google (Alphabet)',
    description: 'Global technology company specializing in internet-related services and products.',
    founded: 1998,
    headquarters: 'Mountain View, California, USA',
    industry: 'Technology',
    publiclyTraded: true,
    stockSymbol: 'GOOGL',
    employees: 156500,
    website: 'https://www.google.com',
    financials: [
      { year: 2023, revenue: 307393000000, netIncome: 73795000000, operatingIncome: 84308000000 },
      { year: 2022, revenue: 282836000000, netIncome: 59972000000, operatingIncome: 74840000000 },
      { year: 2021, revenue: 257637000000, netIncome: 76033000000, operatingIncome: 78714000000 }
    ],
    revenueSegments: [
      { name: 'Google Advertising', percentage: 78.5, description: 'Includes ads on Google Search, YouTube, and partner websites', amount: 241304000000 },
      { name: 'Google Cloud', percentage: 10.8, description: 'Cloud computing services and enterprise solutions', amount: 33199000000 },
      { name: 'Google Subscriptions & Other', percentage: 7.2, description: 'YouTube Premium, YouTube TV, Google Play, and hardware', amount: 22132000000 },
      { name: 'Other Bets', percentage: 0.2, description: 'Innovative projects like Waymo (self-driving cars)', amount: 615000000 },
      { name: 'Hedging Gains', percentage: 3.3, description: 'Foreign exchange hedging program', amount: 10143000000 }
    ],
    businessModel: 'Google primarily makes money through digital advertising. When users search on Google or watch videos on YouTube, they see targeted ads based on their interests and search queries. Advertisers pay Google when users click on these ads or view them. Google Cloud is the company\'s second-largest revenue stream, providing businesses with cloud computing infrastructure and services on a subscription basis.',
    keyRevenueDrivers: [
      'Digital advertising market growth',
      'User engagement on Google Search and YouTube',
      'Cloud computing adoption by businesses',
      'Competition from other digital advertising platforms'
    ],
    sources: [
      'https://abc.xyz/investor/',
      'https://www.sec.gov/Archives/edgar/data/1652044/000165204424000008/goog-20231231.htm'
    ],
    lastUpdated: '2024-02-15'
  },
  'tesla': {
    id: 'tesla',
    name: 'Tesla, Inc.',
    description: 'Electric vehicle and clean energy company.',
    founded: 2003,
    headquarters: 'Austin, Texas, USA',
    industry: 'Automotive & Energy',
    publiclyTraded: true,
    stockSymbol: 'TSLA',
    employees: 127855,
    website: 'https://www.tesla.com',
    financials: [
      { year: 2023, revenue: 96773000000, netIncome: 15269000000, operatingIncome: 13656000000 },
      { year: 2022, revenue: 81462000000, netIncome: 12583000000, operatingIncome: 13656000000 },
      { year: 2021, revenue: 53823000000, netIncome: 5519000000, operatingIncome: 6523000000 }
    ],
    revenueSegments: [
      { name: 'Automotive Sales', percentage: 83.9, description: 'Direct sales of electric vehicles', amount: 81228000000 },
      { name: 'Automotive Regulatory Credits', percentage: 2.1, description: 'Sales of regulatory credits to other automakers', amount: 2031000000 },
      { name: 'Energy Generation & Storage', percentage: 7.3, description: 'Solar panels, Solar Roof, and Powerwall products', amount: 7705000000 },
      { name: 'Services & Other', percentage: 6.7, description: 'Vehicle service, merchandise, and used vehicle sales', amount: 6482000000 }
    ],
    businessModel: 'Tesla makes money primarily by selling electric vehicles directly to consumers, bypassing traditional dealership networks. Unlike many automakers, Tesla owns and operates its own stores and service centers. The company also generates revenue from energy products (solar panels and battery storage systems), regulatory credits sold to other automakers who don\'t meet emission standards, and services including repairs, maintenance, and software upgrades.',
    keyRevenueDrivers: [
      'Electric vehicle adoption rates',
      'Production capacity and efficiency',
      'Regulatory environment for EVs',
      'Competition in the EV market',
      'Energy storage market growth'
    ],
    sources: [
      'https://ir.tesla.com/',
      'https://www.sec.gov/Archives/edgar/data/1318605/000095017024006480/tsla-20231231.htm'
    ],
    lastUpdated: '2024-01-30'
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const companyId = url.searchParams.get('id');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Get company data
    const company = mockCompanies[companyId.toLowerCase()];
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Get company data error:', error);
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while retrieving company data' },
      { status: 500 }
    );
  }
}
