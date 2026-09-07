export default {
  async fetch(request: Request): Promise<Response> {
    const source = new URL(request.url);
    const target = new URL(source.toString());

    target.protocol = "https:";
    target.hostname = "wstera.com";
    target.port = "";

    return Response.redirect(target.toString(), 308);
  },
} satisfies ExportedHandler;
