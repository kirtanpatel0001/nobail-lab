// ── Nobil Laboratories — Blog Types ──────────────────────────

export type PostStatus = 'draft' | 'published' | 'archived'

export interface Author {
  id:         string
  name:       string
  role:       string | null
  avatar_url: string | null
  bio:        string | null
}

export interface Category {
  id:    string
  name:  string
  slug:  string
  color: string
}

export interface Tag {
  id:   string
  name: string
  slug: string
}

export interface Post {
  id:               string
  title:            string
  slug:             string
  excerpt:          string | null
  content:          string
  cover_url:        string | null
  thumbnail_url:    string | null // Added thumbnail_url
  status:           PostStatus
  featured:         boolean
  read_time:        number
  author_id:        string | null
  category_id:      string | null
  meta_title:       string | null
  meta_description: string | null
  published_at:     string | null
  created_at:       string
  updated_at:       string

  // Joined
  author:   Author   | null
  category: Category | null
  tags:     Tag[]
}

// Lightweight card for listing page
export type PostCard = Pick<
  Post,
  'id' | 'title' | 'slug' | 'excerpt' | 'cover_url' | 'thumbnail_url' | // Added thumbnail_url
  'read_time' | 'featured' | 'published_at'
> & {
  author:   Pick<Author,   'name' | 'avatar_url'> | null
  category: Pick<Category, 'name' | 'slug' | 'color'> | null
}