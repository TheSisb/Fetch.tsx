import React from "react";
import { useQueries, useQuery, type UseQueryOptions } from "@tanstack/react-query";

const BASE_URL = "http://localhost:8000";

// Converts a params object into a URL query string, handling arrays and null values
const buildQueryString = (params: Record<string, any>): string => {
  if (!params) return "";

  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value
        .filter((item) => item != null)
        .forEach((item) => urlParams.append(key, String(item)));
    } else {
      urlParams.append(key, String(value));
    }
  });

  return urlParams.toString();
};

// Helper function for making fetch requests
// Note: You can use any fetch library you want, but this is a simple implementation
async function makeFetchRequest(
  url: string,
  method: string,
  params?: Record<string, string>,
  body?: unknown
) {
  const response = await fetch(
    params ? `${BASE_URL}${url}?${buildQueryString(params)}` : `${BASE_URL}${url}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Expected JSON response but got ${contentType}, body: ${text}`);
  }

  return response.json();
}

type FetchProps = {
  // Core props
  url?: string;
  urls?: string[];
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, string>;
  body?: unknown;
  queryOptions?: UseQueryOptions;

  // Component props
  children: (data: unknown) => React.ReactNode;
  LoadingComponent?: React.ReactNode;
  ErrorComponent?: React.ComponentType<{ error: Error }> | React.ReactElement;

  // Behavior props
  waitForAll?: boolean;
};

export function Fetch({
  // Core props
  url,
  urls,
  method = "GET",
  params,
  body,
  queryOptions,

  // Component props
  children,
  LoadingComponent = <div>Loading...</div>,
  ErrorComponent = DefaultError,

  // Behavior props
  waitForAll = false,
}: FetchProps) {
  // Handle single URL case
  if (url) {
    const { data, error, isLoading } = useQuery({
      ...queryOptions,
      queryKey: queryOptions?.queryKey ?? [url, method, params, body],
      queryFn: () => makeFetchRequest(url, method, params, body),
    });

    if (error) {
      return renderError(ErrorComponent, error as Error);
    }

    if (isLoading && LoadingComponent) {
      return LoadingComponent;
    }

    return children(data);
  }

  // Handle multiple URLs case
  if (urls) {
    const results = useQueries({
      queries: urls.map((url) => ({
        ...queryOptions,
        queryKey: [url, method, params, body],
        queryFn: () => makeFetchRequest(url, method, params, body),
      })),
    });

    const isLoading = waitForAll
      ? results.some((r) => r.isLoading)
      : results.every((r) => r.isLoading);

    const error = results.find((r) => r.error)?.error;

    if (error) {
      return renderError(ErrorComponent, error as Error);
    }

    if (isLoading && LoadingComponent) {
      return LoadingComponent;
    }

    return children(results.map((r) => r.data));
  }

  // Handle queryOptions case (for advanced usage)
  if (queryOptions) {
    const { data, error, isLoading } = useQuery(queryOptions);

    if (error) {
      return renderError(ErrorComponent, error as Error);
    }

    if (isLoading && LoadingComponent) {
      return LoadingComponent;
    }

    return children(data);
  }

  throw new Error("Fetch component requires either url, urls, or queryOptions prop");
}

// Helper function to render error component
function renderError(
  ErrorComponent: React.ComponentType<{ error: Error }> | React.ReactElement,
  error: Error
) {
  if (React.isValidElement(ErrorComponent)) {
    return React.cloneElement(ErrorComponent as React.ReactElement<{ error: Error }>, {
      error,
    });
  }
  const Component = ErrorComponent as React.ComponentType<{ error: Error }>;
  return <Component error={error} />;
}

// Simple default error component
function DefaultError({ error }: { error: Error }) {
  return <div style={{ color: "red" }}>Error: {error.message}</div>;
}
