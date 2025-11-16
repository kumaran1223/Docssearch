import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import File from '../models/File.js';
import { processFile } from '../services/fileProcessor.service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEEDS_DIR = path.join(__dirname, '..', '..', 'seeds');
const UPLOADS_DIR = path.join(__dirname, '..', process.env.STORAGE_PATH || 'uploads');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDatabase();

    // Clear existing data (optional - comment out to keep existing data)
    // await File.deleteMany({});
    // console.log('✓ Cleared existing files\n');

    // Ensure uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    // Get all seed files
    const seedFiles = await fs.readdir(SEEDS_DIR);
    const textFiles = seedFiles.filter(f => f.endsWith('.txt'));

    console.log(`Found ${textFiles.length} seed files\n`);

    for (const seedFile of textFiles) {
      try {
        console.log(`Processing: ${seedFile}`);

        // Copy file to uploads directory
        const sourcePath = path.join(SEEDS_DIR, seedFile);
        const destFilename = `seed-${Date.now()}-${seedFile}`;
        const destPath = path.join(UPLOADS_DIR, destFilename);

        await fs.copyFile(sourcePath, destPath);

        // Get file stats
        const stats = await fs.stat(destPath);

        // Create file record
        const file = new File({
          title: seedFile.replace('.txt', '').replace(/-/g, ' '),
          originalName: seedFile,
          filename: destFilename,
          mimeType: 'text/plain',
          size: stats.size,
          processingStatus: 'pending'
        });

        await file.save();

        // Process file
        console.log(`  → Processing file ID: ${file._id}`);
        await processFile(file._id);
        console.log(`  ✓ Completed\n`);

      } catch (error) {
        console.error(`  ✗ Error processing ${seedFile}:`, error.message, '\n');
      }
    }

    console.log('✅ Seeding completed!\n');
    console.log('📊 Summary:');
    const total = await File.countDocuments();
    const complete = await File.countDocuments({ processingStatus: 'complete' });
    const error = await File.countDocuments({ processingStatus: 'error' });
    
    console.log(`   Total files: ${total}`);
    console.log(`   Completed: ${complete}`);
    console.log(`   Errors: ${error}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();

