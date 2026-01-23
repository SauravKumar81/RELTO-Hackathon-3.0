import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Report from '../models/Report';
import Item from '../models/Item';
import User from '../models/User';
import cloudinary from '../config/cloudinary';

export const createReport = async (req: Request, res: Response) => {
  const { itemId, reportedUserId, reason, description } = req.body;

  if (!itemId || !reportedUserId || !reason || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (description.length < 10) {
    return res.status(400).json({ message: 'Description must be at least 10 characters' });
  }

  const validReasons = [
    'false_claim',
    'item_not_returned',
    'suspicious_behavior',
    'scam_attempt',
    'harassment',
    'other',
  ];

  if (!validReasons.includes(reason)) {
    return res.status(400).json({ message: 'Invalid reason' });
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    return res.status(404).json({ message: 'Reported user not found' });
  }

  const reporterId = (req as any).user.id;

  if (reporterId === reportedUserId) {
    return res.status(400).json({ message: 'Cannot report yourself' });
  }

  const existingReport = await Report.findOne({
    reportedItem: itemId,
    reportedUser: reportedUserId,
    reporter: reporterId,
  });

  if (existingReport) {
    return res.status(400).json({ message: 'You have already reported this user for this item' });
  }

  let evidenceUrl;
  if (req.file) {
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'reports',
      }
    );
    evidenceUrl = result.secure_url;
  }

  const report = await Report.create({
    reportedItem: itemId,
    reportedUser: reportedUserId,
    reporter: reporterId,
    reason,
    description,
    evidence: evidenceUrl,
  });

  await report.populate('reportedItem', 'title type category');
  await report.populate('reportedUser', 'name email');
  await report.populate('reporter', 'name email');

  res.status(201).json(report);
};

export const getMyReports = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const reports = await Report.find({ reporter: userId })
    .populate('reportedItem', 'title type category imageUrl')
    .populate('reportedUser', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json(reports);
};

export const getReport = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid report ID format' });
  }

  const report = await Report.findById(id)
    .populate('reportedItem', 'title type category description imageUrl owner claimer')
    .populate('reportedUser', 'name email')
    .populate('reporter', 'name email');

  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  const userId = (req as any).user.id;
  const isReporter = report.reporter.toString() === userId;

  if (!isReporter) {
    return res.status(403).json({ message: 'You can only view your own reports' });
  }

  res.status(200).json(report);
};
