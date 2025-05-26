import express, { Request, Response, Router } from "express";
import catchAsync from "../../../common/utils/catch-async.utils";
import Document, { ICommentaire } from "../../../common/models/document.schema";
import { ensureUploadsDir } from "../../../common/utils/create-uploads-dir";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// --- ROUTE DE RECHERCHE : À mettre avant les routes dynamiques ---
router.get(
  "/search",
  catchAsync(async (req: Request, res: Response) => {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res
        .status(400)
        .json({ error: "Le paramètre 'query' est requis." });
    }

    const docs = await Document.find({
      originalname: { $regex: query, $options: "i" },
    });

    res.json(docs);
  })
);
// -------------------------------------------------------------------

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../../../uploads');

// Create uploads directory if it doesn't exist
ensureUploadsDir();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // Augmenté à 500MB
  fileFilter: (req, file, cb) => {
    // Accept PDF files, videos, and other common document types
    const allowedTypes = [
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-ms-wmv"
    ];
    
    // Accepter tous les types de fichiers vidéo courants
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.toLowerCase().endsWith('.pdf') ||
        file.originalname.toLowerCase().endsWith('.doc') ||
        file.originalname.toLowerCase().endsWith('.docx') ||
        file.originalname.toLowerCase().endsWith('.xls') ||
        file.originalname.toLowerCase().endsWith('.xlsx') ||
        file.originalname.toLowerCase().endsWith('.ppt') ||
        file.originalname.toLowerCase().endsWith('.pptx') ||
        file.originalname.toLowerCase().endsWith('.jpg') ||
        file.originalname.toLowerCase().endsWith('.jpeg') ||
        file.originalname.toLowerCase().endsWith('.png') ||
        file.originalname.toLowerCase().endsWith('.gif') ||
        file.originalname.toLowerCase().endsWith('.mp4') ||
        file.originalname.toLowerCase().endsWith('.mov') ||
        file.originalname.toLowerCase().endsWith('.avi') ||
        file.originalname.toLowerCase().endsWith('.wmv')) {
      cb(null, true);
    } else {
      cb(new Error("Format de fichier non supporté. Formats acceptés: PDF, Word, Excel, PowerPoint, images et vidéos."));
    }
  },
});

// GET all documents
router.get(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const documents = await Document.find();
    res.json(documents);
  })
);

// GET all documents for a specific salon
router.get('/salon/:salonId', catchAsync(async (req: Request, res: Response) => {
  try {
    console.log(`Fetching documents for salon: ${req.params.salonId}`);
    const documents = await Document.find({ salonId: req.params.salonId });
    console.log(`Found ${documents.length} documents`);
    res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents", details: error instanceof Error ? error.message : String(error) });
  }
}));

// GET document by ID
router.get(
  "/:id",
  catchAsync(async (req: Request, res: Response) => {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(document);
  })
);

