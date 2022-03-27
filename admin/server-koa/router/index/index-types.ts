import {Posts} from '../../types/posts-types'
import {Users} from '../../types/users-types'

export interface Post {
  id: Posts.Id
  username: Users.Username
  userId: Posts.UserId
  content: Posts.Content
  images?: Posts.Images
  imageList: Posts.Images[]
  videos?: Posts.Videos
  videoList: Posts.Videos[]
  likes: Posts.Likes
  comments: Posts.Comments
  createdAt: Posts.CreatedAt
}

export class Post2 {
  id: Posts.Id
  userId: Posts.UserId
  content: Posts.Content
  images?: Posts.Images
  imageList: Posts.Images[]
  videos?: Posts.Videos
  likes: Posts.Likes
  comments: Posts.Comments
  videoList: Posts.Videos[]
  createdAt: Posts.CreatedAt

  constructor(id: Posts.Id, userId: Posts.UserId, content: Posts.Content, images: Posts.Images, imageList: Posts.Images[], videos: Posts.Videos, likes: Posts.Likes, comments: Posts.Comments, videoList: Posts.Videos[], createdAt: Posts.CreatedAt) {
    this.id = id
    this.userId = userId
    this.content = content
    this.images = images
    this.imageList = imageList
    this.videos = videos
    this.likes = likes
    this.comments = comments
    this.videoList = videoList
    this.createdAt = createdAt
  }
}

