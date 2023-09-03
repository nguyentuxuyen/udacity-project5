import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createBlog, deleteBlog, getBlogs, patchBlog } from '../api/blogs-api'
import Auth from '../auth/Auth'
import { Blog } from '../types/Blog'

interface BlogsProps {
  auth: Auth
  history: History
}

interface BlogsState {
  blogs: Blog[]
  newBlogName: string
  loadingBlogs: boolean
}

export class Blogs extends React.PureComponent<BlogsProps, BlogsState> {
  state: BlogsState = {
    blogs: [],
    newBlogName: '',
    loadingBlogs: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBlogName: event.target.value })
  }

  onEditButtonClick = (blogId: string) => {
    this.props.history.push(`/blogs/${blogId}/edit`)
  }

  onBlogCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newBlog = await createBlog(this.props.auth.getIdToken(), {
        name: this.state.newBlogName,
        dueDate
      })
      this.setState({
        blogs: [...this.state.blogs, newBlog],
        newBlogName: ''
      })
    } catch {
      alert('Blog creation failed')
    }
  }

  onBlogDelete = async (blogId: string) => {
    try {
      await deleteBlog(this.props.auth.getIdToken(), blogId)
      this.setState({
        blogs: this.state.blogs.filter(blog => blog.blogId !== blogId)
      })
    } catch {
      alert('Blog deletion failed')
    }
  }

  onBlogCheck = async (pos: number) => {
    try {
      const blog = this.state.blogs[pos]
      await patchBlog(this.props.auth.getIdToken(), blog.blogId, {
        name: blog.name,
        dueDate: blog.dueDate,
        done: !blog.done
      })
      this.setState({
        blogs: update(this.state.blogs, {
          [pos]: { done: { $set: !blog.done } }
        })
      })
    } catch {
      alert('Blog deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const blogs = await getBlogs(this.props.auth.getIdToken())
      this.setState({
        blogs,
        loadingBlogs: false
      })
    } catch (e) {
      alert(`Failed to fetch blogs: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        

        {this.renderCreateBlogInput()}

        {this.renderBlogs()}
      </div>
    )
  }

  renderCreateBlogInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Create blog',
              onClick: this.onBlogCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBlogs() {
    if (this.state.loadingBlogs) {
      return this.renderLoading()
    }

    return this.renderBlogsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Blogs
        </Loader>
      </Grid.Row>
    )
  }

  renderBlogsList() {
    return (
      <Grid padded>
        {this.state.blogs.map((blog, pos) => {
          return (
            <Grid.Row key={blog.blogId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onBlogCheck(pos)}
                  checked={blog.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {blog.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {blog.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(blog.blogId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBlogDelete(blog.blogId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {blog.attachmentUrl && (
                <Image src={blog.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