// POST upload document for a specific salon
router.post(
  '/upload/:salonId',
  (req, res, next) => {
    console.log("Upload request received for salonId:", req.params.salonId);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  catchAsync(async (req: Request, res: Response) => {
    console.log("File uploaded:", req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const { filename, originalname, mimetype, size, path: filePath } = req.file;
      const url = `/uploads/${filename}`;
      const salonId = req.params.salonId;
      
      console.log("Creating document with:", {
        filename, originalname, mimetype, size, path: filePath, url, salonId
      });

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
      
      const savedDoc = await document.save();
      console.log("Document saved successfully:", savedDoc);
      
      res.status(201).json({
        success: true,
        document: savedDoc
      });
    } catch (error) {
      console.error("Error saving document:", error);
      res.status(500).json({ error: "Failed to save document", details: error instanceof Error ? error.message : String(error) });
    }
  })
);router.get('/salon/:salonId/search', catchAsync(async (req: Request, res: Response) => {
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
router.delete(
  "/:id",
  catchAsync(async (req: Request, res: Response) => {
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
  })
);

// POST ajouter un commentaire à un document
router.post(
  "/:id/commentaires",
  catchAsync(async (req: Request, res: Response) => {
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
  })
);

// Récupérer les commentaires d’un document
router.get(
  "/:id/commentaires",
  catchAsync(
    async (
      req: { params: { id: any } },
      res: {
        status: (arg0: number) => {
          (): any;
          new (): any;
          json: {
            (arg0: { message: string; error?: unknown }): void;
            new (): any;
          };
        };
        json: (arg0: ICommentaire[]) => void;
      }
    ) => {
      try {
        const doc = await Document.findById(req.params.id);
        if (!doc)
          return res.status(404).json({ message: "Document non trouvé" });
        res.json(doc.commentaires || []);
      } catch (error) {
        res
          .status(500)
          .json({
            message: "Erreur lors de la récupération des commentaires",
            error,
          });
      }
    }
  )
);

// DELETE un commentaire d'un document
router.delete(
  "/:documentId/commentaires/:commentaireId",
  catchAsync(async (req: Request, res: Response) => {
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
  })
);

// Route pour ajouter une étoile à un document PDF (limitée à 5 étoiles maximum)
router.post('/:documentId/etoile', catchAsync(async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findById(documentId);
    
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    // Initialiser etoiles à 0 si undefined
    document.etoiles = document.etoiles || 0;
    
    // Limiter à 5 étoiles maximum
    if (document.etoiles < 5) {
      document.etoiles += 1;
      await document.save();
    }
    
    res.json({ etoiles: document.etoiles });
  } catch (err) {
    console.error("Erreur lors de l'ajout d'étoile:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}));

// Définir le type ReactionType
type ReactionType = "like" | "success" | "love";

// Réactions sur un commentaire
router.post(
  "/:docId/commentaires/:commentId/react",
  catchAsync(
    async (
      req: {
        params: { docId: any; commentId: any };
        body: { reaction: ReactionType; userId: string };
      },
      res: {
        status: (arg0: number) => {
          (): any;
          new (): any;
          json: { (arg0: { error: string }): any; new (): any };
        };
        json: (arg0: {
          reactions: { like: number; success: number; love: number };
          userReactions: { like: boolean; success: boolean; love: boolean };
        }) => void;
      }
    ) => {
      const { docId, commentId } = req.params;
      const { reaction, userId } = req.body as {
        reaction: ReactionType;
        userId: string;
      };

      const validReactions: ReactionType[] = ["like", "success", "love"];
      if (!validReactions.includes(reaction)) {
        return res.status(400).json({ error: "Unknown reaction type" });
      }

      const document = await Document.findById(docId);
      if (!document) return res.status(404).json({ error: "Doc not found" });

      const commentaire = document.commentaires?.find(
        (c) => c._id?.toString() === commentId
      );
      if (!commentaire)
        return res.status(404).json({ error: "Comment not found" });

  if (!commentaire.reactions) {
    commentaire.reactions = { like: [], success: [], love: [] };
  }

  // Vérifier si l'utilisateur a déjà réagi avec un autre type
  const hasOtherReaction = validReactions.some(type => 
    type !== reaction && commentaire.reactions?.[type]?.includes(userId)
  );

  // Si l'utilisateur a déjà une autre réaction, supprimer cette réaction
  if (hasOtherReaction) {
    validReactions.forEach(type => {
      if (type !== reaction) {
        const idx = commentaire.reactions?.[type]?.indexOf(userId) ?? -1;
        if (idx !== -1) {
          commentaire.reactions?.[type]?.splice(idx, 1);
        }
      }
    });
  }

  // Ajouter ou supprimer la réaction actuelle
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
          love: commentaire.reactions.love.length,
        },
        userReactions: {
          like: commentaire.reactions.like.includes(userId),
          success: commentaire.reactions.success.includes(userId),
          love: commentaire.reactions.love.includes(userId),
        },
      });
    }
  )
);

// POST upload image for a specific salon
router.post(
  '/upload-image/:salonId',
  upload.single('file'),
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
      type: "image", // Type image
    });

    await document.save();

    res.status(201).json({
      success: true,
      document,
    });
  })
);

export default router;
