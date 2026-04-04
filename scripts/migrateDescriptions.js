require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { articleModel } = require('../Models/articleModel');

const LEGACY_TYPE_MAP = {
  h3: (data) => ({ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: data }] }),
  h4: (data) => ({ type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: data }] }),
  p: (data) => ({ type: 'paragraph', content: [{ type: 'text', text: data }] }),
  br: () => ({ type: 'paragraph', content: [] }),
  hr: () => ({ type: 'horizontalRule' }),
};

function convertLegacyToTiptap(legacyArray) {
  const content = legacyArray
    .map((block) => {
      const converter = LEGACY_TYPE_MAP[block.type];
      if (!converter) return null;
      return converter(block.data || '');
    })
    .filter(Boolean);

  return { type: 'doc', content };
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const articles = await articleModel.find({ isLegacyContent: { $ne: false } });
  console.log(`Found ${articles.length} articles to inspect`);

  let migrated = 0;
  let skipped = 0;

  for (const article of articles) {
    let desc = article.description;

    if (typeof desc === 'string') {
      try { desc = JSON.parse(desc); } catch { skipped++; continue; }
    }

    if (Array.isArray(desc) && desc[0]?.type && desc[0]?.className !== undefined) {
      const tiptapDoc = convertLegacyToTiptap(desc);
      article.description = tiptapDoc;
      article.isLegacyContent = false;
      await article.save({ validateBeforeSave: false });
      migrated++;
      console.log(`  Migrated: "${article.title.substring(0, 50)}"`);
    } else {
      article.isLegacyContent = false;
      await article.save({ validateBeforeSave: false });
      skipped++;
    }
  }

  console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped.`);
  await mongoose.disconnect();
}

migrate().catch(console.error);
