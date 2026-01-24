import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item';
import User from '../models/User';
import cloudinary from '../config/cloudinary';
import { POINTS, calculateLevel } from '../utils/gamification';

export const createItem = async (req: Request, res: Response) => {
  const {
    title,
    description,
    type,
    category,
    latitude,
    longitude,
    radius,
    expiresAt,
  } = req.body;

  
  if (
    !title ||
    !type ||
    !['lost', 'found'].includes(type) ||
    !category ||
    latitude == null ||
    longitude == null ||
    !expiresAt
  ) {
    return res.status(400).json({ message: 'Invalid or missing fields' });
  }
  

  let imageUrl;

  if (req.file) {
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'lost-and-found',
      }
    );
    imageUrl = result.secure_url;
  }

  const item = await Item.create({
    title,
    description,
    type,
    category,
    imageUrl,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    radius,
    owner: (req as any).user.id,
    expiresAt,
  });

  const user = await User.findById((req as any).user.id);
  if (user) {
    user.points += POINTS.POST_ITEM;
    user.level = calculateLevel(user.points);
    user.itemsPosted += 1;
    await user.save();
  }

  await item.populate('owner', 'name');

  res.status(201).json(item);
};


export const getAllItems = async (req: Request, res: Response) => {
  try {
    const items = await Item.find({
      isResolved: false,
    })
      .populate('owner', 'name')
      .populate('claimer', 'name');

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNearbyItems = async (req: Request, res: Response) => {
  const { lat, lng, radius = 2000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude required' });
  }

  const items = await Item.find({
    isResolved: false,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)],
        },
        $maxDistance: Number(radius),
      },
    },
  })
    .populate('owner', 'name')
    .populate('claimer', 'name');

  res.status(200).json(items);
};

export const getItemById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid item ID format' });
  }

  const item = await Item.findById(id)
    .populate('owner', 'name')
    .populate('claimer', 'name');

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.status(200).json(item);
};

export const resolveItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid item ID format' });
  }

  const item = await Item.findById(id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const userId = (req as any).user.id;
  const isOwner = item.owner.toString() === userId;
  const isClaimer = item.claimer?.toString() === userId;

  if (!isOwner && !isClaimer) {
    return res.status(403).json({ message: 'Not authorized. Only the finder or claimer can resolve this item.' });
  }

  item.isResolved = true;
  item.resolvedAt = new Date();
  item.resolvedBy = userId;
  await item.save();

  const owner = await User.findById(item.owner);
  if (owner) {
    owner.points += POINTS.CONFIRM_RETURN;
    owner.level = calculateLevel(owner.points);
    owner.itemsReturned += 1;
    await owner.save();
  }

  if (item.claimer) {
    const claimer = await User.findById(item.claimer);
    if (claimer) {
      claimer.points += POINTS.CONFIRM_RETURN;
      claimer.level = calculateLevel(claimer.points);
      await claimer.save();
    }
  }

  res.status(200).json({ message: 'Item resolved' });
};

export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid item ID format' });
  }

  const item = await Item.findById(id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const userId = (req as any).user.id;
  if (item.owner.toString() !== userId) {
    return res.status(403).json({ message: 'Not authorized. Only the owner can delete this item.' });
  }

  await Item.findByIdAndDelete(id);

  res.status(200).json({ message: 'Item deleted successfully' });
};

export const claimItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid item ID format' });
  }

  const item = await Item.findById(id).populate('owner', 'name').populate('claimer', 'name');

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.isResolved) {
    return res.status(400).json({ message: 'Item already resolved' });
  }

  if (item.claimer) {
    return res.status(400).json({ message: 'Item already claimed by someone else' });
  }

  if (item.owner.toString() === (req as any).user.id) {
    return res.status(400).json({ message: 'Cannot claim your own item' });
  }

  item.claimer = (req as any).user.id;
  item.claimedAt = new Date();
  await item.save();

  const claimer = await User.findById((req as any).user.id);
  if (claimer) {
    claimer.points += POINTS.CLAIM_ITEM;
    claimer.level = calculateLevel(claimer.points);
    claimer.itemsClaimed += 1;
    await claimer.save();
  }

  await item.populate('claimer', 'name');

  res.status(200).json(item);
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      category, 
      type, 
      page = 1, 
      limit = 20,
      sortBy = 'resolvedAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = { isResolved: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (type && ['lost', 'found'].includes(type as string)) {
      query.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const items = await Item.find(query)
      .populate('owner', 'name email')
      .populate('claimer', 'name email')
      .populate('resolvedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Item.countDocuments(query);

    res.status(200).json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHistoryItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid item ID format' });
  }

  const item = await Item.findById(id)
    .populate('owner', 'name email')
    .populate('claimer', 'name email')
    .populate('resolvedBy', 'name');

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (!item.isResolved) {
    return res.status(400).json({ message: 'Item is not resolved yet' });
  }

  res.status(200).json(item);
};
