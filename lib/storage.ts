import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { logCrashlytics, setCrashlyticsAttribute, storage } from './firebase'

export interface UploadResult {
  url: string
  fileName: string
  size: number
  mimeType: string
}

export interface AttachmentUploadResult extends UploadResult {
  thumbnailUrl?: string
}

// Upload image to Firebase Storage
export const uploadImage = async (
  uri: string,
  childId: string,
  messageId: string,
  fileName: string
): Promise<AttachmentUploadResult> => {
  try {
    setCrashlyticsAttribute('operation', 'upload_image')
    setCrashlyticsAttribute('childId', childId)
    setCrashlyticsAttribute('messageId', messageId)

    // Create a reference to the file location
    const fileRef = ref(storage, `messages/${childId}/${messageId}/${fileName}`)

    // Convert URI to blob
    const response = await fetch(uri)
    const blob = await response.blob()

    // Upload file
    const snapshot = await uploadBytes(fileRef, blob)

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    const result: AttachmentUploadResult = {
      url: downloadURL,
      fileName,
      size: blob.size,
      mimeType: blob.type
    }

    // If it's an image, create a thumbnail (simplified - in production you'd use a Cloud Function)
    if (blob.type.startsWith('image/')) {
      result.thumbnailUrl = downloadURL // For now, use the same URL
    }

    logCrashlytics(`Image uploaded successfully: ${fileName}`)
    return result
  } catch (error) {
    logCrashlytics(`Error uploading image: ${fileName}`, error as Error)
    throw error
  }
}

// Upload multiple images
export const uploadImages = async (
  images: Array<{ uri: string; fileName: string }>,
  childId: string,
  messageId: string
): Promise<AttachmentUploadResult[]> => {
  try {
    setCrashlyticsAttribute('operation', 'upload_multiple_images')
    setCrashlyticsAttribute('childId', childId)
    setCrashlyticsAttribute('messageId', messageId)
    setCrashlyticsAttribute('imageCount', images.length.toString())

    const uploadPromises = images.map(image =>
      uploadImage(image.uri, childId, messageId, image.fileName)
    )

    const results = await Promise.all(uploadPromises)
    logCrashlytics(`Successfully uploaded ${results.length} images`)
    return results
  } catch (error) {
    logCrashlytics('Error uploading multiple images', error as Error)
    throw error
  }
}

// Delete image from Firebase Storage
export const deleteImage = async (url: string): Promise<void> => {
  try {
    setCrashlyticsAttribute('operation', 'delete_image')
    setCrashlyticsAttribute('imageUrl', url)

    const imageRef = ref(storage, url)
    await deleteObject(imageRef)

    logCrashlytics('Image deleted successfully')
  } catch (error) {
    logCrashlytics('Error deleting image', error as Error)
    throw error
  }
}

// Generate unique filename
export const generateFileName = (originalName: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop() || 'jpg'
  return `${timestamp}_${randomString}.${extension}`
}

// Get file size from URI
export const getFileSize = async (uri: string): Promise<number> => {
  try {
    const response = await fetch(uri, { method: 'HEAD' })
    const contentLength = response.headers.get('content-length')
    return contentLength ? parseInt(contentLength, 10) : 0
  } catch (error) {
    console.error('Error getting file size:', error)
    return 0
  }
}

// Validate image before upload
export const validateImage = async (uri: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const response = await fetch(uri, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')

    if (!contentType?.startsWith('image/')) {
      return { isValid: false, error: 'File must be an image' }
    }

    const size = contentLength ? parseInt(contentLength, 10) : 0
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (size > maxSize) {
      return { isValid: false, error: 'Image must be smaller than 10MB' }
    }

    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Unable to validate image' }
  }
}

// Create thumbnail (simplified version - in production, use Cloud Functions)
export const createThumbnail = async (uri: string): Promise<string> => {
  // For now, just return the original URI
  // In production, you would:
  // 1. Use a Cloud Function to generate thumbnails
  // 2. Or use a third-party service like Cloudinary
  // 3. Or implement client-side thumbnail generation
  return uri
}

// Batch upload with progress tracking
export const batchUploadWithProgress = async (
  images: Array<{ uri: string; fileName: string }>,
  childId: string,
  messageId: string,
  onProgress?: (progress: number) => void
): Promise<AttachmentUploadResult[]> => {
  const results: AttachmentUploadResult[] = []

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const result = await uploadImage(image.uri, childId, messageId, image.fileName)
    results.push(result)

    // Update progress
    const progress = ((i + 1) / images.length) * 100
    onProgress?.(progress)
  }

  return results
}

// Get storage usage for a child
export const getStorageUsage = async (childId: string): Promise<number> => {
  // This would require listing all files for a child and summing their sizes
  // For now, return 0 - in production, you'd track this in the database
  return 0
}

// Clean up orphaned files (files without corresponding database records)
export const cleanupOrphanedFiles = async (childId: string): Promise<void> => {
  // This would require comparing Firebase Storage files with database records
  // and deleting files that don't have corresponding records
  // For now, this is a placeholder
  logCrashlytics('Cleanup orphaned files not yet implemented')
}

export default {
  uploadImage,
  uploadImages,
  deleteImage,
  generateFileName,
  getFileSize,
  validateImage,
  createThumbnail,
  batchUploadWithProgress,
  getStorageUsage,
  cleanupOrphanedFiles
}
