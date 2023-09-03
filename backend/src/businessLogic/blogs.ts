import { BlogsAccess } from '../dataLayer/blogsAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { BlogItem } from '../models/BlogItem'
import { CreateBlogRequest } from '../requests/CreateBlogRequest'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk';
import { BlogUpdate } from '../models/BlogUpdate';

// Implement businessLogic
const attachmentUtils = new AttachmentUtils()
const blogsAccess = new BlogsAccess()

export async function getBlogs(userId: string){
    return blogsAccess.getAllBlogs(userId)
}

export async function getBlog(userId: string, blogId: string) {
    return blogsAccess.getBlog(userId, blogId)
}

export async function createBlog(newBlog: CreateBlogRequest, userId: string): Promise<BlogItem> {
    const blogId = uuid.v4()
    const createdAt = new Date().toISOString()
    const s3AttachmenUrl = attachmentUtils.getAttachmenUrl(blogId)
    const newItem: BlogItem = {
        userId,
        blogId,
        createdAt, 
        done: false,
        attachmentUrl: s3AttachmenUrl,
        ...newBlog
    }

    return blogsAccess.createBlog(newItem)
}

export async function updateBlog(userId: string, blogId: string, updateData: BlogUpdate): Promise<void>{
    return blogsAccess.updateBlog(userId, blogId, updateData);
}

export async function deleteBlog(userId: string, blogId: string): Promise<void> {
    return blogsAccess.deleteBlog(userId, blogId);
}

export async function generateUploadUrl(userId: string, blogId: string): Promise<string> {
    const bucketName = process.env.ATTACHMENT_S3_BUCKET;
    const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);
    const s3 = new AWS.S3({ signatureVersion: 'v4' });
    const signedUrl = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: blogId,
        Expires: urlExpiration
    });
    await blogsAccess.saveImgUrl(userId, blogId, bucketName);
    return signedUrl;
}