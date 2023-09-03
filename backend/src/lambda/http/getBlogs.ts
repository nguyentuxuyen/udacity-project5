import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
import { getBlogs } from '../../businessLogic/blogs';
import { BlogItem } from '../../models/BlogItem';

const logger = createLogger('getBlogs');

// Get all BLOG items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing GetBlogs event...');
    // Write your code here
    const userId = getUserId(event);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };

    try {
      const blogList: BlogItem[] = await getBlogs(userId);
      logger.info('Successfully retrieved bloglist');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ blogList })
      };
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error })
      };
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
