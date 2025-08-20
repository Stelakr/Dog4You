const express = require('express');
const router = express.Router();
const Breed = require('../models/Breed');

// Utility to safely parse numbers
const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

// Allowed filters (whitelist) for clarity/debug
const allowedFilters = new Set([
  'energyLevel', 'trainability', 'droolingLevel', 'opennessToStrangers',
  'protectiveNature', 'playfulnessLevel', 'adaptabilityLevel',
  'affectionateWithFamily', 'goodWithKids', 'goodWithOtherDogs',
  'barkingLevel', 'shedding', 'weight.min', 'weight.max', 
  'height.min', 'height.max', 'lifeExpectancy.min',  
  'lifeExpectancy.max', 'livingEnvironment',
  'coatType', 'coatLength'
]);

/**
 * GET /api/breeds
 * Filtered, paginated, sortable list
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'name', ...filters } = req.query;

    // Warn about unknown filters (could be strict later)
    Object.keys(filters).forEach(key => {
      if (!allowedFilters.has(key)) {
        console.warn(`Unknown filter passed to /api/breeds: ${key}`);
      }
    });

    const query = {};

    // Numeric trait filters
    const numericTraits = [
      'energyLevel', 'trainability', 'droolingLevel', 'opennessToStrangers',
      'protectiveNature', 'playfulnessLevel', 'adaptabilityLevel',
      'affectionateWithFamily', 'goodWithKids', 'goodWithOtherDogs', 
      'barkingLevel', 'shedding'
    ];

    numericTraits.forEach(trait => {
      const val = safeNumber(filters[trait]);
      if (val !== undefined) {
        query[trait] = val;
      }
    });

    // Range fields
    const rangeFields = ['weight', 'height', 'lifeExpectancy'];
    rangeFields.forEach(field => {
      const min = safeNumber(filters[`${field}.min`]);
      const max = safeNumber(filters[`${field}.max`]);

      if (min !== undefined || max !== undefined) {
        query[field] = {};
        if (min !== undefined) query[field].min = { $gte: min };
        if (max !== undefined) query[field].max = { $lte: max };
      }
    });

    // Enum / array fields
    if (filters.livingEnvironment) query.livingEnvironment = filters.livingEnvironment;
    if (filters.coatType) query.coatType = filters.coatType;
    if (filters.coatLength) query.coatLength = filters.coatLength;

    // Pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Sorting
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const breeds = await Breed.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Breed.countDocuments(query);

    res.json({
      success: true,
      count: breeds.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: breeds
    });
  } catch (err) {
    console.error('❌ Error filtering breeds:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while filtering breeds.'
    });
  }
});

/**
 * GET /api/breeds/names
 * Returns list of breed names for autocomplete (could be limited/paginated later)
 */
router.get('/names', async (req, res) => {
  try {
    const breeds = await Breed.find({}, { name: 1 }).lean();
    const names = breeds.map(b => b.name).sort();
    res.json({ success: true, data: names });
  } catch (err) {
    console.error('❌ Error fetching breed names:', err);
    res.status(500).json({ success: false, error: 'Server error fetching breed names.' });
  }
});

/**
 * GET /api/breeds/:name
 * Case-insensitive single breed lookup
 */
router.get('/:name', async (req, res) => {
  try {
    const name = req.params.name;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Breed name is required' });
    }

    const breed = await Breed.findOne({ nameLower: name.toLowerCase() }).lean();
    if (!breed) {
      return res.status(404).json({ success: false, error: 'Breed not found' });
    }

    res.json({ success: true, data: breed });
  } catch (err) {
    console.error('❌ Error fetching single breed:', err);
    res.status(500).json({ success: false, error: 'Server error while fetching breed.' });
  }
});

module.exports = router;
