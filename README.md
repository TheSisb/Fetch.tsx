# Fetch Component Documentation

The Fetch component is a flexible React wrapper around that simplifies data fetching with built-in loading and error states.
Check out [the buzz on my initial post](https://x.com/TheSisb/status/1858909454441607406) for more context.

## Why Use Fetch?
Sometimes, it’s useful to colocate fetch requests directly with a React component. This approach provides a straightforward way to trigger requests and handle responses without needing to refactor code or create new components.

Under the hood, Fetch simply wraps a `useQuery` call in a React component—just like you’d write `useQuery` at the top of your component. There’s no hidden magic here—just an ergonomic way to manage your data fetching.


## Installation

Copy the [Fetch.tsx] file into your codebase and make any modifications you need.

> Note: Be sure to update the `BASE_URL` constant in the source code to match your environment.

## Basic Usage

### Single URL Fetch
```tsx
<Fetch url="/api/users" method="GET">
  {(data) => (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )}
</Fetch>
```

### With Query Parameters
```tsx
<Fetch 
  url="/api/search" 
  params={{ query: "react", page: "1" }}
>
  {(results) => <SearchResults data={results} />}
</Fetch>
```

### Multiple URLs Fetch
```tsx
<Fetch 
  urls={["/api/users", "/api/posts"]} 
  waitForAll={true}
  LoadingComponent={<div>Loading...</div>}
>
  {([users, posts]) => (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
    </div>
  )}
</Fetch>
```

### POST Request with Body
```tsx
<Fetch 
  url="/api/users" 
  method="POST"
  body={{ name: "John Doe", email: "john@example.com" }}
>
  {(response) => <div>User created: {response.id}</div>}
</Fetch>
```

### Error Handling Example
```tsx
const CustomError = ({ error }: { error: Error }) => (
  <div className="error-container">
    <h3>Something went wrong!</h3>
    <p>{error.message}</p>
  </div>
);

<Fetch 
  url="/api/data" 
  ErrorComponent={CustomError}
  LoadingComponent={<Spinner />}
>
  {(data) => <DataDisplay data={data} />}
</Fetch>
```


## Props
| Prop | Type | Description |
|------|------|-------------|
| url | string | Single URL to fetch from |
| urls | string[] | Array of URLs to fetch from |
| method | "GET" \| "POST" \| "PUT" \| "DELETE" | HTTP method (default: "GET") |
| params | Record<string, string> | Query parameters |
| body | unknown | Request body for POST/PUT requests |
| queryOptions | UseQueryOptions | React Query options for advanced usage |
| children | (data: unknown) => React.ReactNode | Render prop for data |
| LoadingComponent | React.ReactNode | Component to show while loading |
| ErrorComponent | React.ComponentType<{error: Error}> \| React.ReactElement | Component to show on error |
| waitForAll | boolean | For multiple URLs, wait for all requests to complete (default: false) |


## Advanced examples

### Advanced Usage with Query Options

```tsx
<Fetch 
  queryOptions={{
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
    staleTime: 5000,
    cacheTime: 10000
  }}
>
  {(data) => <UserList data={data} />}
</Fetch>
```

### Prefetching

Move the Fetch component higher in the tree and render nothing:
```tsx
<Fetch url="/api/users" LoadingComponent={null} />
```
Then use the same Fetch call elsewhere in your app to render the data as needed. Thanks to TanStack’s caching, it will just work.


## Future considerations

You might consider refactoring this to use Suspense. Personally, I didn’t see the need, but it could be a useful next step depending on your requirements.
