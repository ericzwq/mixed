import {Posts} from '../../types/posts-types'
import {Users} from '../../types/users-types'

export interface Post {
  id: Posts.Id
  username: Users.Username
  userId: Posts.UserId
  content: Posts.Content
  contentType: Posts.ContentType
  images?: Posts.Images
  imageList: Posts.Images[]
  videos?: Posts.Videos
  videoList: Posts.Videos[]
  likes: Posts.Likes
  liked: 0 | 1
  comments: Posts.Comments
  createdAt: Posts.CreatedAt
}

export interface LikePostBody {
  moreOrLess: '+' | '-'
  postId: Posts.Id
}

export interface CommentPostBody {
  postId: Posts.Id
  parentId?: Posts.Id
  content: string
}
