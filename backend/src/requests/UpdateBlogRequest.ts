/**
 * Fields in a request to update a single BLOG item.
 */
export interface UpdateBlogRequest {
  name: string
  dueDate: string
  done: boolean
}