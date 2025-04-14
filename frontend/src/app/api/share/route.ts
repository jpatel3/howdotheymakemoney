import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    const companyName = url.searchParams.get('companyName');
    
    if (!companyId || !companyName) {
      return NextResponse.json(
        { error: 'Company ID and name are required' },
        { status: 400 }
      );
    }
    
    // Generate sharing URLs for different platforms
    const encodedName = encodeURIComponent(companyName);
    const encodedUrl = encodeURIComponent(`https://howdotheymakemoney.com/company/${companyId}`);
    const encodedText = encodeURIComponent(`Check out how ${companyName} makes money on HowDoTheyMakeMoney.com`);
    
    const sharingLinks = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
      email: `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`,
      copyLink: `https://howdotheymakemoney.com/company/${companyId}`
    };
    
    return NextResponse.json({
      success: true,
      sharingLinks
    });
  } catch (error) {
    console.error('Generate sharing links error:', error);
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while generating sharing links' },
      { status: 500 }
    );
  }
}
