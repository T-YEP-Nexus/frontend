import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

/**
 * Upload un fichier vers Supabase Storage et retourne l'URL publique
 * @param file - Le fichier à uploader
 * @param bucketName - Nom du bucket (ex: 'project-storage')
 * @param folderPath - Chemin du dossier (optionnel, ex: 'projects/project-123/')
 * @returns Promise<UploadResult>
 */
export async function uploadFileToSupabase(
  file: File,
  bucketName: string = 'project-storage',
  folderPath: string = ''
): Promise<UploadResult> {
  try {
    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const fullPath = folderPath ? `${folderPath}${fileName}` : fileName;

    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erreur upload Supabase:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fullPath);

    return {
      success: true,
      url: publicUrl,
      fileName: fileName
    };

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Supprimer un fichier de Supabase Storage
 * @param filePath - Chemin complet du fichier dans le storage
 * @param bucketName - Nom du bucket
 * @returns Promise<boolean>
 */
export async function deleteFileFromSupabase(
  filePath: string,
  bucketName: string = 'project-storage'
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Erreur suppression fichier:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return false;
  }
}