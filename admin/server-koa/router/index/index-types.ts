import {Posts} from '../../types/posts-types'

export interface Post2 {
  id: Posts.Id
  userId: Posts.UserId
  content: Posts.Content
  images: Posts.Images
  imageList: Posts.Images[]
  videos: Posts.Videos
  videoList: Posts.Videos[]
  createdAt: Posts.CreatedAt
}

export class Post {
  id: Posts.Id
  userId: Posts.UserId
  content: Posts.Content
  images?: Posts.Images
  imageList: Posts.Images[]
  videos?: Posts.Videos
  videoList: Posts.Videos[]
  createdAt: Posts.CreatedAt

  constructor(id: Posts.Id, userId: Posts.UserId, content: Posts.Content, images: Posts.Images, imageList: Posts.Images[], videos: Posts.Videos, videoList: Posts.Videos[], createdAt: Posts.CreatedAt) {
    this.id = id
    this.userId = userId
    this.content = content
    this.images = images
    this.imageList = imageList
    this.videos = videos
    this.videoList = videoList
    this.createdAt = createdAt
  }
}

