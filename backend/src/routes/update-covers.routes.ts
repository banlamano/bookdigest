import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Admin endpoint to update AI covers
router.post('/update-ai-covers', async (req, res) => {
  try {
    console.log('🎨 Starting AI cover updates...');

    const updates = [
      { id: '74b0d5dc-6350-4b6e-9f44-39a66ff0c360', coverUrl: '/ai-covers/74b0d5dc-6350-4b6e-9f44-39a66ff0c360.svg', title: 'Surge' },
      { id: '9abe3264-bb5c-4102-840c-8c1c21d2bf50', coverUrl: '/ai-covers/9abe3264-bb5c-4102-840c-8c1c21d2bf50.svg', title: 'The Little Book of Hygge' },
      { id: 'b9066e33-441c-4efc-b0f8-4ed1a1332ea5', coverUrl: '/ai-covers/b9066e33-441c-4efc-b0f8-4ed1a1332ea5.svg', title: "The Artist's Journey" },
      { id: 'ce14c6a7-6f8d-4d37-94d3-ca941942aa92', coverUrl: '/ai-covers/ce14c6a7-6f8d-4d37-94d3-ca941942aa92.svg', title: 'How to Win at the Sport of Business' },
      { id: '641592d1-cf3a-4bea-ae4b-88ae283b40d5', coverUrl: '/ai-covers/641592d1-cf3a-4bea-ae4b-88ae283b40d5.svg', title: 'The Aladdin Factor' },
      { id: '69611b75-ac8c-4a74-991c-946cde526044', coverUrl: '/ai-covers/69611b75-ac8c-4a74-991c-946cde526044.svg', title: 'Clockwork' },
      { id: '0365165a-d499-4b47-9573-255c1dbe4ef4', coverUrl: '/ai-covers/0365165a-d499-4b47-9573-255c1dbe4ef4.svg', title: 'The Unfair Advantage' },
      { id: '49b84f81-5286-4cc1-85fd-7302f20bfd9b', coverUrl: '/ai-covers/49b84f81-5286-4cc1-85fd-7302f20bfd9b.svg', title: 'Decisive' },
      { id: '74826407-8576-435c-bf77-80f497139c38', coverUrl: '/ai-covers/74826407-8576-435c-bf77-80f497139c38.svg', title: 'Crushing It!' },
      { id: '6295da35-0ecb-4f2c-82c7-921ed0ed428b', coverUrl: '/ai-covers/6295da35-0ecb-4f2c-82c7-921ed0ed428b.svg', title: 'Margin of Safety' },
      { id: '89caadae-e349-4ecf-96c1-1046c832023d', coverUrl: '/ai-covers/89caadae-e349-4ecf-96c1-1046c832023d.svg', title: 'I Know How She Does It' },
      { id: '295f79b1-15bf-4ddb-88ff-bd804c497832', coverUrl: '/ai-covers/295f79b1-15bf-4ddb-88ff-bd804c497832.svg', title: "It Doesn't Have to Be Crazy at Work" },
      { id: '0955331c-c786-4bad-8d73-2ab939c9a23d', coverUrl: '/ai-covers/0955331c-c786-4bad-8d73-2ab939c9a23d.svg', title: 'Purple Cow' },
      { id: '6cbb6b83-d106-413d-95f9-d5284a657726', coverUrl: '/ai-covers/6cbb6b83-d106-413d-95f9-d5284a657726.svg', title: 'The Second Machine Age' },
      { id: '3d9478ab-9967-4311-a2d4-039dd0fcf02c', coverUrl: '/ai-covers/3d9478ab-9967-4311-a2d4-039dd0fcf02c.svg', title: 'The Compound Effect' },
      { id: 'e6156973-00f0-4a0a-be4e-086c3a58b577', coverUrl: '/ai-covers/e6156973-00f0-4a0a-be4e-086c3a58b577.svg', title: 'The Telomere Effect' },
      { id: 'c1eb086f-b794-4a47-825a-a182ae2f3bb6', coverUrl: '/ai-covers/c1eb086f-b794-4a47-825a-a182ae2f3bb6.svg', title: 'The Snowball' },
      { id: 'd70edb81-256b-43e2-9b70-7ab9bed02645', coverUrl: '/ai-covers/d70edb81-256b-43e2-9b70-7ab9bed02645.svg', title: 'The Sales Acceleration Formula' },
    ];

    const results = [];
    let success = 0;
    let failed = 0;

    for (const update of updates) {
      try {
        const book = await prisma.book.update({
          where: { id: update.id },
          data: { coverImage: update.coverUrl }
        });

        console.log(`✅ Updated: ${update.title}`);
        results.push({
          id: update.id,
          title: update.title,
          coverUrl: update.coverUrl,
          status: 'success'
        });
        success++;
      } catch (error: any) {
        console.error(`❌ Failed: ${update.title} - ${error.message}`);
        results.push({
          id: update.id,
          title: update.title,
          status: 'failed',
          error: error.message
        });
        failed++;
      }
    }

    console.log(`\n📊 Summary: ${success} success, ${failed} failed`);

    res.json({
      success: true,
      message: 'AI cover update completed',
      data: {
        total: updates.length,
        success,
        failed,
        results
      }
    });

  } catch (error: any) {
    console.error('Error updating covers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update covers',
      error: error.message
    });
  }
});

export default router;
