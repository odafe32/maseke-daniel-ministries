export const bottomMenuHiddenSegments = [
  "/profile",
  "/bible",
  "/saved-notes",
  "/orders",

  "/notifications",
  "/change-password",
"/wishlists",
  "/about",
  "/privacy-policy",
  "/settings",
  // "/prayer-request",
  "/give",
  "/cart",
  "/payment",
  "/live",
  "/sermon-detail",
  "/devotionals",
  "/my-responses",
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
