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

    // 移除权限检查 - 任何人都可以通过链接访问练习
    // 无论练习是否为私密，只要知道链接就可以访问

    return NextResponse.json(data);
  } catch (error) {
    console.error('获取练习详情失败:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();
  const { slug } = await params;

  try {
    // 获取当前用户信息
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('获取用户信息失败:', userError);
      return NextResponse.json({ error: 'Unauthorized', details: userError.message }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }

    // 首先获取练习信息以验证权限
    const { data: practice, error: fetchError } = await supabase
      .from('practices')
      .select('id, created_by, title')
      .eq('slug', slug)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Practice not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // 验证用户是否有权限删除此练习
    if (practice.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own practices' },
        { status: 403 }
      );
    }

    // 删除练习
    const { error: deleteError } = await supabase
      .from('practices')
      .delete()
      .eq('slug', slug);

    if (deleteError) {
      console.error('删除练习失败:', deleteError);
      throw deleteError;
    }

    console.log(`练习 "${practice.title}" (${slug}) 已被用户 ${user.id} 删除`);
    
    return NextResponse.json({ 
      message: 'Practice deleted successfully',
      deletedPractice: {
        id: practice.id,
        title: practice.title,
        slug: slug
      }
    });
  } catch (error) {
    console.error('删除练习失败:', error);
    return NextResponse.json(
      { error: 'Failed to delete practice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 