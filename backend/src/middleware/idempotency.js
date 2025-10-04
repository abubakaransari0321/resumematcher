import mongoose from 'mongoose';

// In-memory store for idempotency keys (in production, use Redis)
const idempotencyStore = new Map();

// Schema for storing idempotent requests in DB
const idempotencySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  statusCode: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto-delete after 24 hours
  },
});

const IdempotencyRecord = mongoose.model('IdempotencyRecord', idempotencySchema);

/**
 * Idempotency middleware
 * Checks for Idempotency-Key header and prevents duplicate requests
 */
export const idempotency = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];

  // If no idempotency key, proceed normally
  if (!idempotencyKey) {
    return next();
  }

  // Only apply to POST, PUT, PATCH requests
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  try {
    // Check in-memory store first (faster)
    const memoryRecord = idempotencyStore.get(idempotencyKey);
    if (memoryRecord && memoryRecord.user_id === req.user._id.toString()) {
      return res.status(memoryRecord.statusCode).json(memoryRecord.response);
    }

    // Check database for persisted records
    const dbRecord = await IdempotencyRecord.findOne({
      key: idempotencyKey,
      user_id: req.user._id,
    });

    if (dbRecord) {
      // Cache in memory for faster subsequent lookups
      idempotencyStore.set(idempotencyKey, {
        user_id: req.user._id.toString(),
        response: dbRecord.response,
        statusCode: dbRecord.statusCode,
      });

      return res.status(dbRecord.statusCode).json(dbRecord.response);
    }

    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      // Save the response for future idempotent requests
      try {
        const record = {
          user_id: req.user._id.toString(),
          response: body,
          statusCode: res.statusCode || 200,
        };

        // Save to memory
        idempotencyStore.set(idempotencyKey, record);

        // Save to database
        await IdempotencyRecord.create({
          key: idempotencyKey,
          user_id: req.user._id,
          response: body,
          statusCode: res.statusCode || 200,
        });
      } catch (error) {
        console.error('Error saving idempotency record:', error);
      }

      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('Idempotency middleware error:', error);
    next();
  }
};

// Cleanup memory store periodically (every hour)
setInterval(() => {
  idempotencyStore.clear();
}, 3600000);

export default idempotency;
