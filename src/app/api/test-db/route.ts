import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing database connection...');
    const supabase = await createClient();

    // 测试基本连接
    const { data: connectionTest, error: connectionError } = await supabase
      .from('practices')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('Connection test failed:', connectionError);
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: connectionError.message,
        details: connectionError
      }, { status: 500 });
    }

    // 获取所有练习
    const { data: allPractices, error: fetchError } = await supabase
      .from('practices')
      .select('*');

    if (fetchError) {
      console.error('Fetch test failed:', fetchError);
      return NextResponse.json({
        status: 'error',
        message: 'Failed to fetch practices',
        error: fetchError.message,
        details: fetchError
      }, { status: 500 });
    }

    // 测试用户认证
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Database test results:', {
      practiceCount: allPractices?.length || 0,
      userAuthenticated: !!user,
      userId: user?.id
    });

    return NextResponse.json({
      status: 'success',
      connection: 'ok',
      practiceCount: allPractices?.length || 0,
      practices: allPractices?.map(p => ({
        id: p.id,
        slug: p.slug,
        title: (p.metadata as { title?: string })?.title || 'No title',
        is_public: p.is_public,
        created_by: p.created_by,
        created_at: p.created_at
      })) || [],
      user: user ? {
        id: user.id,
        email: user.email
      } : null
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 