import { NextRequest, NextResponse } from 'next/server';
import { getCategories, getAgentsByCategory, searchAgents, suggestAgentsForDomain } from '@/lib/agents/library';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'categories';

  if (action === 'categories') {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  }

  if (action === 'agents') {
    const categoryId = searchParams.get('category');
    if (!categoryId) return NextResponse.json({ error: 'category required' }, { status: 400 });
    const agents = await getAgentsByCategory(categoryId);
    return NextResponse.json({ agents });
  }

  if (action === 'search') {
    const query = searchParams.get('q') || '';
    const agents = await searchAgents(query);
    return NextResponse.json({ agents });
  }

  if (action === 'suggest') {
    const domain = searchParams.get('domain') || 'general';
    const agents = await suggestAgentsForDomain(domain);
    return NextResponse.json({ agents });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
