export async function GET() {
  return Response.json({
    replicateConfigured: Boolean(process.env.REPLICATE_API_TOKEN?.trim()),
  });
}
