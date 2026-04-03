## Create category (admin)

### POST /api/categories

```json
{
  "name": "Web Development",
  "slug": "web-development",
  "description": "Courses on building websites and web applications",
  "icon": "code"
}
```

## Update category (admin)

### PATCH /api/categories/1

```json
{
  "description": "Updated description for web development courses"
}
```

## List categories (public)

### GET /api/categories?page=1&limit=5&search=web&sortBy=name&sortOrder=asc

## Get category by ID (public)

### GET /api/categories/1

## Get category by slug (public)

### GET /api/categories/slug/web-development

## Delete category (admin)

### DELETE /api/categories/1
