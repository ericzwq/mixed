import formidable = require('formidable')
import {Posts} from '../../types/posts-types'

type _File = formidable.File

export interface CreatePostBody {
  content?: Posts.Content
  contentType: Posts.ContentType
  images?: Posts.Images[]
  videos?: Posts.Videos[]
}

export interface CreatePostSql extends CreatePostBody {
  id: Posts.Id
}

export interface UploadFiles {
  assets?: _File | _File[]
}
