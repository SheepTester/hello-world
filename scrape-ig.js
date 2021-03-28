queryTypes = {
  GET_FOLLOWERS: '5aefa9893005572d237da5068082d8d5',
  GET_FOLLOWING: '3dec7e2c57367ef3da3d987d89f9dbc8',
  HIGHLIGHTS: 'd4d88dc1500312af6f937f7b804c68c3', // and suggested
  USER_POSTS: '42d2750e44dbac713ff30130659cd891',
}
myUserId = '3199863918'

function getFollowing (userId, count = 24, cursor = null) {
  return fetch(
    'https://www.instagram.com/graphql/query/?' +
      new URLSearchParams({
        query_hash: queryTypes.GET_FOLLOWING,
        variables: JSON.stringify({
          id: userId,
          include_reel: true,
          fetch_mutual: true,
          first: count,
          after: cursor || undefined,
        })
      })
  )
    .then(r => r.json())
    .then(({ data: { user: { edge_follow } } }) => edge_follow)
}

following = new Map()
let cursor
while (true) {
  const { edges, page_info: { end_cursor, has_next_page } } = await getFollowing(myUserId, 100, cursor)
  for (const { node } of edges) {
    following.set(node.id, node)
  }
  if (has_next_page) {
    cursor = end_cursor
  } else {
    break
  }
}
following

function getPosts (userId, count = 12, cursor = null) {
  return fetch(
    'https://www.instagram.com/graphql/query/?' +
      new URLSearchParams({
        query_hash: queryTypes.USER_POSTS,
        variables: JSON.stringify({
          id: userId,
          first: count,
          after: cursor || undefined,
        })
      })
  )
    .then(r => r.json())
    .then(({ data: { user: { edge_owner_to_timeline_media } } }) => edge_owner_to_timeline_media)
}

async function getAllPosts (userId) {
  const posts = []
  let cursor
  while (true) {
    const { edges, page_info: { end_cursor, has_next_page } } = await getPosts(userId, 1000, cursor)
    posts.push(...edges)
    if (has_next_page) {
      cursor = end_cursor
    } else {
      break
    }
  }
  return posts
}

await getAllPosts('12338962766')
