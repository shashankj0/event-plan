import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req.headers.get('x-user-id'));
    const eventId = params.id;

    const auth = await verifyEventAccess(eventId, user.id, 'VIEW');
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { preference: true },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const isWedding = event.eventType === 'Wedding';
    const isMaharashtrian =
      event.preference?.culturalTraditions?.toLowerCase().includes('maharashtrian') ||
      event.location.toLowerCase().includes('pune');

    const studioAssets = {
      colorPalette: isMaharashtrian
        ? [
            { name: 'Royal Kesari (Saffron)', hex: '#FF5441', role: 'Primary Accent & Ceremonial Highlights' },
            { name: 'Heritage Marigold Gold', hex: '#E5C07B', role: 'Mandap, Diyas & Floral Garlands' },
            { name: 'Midnight Maratha Navy', hex: '#0B1120', role: 'Dignified Grounding & Text Hierarchy' },
            { name: 'Paithani Violet', hex: '#8B5CF6', role: 'Evening Reception Glow & Silk Draping' },
            { name: 'Mogra Cream', hex: '#FDFAF4', role: 'Soft Ivory Linens & Invitation Cards' },
          ]
        : [
            { name: 'Champagne Coral', hex: '#FF5441', role: 'Signature Warm Accent' },
            { name: 'Deep Midnight Navy', hex: '#0B1120', role: 'Architectural Grounding' },
            { name: 'Gilded Brass', hex: '#E5C07B', role: 'Stage & Cutlery Accents' },
            { name: 'Twilight Lavender', hex: '#8B5CF6', role: 'Ambient Stage Backlights' },
            { name: 'Warm Ivory', hex: '#FDFAF4', role: 'Table Linens & Backdrops' },
          ],
      invitations: [
        {
          style: 'Royal & Traditional',
          heading: isMaharashtrian ? '॥ श्री गणेशाय नमः ॥ शुभ विवाह' : 'A Celebration of Love & Heritage',
          content: `We request the honor of your gracious presence as we celebrate the wedding festivities of Tanvi & Advaith in ${event.location}. With the blessings of our ancestors and family, join us for auspicious rituals and a joyful feast.`,
          dressCode: 'Traditional Indian Festive (Nauvari, Paithani, Kurta-Pajama)',
        },
        {
          style: 'Warm & Intimate',
          heading: 'Together is a Beautiful Place to Be',
          content: `Two families, endless laughter, and one lifetime of happiness. We can't wait to share our special moments with the people who mean the world to us in ${event.location}.`,
          dressCode: 'Festive Chic / Elegant Ethnic',
        },
        {
          style: 'Contemporary & Elegant',
          heading: 'Save the Date for Our Grand Celebration',
          content: `Join us under the Pune sky for an evening of music, gourmet dining, and joyful celebrations. Kindly confirm your RSVP and dietary preferences online.`,
          dressCode: 'Black Tie Optional / Formal Ethnic',
        },
      ],
      curatedMenu: [
        {
          course: 'Traditional Welcome Drinks & Refreshments',
          items: ['Fresh Chilled Kokum Sherbet with roasted cumin', 'Spiced Kesar Almond Thandai', 'Fresh Coconut Water stations'],
        },
        {
          course: 'Live Artisanal Starters & Pangat Appetizers',
          items: [
            'Crispy Kothimbir Vadi with fresh coconut chutney',
            'Golden Sabudana Vada bites with sweetened curd',
            'Charcoal Tandoori Malai Paneer skewers with mint relish',
            'Alu Vadi (Colocasia leaf pinwheels) with sesame glaze',
          ],
        },
        {
          course: 'Royal Maharashtrian Main Course',
          items: [
            'Aromatic Varan Bhaat drizzled with pure Sajuk Tup (Clarified Ghee)',
            'Spiced Matki Usal with freshly baked Bajra Bhakri & soft Puris',
            'Rich Paneer Kolhapuri with whole Kashmiri chilies',
            'Dal Tadka & Steamed Jeera Basmati Rice',
            'Khamang Kakdi (Maharashtrian cucumber peanut salad)',
          ],
        },
        {
          course: 'Divine Traditional Desserts',
          items: [
            'Warm Ukdiche Modak with nutmeg and saffron milk dip',
            'Handmade Puran Poli served straight from the tawa with warm milk',
            'Creamy Kesari Elaichi Shrikhand with pistachio slivers',
          ],
        },
      ],
      socialMediaKit: {
        suggestedHashtags: isMaharashtrian
          ? ['#TanviWedsAdvaith', '#MarathaRoyalWedding', '#PuneWeddingVibes', '#PeshwaGrandeur', '#EventVerseAI']
          : ['#CelebratingUs', '#UnforgettableMoments', '#PuneEvents', '#EventVerseAI'],
        instagramCaptions: [
          'Two hearts, countless blessings, and a celebration steeped in royal tradition. ✨💐 #TanviWedsAdvaith',
          'Where heritage meets modern love under the golden Pune sunshine. 🕊️💛',
          'Counting down the moments until we celebrate with the ones we love most! 🥂',
        ],
      },
      photoBoothConcept: {
        title: 'Peshwa Royal Palace Courtyard Arch',
        description:
          'A handcrafted carved teakwood frame adorned with cascading fresh orange and yellow marigolds, 4 antique brass hanging lamps (samai), and whimsical selfie props including traditional Maharashtrian Pagadi, Paithani stoles, and royal hand fans.',
      },
      playlistVibes: [
        { phase: 'Morning Auspicious Muhurt', genre: 'Acoustic Shehnai, Sitar & Bansuri Classical Ragas (Bhairav & Yaman)' },
        { phase: 'Afternoon Feast', genre: 'Gentle Indian Instrumental Fusion & Santoor Melodies' },
        { phase: 'Evening Reception', genre: 'Uplifting Acoustic Bollywood Classics & Warm Contemporary Beats' },
      ],
    };

    return NextResponse.json({ success: true, studioAssets });
  } catch (error) {
    console.error('Error generating studio assets:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate creative studio assets.' }, { status: 500 });
  }
}
