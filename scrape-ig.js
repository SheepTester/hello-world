queryTypes = {
  GET_FOLLOWERS: '5aefa9893005572d237da5068082d8d5',
  GET_FOLLOWING: '3dec7e2c57367ef3da3d987d89f9dbc8',
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
