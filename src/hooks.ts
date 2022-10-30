import { useState, useEffect } from "react";

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

export function useQueryParams() {
  const [queryParams, setQueryParams] = useState(
    new URLSearchParams(window.location.search)
  );

  useEffect(() => {
    const handleQueryParams = () => {
      setQueryParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", handleQueryParams);

    return () => window.removeEventListener("popstate", handleQueryParams);
  }, []);

  const setSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${newParams.toString()}`
    );
  };

  return { queryParams, setSearchParams };
}

import { useSearchParams } from "react-router-dom";

export function useSearchParamsState(
  searchParamName: string,
  defaultValue: string
): readonly [
  searchParamsState: string,
  setSearchParamsState: (newState: string) => void
] {
  const [searchParams, setSearchParams] = useSearchParams();

  const acquiredSearchParam = searchParams.get(searchParamName);
  const searchParamsState = acquiredSearchParam ?? defaultValue;

  const setSearchParamsState = (newState: string) => {
    const next = Object.assign(
      {},
      [...searchParams.entries()].reduce(
        (o, [key, value]) => ({ ...o, [key]: value }),
        {}
      ),
      { [searchParamName]: newState }
    );
    setSearchParams(next);
  };
  return [searchParamsState, setSearchParamsState];
}

export function useSearchParamsStateBoolean(
  searchParamName: string,
  defaultValue: boolean
): readonly [
  searchParamsState: boolean,
  setSearchParamsState: (newState: boolean) => void
] {
  const [searchParamsState, setSearchParamsState] = useSearchParamsState(
    searchParamName,
    defaultValue.toString()
  );
  return [
    searchParamsState === "true",
    (newState) => setSearchParamsState(newState.toString()),
  ];
}

export function useSearchParamsStateNumber(
  searchParamName: string,
  defaultValue: number
): readonly [
  searchParamsState: number,
  setSearchParamsState: (newState: number) => void
] {
  const [searchParamsState, setSearchParamsState] = useSearchParamsState(
    searchParamName,
    defaultValue.toString()
  );
  return [
    parseInt(searchParamsState),
    (newState) => setSearchParamsState(newState.toString()),
  ];
}

export function useSearchParamsStateArray(
  searchParamName: string,
  defaultValue: string[]
): readonly [
  searchParamsState: string[],
  setSearchParamsState: (newState: string[]) => void
] {
  const [searchParamsState, setSearchParamsState] = useSearchParamsState(
    searchParamName,
    defaultValue.join(",")
  );
  return [
    searchParamsState.split(","),
    (newState) => setSearchParamsState(newState.join(",")),
  ];
}

export function useSearchParamsStateArrayNumber(
  searchParamName: string,
  defaultValue: number[]
): readonly [
  searchParamsState: number[],
  setSearchParamsState: (newState: number[]) => void
] {
  const [searchParamsState, setSearchParamsState] = useSearchParamsState(
    searchParamName,
    defaultValue.join(",")
  );
  return [
    searchParamsState.split(",").map((x) => parseInt(x)),
    (newState) => setSearchParamsState(newState.join(",")),
  ];
}

export function useSearchParamsStateArrayBoolean(
  searchParamName: string,
  defaultValue: boolean[]
): readonly [
  searchParamsState: boolean[],
  setSearchParamsState: (newState: boolean[]) => void
] {
  const [searchParamsState, setSearchParamsState] = useSearchParamsState(
    searchParamName,
    defaultValue.join(",")
  );
  return [
    searchParamsState.split(",").map((x) => x === "true"),
    (newState) => setSearchParamsState(newState.join(",")),
  ];
}
