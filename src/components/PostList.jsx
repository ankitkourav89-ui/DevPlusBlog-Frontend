function PostList({ posts }) {
  return (
    <div className="post-list">
      <h2>All Posts</h2>

      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <div
            className="post-card"
            key={post.id}
          >
            <h3>{post.title}</h3>

            <p>{post.content}</p>

            <div className="post-info">
              <span>
                Author:{" "}
                {post.author?.user?.username ||
                  "Unknown"}
              </span>

              <span>
                Comments:{" "}
                {post.comments_count}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PostList;