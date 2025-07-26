import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();
  const { slug } = await params;

  try {
    // 获取练习详情
    const { data, error } = await supabase
      .from('practices')
      .select()
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Practice not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // 获取当前用户信息
    const { data: { user } } = await supabase.auth.getUser();

    // 如果练习不是公开的，且不是创建者，则返回404
    if (!data.is_public && (!user || user.id !== data.created_by)) {
      return NextResponse.json(
        { error: 'Practice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('获取练习详情失败:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 