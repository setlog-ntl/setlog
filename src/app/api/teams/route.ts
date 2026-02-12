import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, serverError } from '@/lib/api/errors';
import { z } from 'zod';

const createTeamSchema = z.object({
  name: z.string().min(1, '팀 이름은 필수입니다').max(100),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  // Query 1: teams where user is owner
  const { data: ownedTeams, error: ownedError } = await supabase
    .from('teams')
    .select('*, team_members(count)')
    .eq('owner_id', user.id);

  if (ownedError) return serverError(ownedError.message);

  // Query 2: teams where user is a member (via team_members join)
  const { data: memberTeams, error: memberError } = await supabase
    .from('team_members')
    .select('team:teams(*, team_members(count))')
    .eq('user_id', user.id);

  if (memberError) return serverError(memberError.message);

  // Merge and deduplicate by team id
  const teamsMap = new Map<string, (typeof ownedTeams)[number]>();
  for (const team of (ownedTeams || [])) {
    teamsMap.set(team.id, team);
  }
  for (const row of (memberTeams || [])) {
    const team = row.team as unknown as (typeof ownedTeams)[number] | null;
    if (team && !teamsMap.has(team.id)) {
      teamsMap.set(team.id, team);
    }
  }

  return NextResponse.json({ teams: Array.from(teamsMap.values()) });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const body = await request.json();
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { data: team, error } = await supabase
    .from('teams')
    .insert({ name: parsed.data.name, owner_id: user.id })
    .select()
    .single();

  if (error) return serverError(error.message);

  // Add owner as admin member
  await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: user.id,
    role: 'admin',
    invited_by: user.id,
  });

  return NextResponse.json(team, { status: 201 });
}
