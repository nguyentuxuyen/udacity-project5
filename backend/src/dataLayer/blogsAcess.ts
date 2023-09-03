import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { BlogItem } from '../models/BlogItem'
import { BlogUpdate } from '../models/BlogUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('BlogsAccess')

// Implement the dataLayer logic
export class BlogsAccess{
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly blogsTable = process.env.BLOGS_TABLE,
        private readonly blogsIndex = process.env.INDEX_NAME
    ) {}

    async getBlog(userId: string, blogId: string): Promise<BlogItem> {
        logger.info('Call function get blog')
        const result = await this.docClient.query({
            TableName: this.blogsTable,
            KeyConditionExpression: 'userId = :userId and blogId = :blogId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':blogId': blogId
            }
        }).promise();
        const blogItem = result.Items[0]
        return blogItem as BlogItem
    }

    async getAllBlogs(userId: string): Promise<BlogItem[]> {
        logger.info('Call function get all blogs')
        const result = await this.docClient.query({
            TableName: this.blogsTable,
            IndexName: this.blogsIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as BlogItem[]
    }

    async createBlog(blogItem: BlogItem): Promise<BlogItem> {
        console.log("Creating blog item", JSON.stringify(blogItem))

        await this.docClient.put({
            TableName: this.blogsTable,
            Item: blogItem
        }).promise()

        return blogItem
    }

    async updateBlog(userId: string, blogId: string, updateData: BlogUpdate): Promise<void> {
        logger.info('Update blog item')
        await this.docClient.update({
            TableName: this.blogsTable,
            Key: {userId, blogId},
            ConditionExpression: 'attribute_exists(blogId)',
            UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
            ExpressionAttributeNames: { '#n': 'name' },
            ExpressionAttributeValues: {
                ':n': updateData.name,
                ':due': updateData.dueDate,
                ':dn': updateData.done
            }
        }).promise();
    }

    async deleteBlog(userId: string, blogId: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.blogsTable,
            Key: {userId, blogId}
        }).promise();
    }

    async saveImgUrl(userId: string, blogId: string, bucketName: string): Promise<void> {
        await this.docClient.update({
            TableName: this.blogsTable,
            Key: { userId, blogId },
            ConditionExpression: 'attribute_exists(blogId)',
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${blogId}`
            }
        }).promise();
    }

}