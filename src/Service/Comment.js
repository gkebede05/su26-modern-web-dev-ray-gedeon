import Parse from 'parse';

// Comments contain a body, author, and a pointer to the post they belong
export const fetchCommentsByPost = (post) => {
  const query = new Parse.Query('Comment');
  query.equalTo('post', post);
  query.ascending('createdAt');
  return query.find().then(results => results.map(comment => ({
    id: comment.id,
    body: comment.get('body'),
    author: comment.get('author'),
  })));
};