import { useEffect, useState } from 'react';
import { fetchAllPosts } from '../../Service/Post';
import { fetchCommentsByPost } from '../../Service/Comment';

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchAllPosts().then(rawPosts => {
        console.log('posts:', rawPosts);
        // each post has to retrieve its own comments
        // do it in parallel using Promise.all() and wait for them to resolve first
        Promise.all(    
            rawPosts.map(post =>
            fetchCommentsByPost(post).then(comments => {
                // console.log('comments for', post.id, ':', comments);
                return {
                id: post.id,
                title: post.get('title'),
                body: post.get('body'),
                comments,
                };
            })
            )
        ).then(setPosts);
    });
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      <hr />
      {/* Checks that posts exist before attempting to display them */}
      {posts.length === 0 && <p>No posts yet.</p>}
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
          <h3>Comments</h3>
          {/* If comments do not exist, displays "No comments yet" */}
          {post.comments.length === 0 && <p>No comments yet.</p>}
          {post.comments.map(comment => (
            <div key={comment.id}>
              <strong>{comment.author}</strong>
              <p>{comment.body}</p>
            </div>
          ))}
          <hr />
        </article>
      ))}
    </div>
  );
}

export default Home;