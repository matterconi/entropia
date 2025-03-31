// lib/role-handlers.ts
import mongoose from "mongoose";

import Admin from "@/database/Admin";
import Editor from "@/database/Editor";
import User, { UserRole } from "@/database/User";
import dbConnect from "@/lib/mongoose";

interface RoleAssignmentResult {
  success: boolean;
  message: string;
  user?: any;
}

/**
 * Assegna un ruolo a un utente e crea il profilo associato se necessario
 */
export async function assignRole(
  userId: string,
  newRole: UserRole,
  adminId: string,
): Promise<RoleAssignmentResult> {
  try {
    await dbConnect();

    // Verifica che l'utente esista
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "Utente non trovato" };
    }

    // Verifica che l'admin esista
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return {
        success: false,
        message:
          "Permesso negato. Solo gli amministratori possono assegnare ruoli.",
      };
    }

    // Memorizza il ruolo precedente per il tracking
    const previousRole = user.role;

    // Se il ruolo è lo stesso, non fare nulla
    if (user.role === newRole) {
      return { success: true, message: "L'utente ha già questo ruolo", user };
    }

    // Aggiorna il ruolo dell'utente
    user.role = newRole;

    // Gestisci i profili speciali in base al ruolo
    if (newRole === "editor" && !user.editorProfile) {
      // Crea un profilo editor se non esiste
      const editorProfile = new Editor({
        user: user._id,
        specialties: [],
      });
      await editorProfile.save();
      user.editorProfile = editorProfile._id;
    }

    if (newRole === "admin" && !user.adminProfile) {
      // Crea un profilo admin se non esiste
      const adminProfile = new Admin({
        user: user._id,
      });
      await adminProfile.save();
      user.adminProfile = adminProfile._id;
    }

    // Aggiorna l'utente
    await user.save();

    // Registra l'azione nell'admin profile
    const adminProfile = await Admin.findOne({ user: adminId });
    if (adminProfile) {
      adminProfile.role_assignments.push({
        user: user._id,
        assigned_role: newRole,
        previous_role: previousRole,
        timestamp: new Date(),
      });
      adminProfile.last_activity = new Date();
      await adminProfile.save();
    }

    return {
      success: true,
      message: `Ruolo aggiornato con successo da ${previousRole} a ${newRole}`,
      user,
    };
  } catch (error: any) {
    console.error("Errore nell'assegnazione del ruolo:", error);
    return {
      success: false,
      message: `Errore nell'assegnazione del ruolo: ${error.message}`,
    };
  }
}

/**
 * Registra un'attività di revisione dell'editor
 */
export async function recordEditorAction(
  editorId: string,
  articleId: string,
  action: "approved" | "rejected" | "requested_changes",
  comments: string = "",
): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect();

    // Trova il profilo editor
    const editor = await Editor.findOne({ user: editorId });
    if (!editor) {
      return { success: false, message: "Profilo editor non trovato" };
    }

    // Aggiorna le statistiche
    if (action === "approved") {
      editor.articles_published += 1;
    } else if (action === "rejected") {
      editor.articles_rejected += 1;
    }

    editor.articles_reviewed += 1;
    editor.last_activity = new Date();

    // Aggiungi alla cronologia
    editor.review_history.push({
      article: new mongoose.Types.ObjectId(articleId),
      action,
      comments,
      timestamp: new Date(),
    });

    await editor.save();

    return {
      success: true,
      message: "Attività di revisione registrata con successo",
    };
  } catch (error: any) {
    console.error(
      "Errore nella registrazione dell'attività dell'editor:",
      error,
    );
    return {
      success: false,
      message: `Errore nella registrazione: ${error.message}`,
    };
  }
}

/**
 * Registra un'azione di sistema eseguita da un admin
 */
export async function recordAdminAction(
  adminId: string,
  actionType:
    | "config_update"
    | "user_ban"
    | "content_delete"
    | "system_maintenance"
    | "other",
  description: string,
): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect();

    // Trova il profilo admin
    const admin = await Admin.findOne({ user: adminId });
    if (!admin) {
      return { success: false, message: "Profilo admin non trovato" };
    }

    // Aggiorna l'ultima attività
    admin.last_activity = new Date();

    // Aggiungi l'azione alla cronologia
    admin.system_actions.push({
      action_type: actionType,
      description,
      timestamp: new Date(),
    });

    await admin.save();

    return {
      success: true,
      message: "Azione amministrativa registrata con successo",
    };
  } catch (error: any) {
    console.error(
      "Errore nella registrazione dell'azione amministrativa:",
      error,
    );
    return {
      success: false,
      message: `Errore nella registrazione: ${error.message}`,
    };
  }
}
