import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteBlog } from '../../businessLogic/blogs'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteBlog');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const blogId = event.pathParameters.blogId
    // Remove a BLOG item by id
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };

    try {
      await deleteBlog(userId, blogId);
      logger.info(`Successfully deleted blog item: ${blogId}`);
      return {
        statusCode: 204,
        headers,
        body: undefined
      };
    } catch(error) {
      return{
        statusCode: 500,
        headers,
        body: JSON.stringify({error})
      };
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
