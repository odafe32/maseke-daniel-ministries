export const bottomMenuHiddenSegments = [
  "/profile",
  "/saved-notes",
  "/orders",
  "/wishlists",
  "/notifications",
  "/change-password",
  "/help",
  "/about",
  "/privacy-policy",
  "/settings",
  "/prayer-request",
  "/store",
];

export const shouldHideBottomMenu = (pathname?: string | null) => {
  if (!pathname) {
    return true;
  }

  const normalizedPath = pathname.toLowerCase();

  if (normalizedPath === "/") {
    return true;
  }

  return bottomMenuHiddenSegments.some((segment) =>
    normalizedPath.startsWith(segment.toLowerCase())
  );
};
