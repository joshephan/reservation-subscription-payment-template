import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

export class SupabaseS3Service {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  async uploadFile(file: File, path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(path, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    return data.path;
  }

  async getFileUrl(path: string): Promise<string | null> {
    const { data } = await supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return data?.publicUrl || null;
  }

  async deleteFile(path: string): Promise<boolean> {
    const { error } = await supabase.storage.from(this.bucket).remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  }

  async listFiles(prefix: string): Promise<string[] | null> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .list(prefix);

    if (error) {
      console.error('Error listing files:', error);
      return null;
    }

    return data.map((file) => file.name);
  }

  async updateFile(file: File, path: string): Promise<string | null> {
    // First, delete the existing file
    await this.deleteFile(path);

    // Then, upload the new file
    return this.uploadFile(file, path);
  }
}
