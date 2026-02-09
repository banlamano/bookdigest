import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters for custom OG images
    const title = searchParams.get('title') || 'BookDigest - Free AI Book Summaries';
    const subtitle = searchParams.get('subtitle') || 'Learn from 1000+ Books in 15 Minutes';
    const type = searchParams.get('type') || 'default'; // default, book, category

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e40af',
            backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            position: 'relative',
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              textAlign: 'center',
            }}
          >
            {/* Logo/Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                }}
              >
                📚
              </div>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: type === 'book' ? '56px' : '72px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0',
                marginBottom: '20px',
                lineHeight: 1.2,
                maxWidth: '1000px',
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '36px',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0',
                marginBottom: '40px',
                maxWidth: '900px',
              }}
            >
              {subtitle}
            </p>

            {/* Badge/CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '16px 32px',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: '600',
                  display: 'flex',
                }}
              >
                🎯 100% Free
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '16px 32px',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: '600',
                  display: 'flex',
                }}
              >
                ⚡ 454+ Books
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '0',
              right: '0',
              display: 'flex',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '24px',
            }}
          >
            book-digest.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
