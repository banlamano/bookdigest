import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Simple admin endpoint to update a book (temporary for fixing books one-by-one)
// Protected by secret key instead of auth
router.post('/update-book-simple', async (req, res) => {
  try {
    const { bookId, amazonLink, coverImage, secret } = req.body;

    // Simple secret check (change this to something only you know)
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
    
    if (secret !== ADMIN_SECRET) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid secret key' 
      });
    }

    if (!bookId) {
      return res.status(400).json({ 
        success: false, 
        message: 'bookId is required' 
      });
    }

    if (!amazonLink && !coverImage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either amazonLink or coverImage is required' 
      });
    }

    // Build update data
    const updateData: any = {};
    if (amazonLink) updateData.amazonLink = amazonLink;
    if (coverImage) updateData.coverImage = coverImage;

    // Update the book
    const book = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { 
        bookId: book.id,
        title: book.title,
        amazonLink: book.amazonLink,
        coverImage: book.coverImage
      },
    });

  } catch (error: any) {
    console.error('Error updating book:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update book' 
    });
  }
});

// Update AI covers endpoint
router.post('/update-covers', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const updates = [
      { id: 'cdd862b4-6956-4430-bf1f-f25df8bab67d', coverUrl: '/ai-covers/cdd862b4-6956-4430-bf1f-f25df8bab67d.svg', title: 'Surge' },
      { id: '58a328fd-20b8-491b-ac33-67b16b9c10e3', coverUrl: '/ai-covers/58a328fd-20b8-491b-ac33-67b16b9c10e3.svg', title: 'The Little Book of Hygge' },
      { id: '5e262075-eec1-4c96-948d-71a7b8c5c7c4', coverUrl: '/ai-covers/5e262075-eec1-4c96-948d-71a7b8c5c7c4.svg', title: "The Artist's Journey" },
      { id: '4fd86172-8fd6-42c4-b828-6249ded0da71', coverUrl: '/ai-covers/4fd86172-8fd6-42c4-b828-6249ded0da71.svg', title: 'How to Win at the Sport of Business' },
      { id: 'dfe39378-fd0c-4bb6-b1fc-55ce007fb058', coverUrl: '/ai-covers/dfe39378-fd0c-4bb6-b1fc-55ce007fb058.svg', title: 'The Aladdin Factor' },
      { id: '1972ed08-2fdb-4d8a-8cd7-3b73594fe92c', coverUrl: '/ai-covers/1972ed08-2fdb-4d8a-8cd7-3b73594fe92c.svg', title: 'Clockwork' },
      { id: '2ad5ab0d-0a7e-4286-a296-5c2b856d5ee3', coverUrl: '/ai-covers/2ad5ab0d-0a7e-4286-a296-5c2b856d5ee3.svg', title: 'The Unfair Advantage' },
      { id: '6b3affb3-71f1-4e78-b1b9-43f37492c280', coverUrl: '/ai-covers/6b3affb3-71f1-4e78-b1b9-43f37492c280.svg', title: 'Decisive' },
      { id: '48ad8c89-0f76-4dd9-9362-9bf09560b2b2', coverUrl: '/ai-covers/48ad8c89-0f76-4dd9-9362-9bf09560b2b2.svg', title: 'Crushing It!' },
      { id: '65d199bb-c4d0-4470-9586-56e6842ee56b', coverUrl: '/ai-covers/65d199bb-c4d0-4470-9586-56e6842ee56b.svg', title: 'Margin of Safety' },
      { id: '9daf5ba5-3d53-4901-91cf-aebffd5a96e3', coverUrl: '/ai-covers/9daf5ba5-3d53-4901-91cf-aebffd5a96e3.svg', title: 'I Know How She Does It' },
      { id: 'e531cbbf-7d06-4a90-aa39-5a89316bb246', coverUrl: '/ai-covers/e531cbbf-7d06-4a90-aa39-5a89316bb246.svg', title: "It Doesn't Have to Be Crazy at Work" },
      { id: 'dd516700-ffc8-4724-aadc-db44b8b0c967', coverUrl: '/ai-covers/dd516700-ffc8-4724-aadc-db44b8b0c967.svg', title: 'Purple Cow' },
      { id: '82050fc4-ef99-4e0a-8dc3-bd5b51d3f933', coverUrl: '/ai-covers/82050fc4-ef99-4e0a-8dc3-bd5b51d3f933.svg', title: 'The Second Machine Age' },
      { id: '1acab521-4d6f-432b-af4b-515aaa053612', coverUrl: '/ai-covers/1acab521-4d6f-432b-af4b-515aaa053612.svg', title: 'The Compound Effect' },
      { id: 'a76e6ebb-55d2-40d6-9ffd-1975433f73ba', coverUrl: '/ai-covers/a76e6ebb-55d2-40d6-9ffd-1975433f73ba.svg', title: 'The Telomere Effect' },
      { id: '006d6f26-2829-4f8c-aaa0-e66ad69de651', coverUrl: '/ai-covers/006d6f26-2829-4f8c-aaa0-e66ad69de651.svg', title: 'The Snowball' },
      { id: '5b9a9415-19fb-471f-9baa-1d27c4cde51d', coverUrl: '/ai-covers/5b9a9415-19fb-471f-9baa-1d27c4cde51d.svg', title: 'The Sales Acceleration Formula' },
    ];

    const results = [];
    let success = 0;

    for (const update of updates) {
      try {
        await prisma.book.update({
          where: { id: update.id },
          data: { coverImage: update.coverUrl }
        });
        results.push({ title: update.title, status: 'success' });
        success++;
      } catch (error: any) {
        results.push({ title: update.title, status: 'failed', error: error.message });
      }
    }

    await prisma.$disconnect();

    res.json({
      success: true,
      message: `Updated ${success}/${updates.length} covers`,
      data: { total: updates.length, success, results }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
