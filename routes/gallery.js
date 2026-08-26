const router = require('express').Router();
const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function generateUniqueSlug(title, excludeId = null) {
  let baseSlug = slugify(title || 'project');
  if (!baseSlug) baseSlug = 'project';
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Gallery.findOne(query);
    if (!exists) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

// Public: get all images/projects (optionally filter by category or featured)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'all' && req.query.category !== 'All') {
      filter.category = new RegExp(`^${req.query.category}$`, 'i');
    }
    if (req.query.featured === 'true' || req.query.featured === true) {
      filter.featured = true;
    }
    const items = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });

    // Auto backfill slugs for existing records missing a slug
    for (const item of items) {
      if (!item.slug) {
        item.slug = await generateUniqueSlug(item.title, item._id);
        await item.save();
      }
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: get single project by slug or MongoDB _id
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    let item = null;

    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      item = await Gallery.findById(slugOrId);
    }
    if (!item) {
      item = await Gallery.findOne({ slug: slugOrId });
    }
    if (!item) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!item.slug) {
      item.slug = await generateUniqueSlug(item.title, item._id);
      await item.save();
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create project
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, category, description, location, year, scope, featured, order } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Category is required' });
    }
    const imageUrl = upload.getImageUrl(req.file);
    if (!imageUrl) {
      return res.status(400).json({ message: 'Project image is required' });
    }

    const slug = await generateUniqueSlug(req.body.slug || title);

    const item = await Gallery.create({
      title: title.trim(),
      category: category.trim().toLowerCase(),
      description: description ? description.trim() : '',
      location: location ? location.trim() : 'Mumbai',
      year: year ? year.trim() : new Date().getFullYear().toString(),
      scope: scope ? scope.trim() : '',
      featured: featured === 'true' || featured === true,
      order: Number(order) || 0,
      imageUrl,
      slug
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update project
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const existing = await Gallery.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const update = {};
    if (req.body.title !== undefined) update.title = req.body.title.trim();
    if (req.body.category !== undefined) update.category = req.body.category.trim().toLowerCase();
    if (req.body.description !== undefined) update.description = req.body.description.trim();
    if (req.body.location !== undefined) update.location = req.body.location.trim();
    if (req.body.year !== undefined) update.year = req.body.year.trim();
    if (req.body.scope !== undefined) update.scope = req.body.scope.trim();
    if (req.body.order !== undefined) update.order = Number(req.body.order) || 0;
    if (req.body.featured !== undefined) {
      update.featured = req.body.featured === 'true' || req.body.featured === true;
    }

    // Slug management: preserve existing slug unless explicitly requested
    if (req.body.slug && req.body.slug.trim()) {
      update.slug = await generateUniqueSlug(req.body.slug, existing._id);
    } else if (!existing.slug) {
      update.slug = await generateUniqueSlug(update.title || existing.title, existing._id);
    }

    if (req.file) {
      update.imageUrl = upload.getImageUrl(req.file);
    }

    const item = await Gallery.findByIdAndUpdate(req.params.id, update, { new: true });

    // Clean up old image if a new one was uploaded and saved successfully
    if (req.file && existing.imageUrl && existing.imageUrl !== item.imageUrl) {
      await upload.deleteImage(existing.imageUrl);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (item) {
      if (item.imageUrl) {
        await upload.deleteImage(item.imageUrl);
      }
      if (Array.isArray(item.images)) {
        for (const img of item.images) {
          await upload.deleteImage(img);
        }
      }
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
