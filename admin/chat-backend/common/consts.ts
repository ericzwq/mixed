export const picSet = new Set([
  '.xbm', '.tif', '.pjp', '.svgz', '.jpg', '.jpeg', '.ico', '.tiff', '.gif', '.svg', '.jfif', '.webp', '.png', '.bmp', '.pjpeg', '.avif'
])

export const videoSet = new Set([
  '.mp4', '.m4v', '.mov', '.qt', '.avi', '.flv', '.wmv', '.asf', '.mpeg', '.mpg', '.vob', '.mkv', '.rm', '.rmvb', '.dat'
])

export const UPLOAD_PATH = './public/uploads'
export const UPLOAD_STATIC_PATH = '/uploads/'

export const isProd = process.env.NODE_ENV === 'production'
