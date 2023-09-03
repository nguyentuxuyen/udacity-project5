import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// Implement the fileStogare logic
const s3BucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class AttachmentUtils{
    constructor(
        private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
        private readonly bucketName = s3BucketName
    ) {}

    getAttachmenUrl(blogId: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${blogId}`
    }

    getUploadUrl(blogId: string) {
        const url = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: blogId,
            Expires: urlExpiration
        })
        return url as string
    }
}