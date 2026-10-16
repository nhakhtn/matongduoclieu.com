import type { Post, Product } from '../lib/db'
import { getCategory } from '../lib/categories'
import { formatDate, formatPrice, mediaUrl } from '../lib/format'

export const PostCard = ({ post }: { post: Post }) => (
  <article class="post-card">
    {post.cover_key && (
      <a href={`/bai-viet/${post.slug}`} class="post-card-image">
        <img src={mediaUrl(post.cover_key)} alt="" loading="lazy" />
      </a>
    )}
    <div class="post-card-body">
      <a class="tag" href={`/chu-de/${post.category}`}>
        {getCategory(post.category)?.name ?? post.category}
      </a>
      <h3>
        <a href={`/bai-viet/${post.slug}`}>{post.title}</a>
      </h3>
      <p>{post.excerpt}</p>
      <time datetime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
    </div>
  </article>
)

export const PostGrid = ({ posts }: { posts: Post[] }) =>
  posts.length ? (
    <div class="post-grid">
      {posts.map((p) => (
        <PostCard post={p} />
      ))}
    </div>
  ) : (
    <p class="empty">Bài viết đang được biên soạn, mời bạn quay lại sau.</p>
  )

const productImage = (p: Product) => (p.image_key ? mediaUrl(p.image_key) : p.image_url)

export const ProductCard = ({ product }: { product: Product }) => {
  const image = productImage(product)
  return (
    <article class="card product-card">
      {image && <img src={image} alt={product.name} loading="lazy" />}
      <h3>{product.name}</h3>
      <p>{product.summary}</p>
      <strong class="price">{formatPrice(product.price)}</strong>
      {product.buy_url && (
        <a class="btn btn-shopee" href={`/mua/${product.slug}`} target="_blank" rel="sponsored nofollow noopener">
          Mua trên Shopee
        </a>
      )}
    </article>
  )
}

export const ProductGrid = ({ products }: { products: Product[] }) => (
  <div class="grid">
    {products.map((p) => (
      <ProductCard product={p} />
    ))}
  </div>
)
