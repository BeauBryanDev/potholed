import api from './api';

/**
 * Interfaces reflecting the Pothole Guard Image Schemas
 */
export interface ImageResponse {
  id: number;
  original_filename: string;
  original_path: string;
  annotated_path?: string;
  user_id: number;
  street_id?: number;
  file_size_bytes?: number;
  width?: number;
  height?: number;
  processed_at?: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImageUpdate {
  street_id?: number;
  // Other updatable fields can be added here based on ImageIn schema
}

const imageService = {
  /**
   * GET /images/
   * Fetches a paginated list of images.
   * Standard users will only receive their own images.
   * Admins can fetch all images, optionally filtered by user_id.
   */
  getImages: async (skip: number = 0, limit: number = 100, userId?: number): Promise<ImageResponse[]> => {
    const response = await api.get<ImageResponse[]>('/images/', {
      params: { 
        skip, 
        limit, 
        ...(userId && { user_id: userId }) 
      }
    });
    return response.data;
  },

  /**
   * GET /images/{image_id}
   * Fetches details of a specific image.
   * Validates ownership unless the user is an admin.
   */
  getImageById: async (imageId: number): Promise<ImageResponse> => {
    const response = await api.get<ImageResponse>(`/images/${imageId}`);
    return response.data;
  },

  /**
   * PUT /images/{image_id}
   * Updates an existing image's metadata (e.g., assigning it to a new street).
   */
  updateImage: async (imageId: number, imageData: ImageUpdate): Promise<ImageResponse> => {
    const response = await api.put<ImageResponse>(`/images/${imageId}`, imageData);
    return response.data;
  },

  /**
   * DELETE /images/{image_id}
   * Permanently deletes an image record from the database.
   */
  deleteImage: async (imageId: number): Promise<void> => {
    await api.delete(`/images/${imageId}`);
  }
};

export default imageService;