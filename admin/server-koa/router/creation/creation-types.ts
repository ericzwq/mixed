import formidable = require('formidable')
import {Posts} from '../../types/posts-types'

type _File = formidable.File

export interface CreatePostBody {
  content: Posts.Content
}

export interface CreatePostFiles {
  images: _File | _File[]
  videos: _File | _File[]
}

export interface CreatePostSqlData extends CreatePostBody {
  images: Posts.Images
  videos: Posts.Videos
  id: Posts.Id
}
