import 'dotenv/config';
import { connectDatabase } from '../config/database.js';
import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  { name: 'Campaigns', description: 'Marketing campaign briefs, plans, and strategies' },
  { name: 'Research', description: 'Market research, customer insights, and analysis' },
  { name: 'Strategy', description: 'Strategic planning documents and roadmaps' },
  { name: 'Budget', description: 'Budget allocations, financial planning, and forecasts' },
  { name: 'Creative', description: 'Creative briefs, design guidelines, and brand assets' },
  { name: 'Analytics', description: 'Performance reports, metrics, and data analysis' },
  { name: 'Legal', description: 'Legal documents, compliance, and regulations' },
  { name: 'Contracts', description: 'Partnership agreements and vendor contracts' },
  { name: 'Meeting Notes', description: 'Team meetings, brainstorms, and discussions' },
  { name: 'Reports', description: 'Status reports, summaries, and documentation' },
  { name: 'Uncategorized', description: 'Documents pending classification' }
];

async function seedCategories() {
  try {
    await connectDatabase();

    console.log('🌱 Seeding default categories...');

    for (const categoryData of DEFAULT_CATEGORIES) {
      const existing = await Category.findOne({ name: categoryData.name });
      
      if (!existing) {
        const category = new Category(categoryData);
        await category.save();
        console.log(`✓ Created category: ${categoryData.name}`);
      } else {
        console.log(`⊘ Category already exists: ${categoryData.name}`);
      }
    }

    console.log('✅ Category seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();

