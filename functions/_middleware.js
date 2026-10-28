export async function onRequest(context) {
  const url = new URL(context.request.url);

  // If traffic hits pages.dev, 301 permanent redirect to custom domain
  if (url.hostname === "sharriffajar.pages.dev") {
    url.hostname = "sharriffajar.my.id";
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
