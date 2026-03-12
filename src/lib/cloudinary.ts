// ── Cloudinary Config ─────────────────────────────────────────
// Install: npm install cloudinary next-cloudinary

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'demo'

/**
 * Build a Cloudinary URL with transformations.
 * @param publicId  - Cloudinary public ID or a full secure_url
 * @param opts      - width, height, crop, quality, format, effect
 */
export function cloudinaryUrl(
  publicId: string | null | undefined,
  opts: {
    width?:   number
    height?:  number
    crop?:    'fill' | 'fit' | 'scale' | 'thumb' | 'crop' | 'pad'
    quality?: number | 'auto'
    format?:  'auto' | 'webp' | 'avif' | 'jpg'
    effect?:  string
    gravity?: 'auto' | 'face' | 'center'
  } = {}
): string {
  if (!publicId) return '';
  
  // FIX 1: If the DB has a full URL saved, just return it directly.
  if (publicId.startsWith('http')) return publicId;

  const {
    width   = 1200,
    height  = 630,
    crop    = 'fit', // FIX 2: Default to 'fit' so images never get cut off
    quality = 'auto',
    format  = 'auto',
    gravity = 'auto',
    effect,
  } = opts

  const transforms = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `g_${gravity}`,
    `q_${quality}`,
    `f_${format}`,
    effect ? `e_${effect}` : '',
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

/**
 * Preset helpers for common use cases
 */
export const cld = {
  // Blogs usually look better with 'fill' so they act like full-width banners
  cover:     (id: string) => cloudinaryUrl(id, { width: 1400, height: 700,  crop: 'fill', gravity: 'auto' }),
  
  // Changed to 'fit' and squared dimensions so tall product bottles never get chopped off
  card:      (id: string) => cloudinaryUrl(id, { width: 800,  height: 800,  crop: 'fit', gravity: 'auto' }),
  thumbnail: (id: string) => cloudinaryUrl(id, { width: 400,  height: 400,  crop: 'fit', gravity: 'auto' }),
  
  inline:    (id: string) => cloudinaryUrl(id, { width: 1200, height: 600,  crop: 'fit', gravity: 'auto' }),
  avatar:    (id: string) => cloudinaryUrl(id, { width: 200,  height: 200,  crop: 'thumb', gravity: 'face' }),
}