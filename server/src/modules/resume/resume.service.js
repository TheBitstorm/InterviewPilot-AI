// src/modules/resume/resume.service.js
// Business logic for resume upload, storage, and retrieval.
// Follows the same pattern as auth.service.js — no HTTP logic here.

const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const prisma = require('../../config/db');
const AppError = require('../../utils/AppError');

/**
 * Parse PDF from a local file path and return the extracted text.
 * Uses pdf-parse v2 API: new PDFParse({ data: buffer }).getText()
 * Cleans up the temp file after reading regardless of success/failure.
 */
const extractPdfText = async (filePath) => {
  let dataBuffer;
  try {
    dataBuffer = fs.readFileSync(filePath);
  } catch {
    throw new AppError('Failed to read uploaded file.', 500);
  } finally {
    // Always delete temp file — success or failure
    try { fs.unlinkSync(filePath); } catch { /* ignore cleanup errors */ }
  }

  // pdf-parse v2: use PDFParse class with { data: buffer }
  const parser = new PDFParse({ data: dataBuffer, verbosity: 0 });
  try {
    const result = await parser.getText();
    const text = (result?.text || '').trim();
    if (!text) throw new AppError('Could not extract text from the PDF. The file may be scanned or image-based.', 422);
    return text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('PDF parsing failed. Please upload a valid, text-based PDF.', 422);
  } finally {
    try { await parser.destroy(); } catch { /* ignore */ }
  }
};

/**
 * Upload a new resume:
 * 1. Parse PDF text
 * 2. Deactivate all existing resumes for this user
 * 3. Create new Resume record (active = true)
 * Returns the created resume (without parsedText to keep response small).
 */
const uploadResume = async ({ userId, fileName, filePath }) => {
  // Parse text — also deletes temp file
  const parsedText = await extractPdfText(filePath);

  // Deactivate all previous resumes in a single query
  await prisma.resume.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  // Create new active resume
  const resume = await prisma.resume.create({
    data: {
      userId,
      fileName,
      filePath: '', // No persistent disk storage — text is in parsedText
      parsedText,
      isActive: true,
    },
    select: {
      id: true,
      fileName: true,
      isActive: true,
      createdAt: true,
    },
  });

  return resume;
};

/**
 * Get all resumes for a user, newest first.
 */
const getUserResumes = async (userId) => {
  return prisma.resume.findMany({
    where: { userId },
    select: {
      id: true,
      fileName: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get the active resume for a user.
 */
const getActiveResume = async (userId) => {
  const resume = await prisma.resume.findFirst({
    where: { userId, isActive: true },
    select: {
      id: true,
      fileName: true,
      isActive: true,
      createdAt: true,
      parsedText: true,
    },
  });
  if (!resume) throw new AppError('No active resume found. Please upload a PDF resume.', 404);
  return resume;
};

/**
 * Delete a resume:
 * 1. Verify ownership (scoped to userId and resumeId)
 * 2. Clean up any physical file if present
 * 3. Disconnect interview sessions referencing this resume safely
 * 4. Delete Resume record
 * 5. If the deleted resume was active, promote the newest remaining resume to active
 */
const deleteResume = async ({ userId, resumeId }) => {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    throw new AppError('Resume not found or does not belong to you.', 404);
  }

  const wasActive = resume.isActive;

  // Clean up physical file if it exists on disk
  if (resume.filePath) {
    try {
      if (fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }
    } catch {
      // ignore file cleanup error
    }
  }

  await prisma.$transaction(async (tx) => {
    // Disconnect any interview session referencing this resume
    await tx.interviewSession.updateMany({
      where: { resumeId },
      data: { resumeId: null },
    });

    // Delete the resume record
    await tx.resume.delete({
      where: { id: resumeId },
    });

    // If the deleted resume was active, ensure the newest remaining resume becomes active
    if (wasActive) {
      // First ensure any previous active state is cleared so only 1 resume is active
      await tx.resume.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      const newestRemaining = await tx.resume.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (newestRemaining) {
        await tx.resume.update({
          where: { id: newestRemaining.id },
          data: { isActive: true },
        });
      }
    }
  });

  return { id: resumeId };
};

module.exports = { uploadResume, getUserResumes, getActiveResume, deleteResume };

