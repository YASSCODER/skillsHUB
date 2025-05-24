import express, { Request, Response, Router } from 'express';
import catchAsync from '../../../common/utils/catch-async.utils';
import Document from '../../../common/models/document.schema';
import { ensureUploadsDir } from '../../../common/utils/create-uploads-dir';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// --- ROUTE DE RECHERCHE : À mettre avant les routes dynamiques ---
router.get('/search', catchAsync(async (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Le paramètre 'query' est requis." });
  }
  
  const docs = await Document.find({
    originalname: { $regex: query, $options: 'i' }
  });
  
  res.json(docs);
}));
// -------------------------------------------------------------------

// Ensure uploads directory exists
const uploadDir = ensureUploadsDir();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

// GET all documents
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const documents = await Document.find();
  res.json(documents);
}));

// GET all documents for a specific salon
router.get('/salon/:salonId', catchAsync(async (req: Request, res: Response) => {
  const documents = await Document.find({ salonId: req.params.salonId });
  res.json(documents);
}));

// GET document by ID
router.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }
  res.json(document);
}));

// POST upload document for a specific salon
router.post(
  '/upload/:salonId',
  upload.single('document'),
  catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { filename, originalname, mimetype, size, path: filePath } = req.file;
    const url = `/uploads/${filename}`;
    const salonId = req.params.salonId;

    // Create document in database
    const document = new Document({
      filename,
      originalname,
      mimetype,
      size,
      path: filePath,
      url,
      salonId
    });
    
    await document.save();
    
    res.status(201).json({
      success: true,
      document
    });
  })
);
router.get('/salon/:salonId/search', catchAsync(async (req: Request, res: Response) => {
  const { salonId } = req.params;
  const { name } = req.query;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Le champ 'name' est requis." });
  }
  const docs = await Document.find({
    salonId,
    originalname: { $regex: name, $options: 'i' }
  });
  res.json(docs);
}));

// DELETE document by ID
router.delete('/:id', catchAsync(async (req: Request, res: Response) => {
  // Find the document in the database
  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }
  
  // Get the file path
  const filePath = document.path;
  
  // Delete the file from the filesystem
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Delete the document from the database
  await Document.findByIdAndDelete(req.params.id);
  
  res.status(200).json({ message: "Document deleted successfully" });
}));

// POST ajouter un commentaire à un document
router.post('/:id/commentaires', catchAsync(async (req: Request, res: Response) => {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ error: "Document not found" });

  const { auteur, texte } = req.body;
  if (!auteur || !texte) {
    return res.status(400).json({ error: "Auteur et texte requis" });
  }

  const commentaire = { auteur, texte, date: new Date() };
  document.commentaires = document.commentaires || [];
  document.commentaires.push(commentaire);
  await document.save();

  res.status(201).json(commentaire);
}));

// Récupérer les commentaires d’un document
router.get('/:id/commentaires', catchAsync(async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document non trouvé' });
    res.json(doc.commentaires || []);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des commentaires", error });
  }
}));

// DELETE un commentaire d'un document
router.delete('/:documentId/commentaires/:commentaireId', catchAsync(async (req: Request, res: Response) => {
  const { documentId, commentaireId } = req.params;

  const document = await Document.findById(documentId);
  if (!document) return res.status(404).json({ error: "Document not found" });

  if (!document.commentaires || document.commentaires.length === 0) {
    return res.status(404).json({ error: "Aucun commentaire à supprimer" });
  }

  const initialLength = document.commentaires.length;
  document.commentaires = document.commentaires.filter(
    (comm: any) => comm._id.toString() !== commentaireId
  );

  if (document.commentaires.length === initialLength) {
    return res.status(404).json({ error: "Commentaire not found" });
  }

  await document.save();
  res.status(200).json({ message: "Commentaire supprimé avec succès" });
}));

// Route pour ajouter une étoile à un document PDF
router.post('/:documentId/etoile', catchAsync( async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ error: "Document not found" });
    document.etoiles = (document.etoiles || 0) + 1;
    await document.save();
    res.json({ etoiles: document.etoiles });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}));

// Définir le type ReactionType
type ReactionType = 'like' | 'success' | 'love';

// Réactions sur un commentaire
router.post('/:docId/commentaires/:commentId/react', catchAsync(async (req, res) => {
  const { docId, commentId } = req.params;
  const { reaction, userId } = req.body as { reaction: ReactionType, userId: string };

  const validReactions: ReactionType[] = ['like', 'success', 'love'];
  if (!validReactions.includes(reaction)) {
    return res.status(400).json({ error: "Unknown reaction type" });
  }

  const document = await Document.findById(docId);
  if (!document) return res.status(404).json({ error: "Doc not found" });

  const commentaire = document.commentaires?.find(c => c._id?.toString() === commentId);
  if (!commentaire) return res.status(404).json({ error: "Comment not found" });

  if (!commentaire.reactions) {
    commentaire.reactions = { like: [], success: [], love: [] };
  }
  if (!commentaire.reactions[reaction]) {
    commentaire.reactions[reaction] = [];
  }

  const idx = commentaire.reactions[reaction].indexOf(userId);
  if (idx === -1) {
    commentaire.reactions[reaction].push(userId);
  } else {
    commentaire.reactions[reaction].splice(idx, 1);
  }

  await document.save();

  res.json({
    reactions: {
      like: commentaire.reactions.like.length,
      success: commentaire.reactions.success.length,
      love: commentaire.reactions.love.length
    },
    userReactions: {
      like: commentaire.reactions.like.includes(userId),
      success: commentaire.reactions.success.includes(userId),
      love: commentaire.reactions.love.includes(userId)
    }
  });
}));

// POST upload image for a specific salon
router.post(
  '/upload-image/:salonId',
  upload.single('image'),
  catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const { filename, originalname, mimetype, size, path: filePath } = req.file;
    const url = `/uploads/${filename}`;
    const salonId = req.params.salonId;

    // Create document in database with type image
    const document = new Document({
      filename,
      originalname,
      mimetype,
      size,
      path: filePath,
      url,
      salonId,
      type: 'image' // Type image
    });
    
    await document.save();
    
    res.status(201).json({
      success: true,
      document
    });
  })
);

export default router;
