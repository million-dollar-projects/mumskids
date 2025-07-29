import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const userId = searchParams.get('userId');

  console.log('API /practices called with:', { type, userId });

  try {
    let query = supabase.from('practices').select();

    if (type === 'public') {
      console.log('Fetching public practices...');
      query = query.eq('is_public', true);
    } else if (type === 'user' && userId) {
      console.log('Fetching user practices for:', userId);
      query = query.eq('created_by', userId);
    } else {
      console.log('Invalid request parameters:', { type, userId });
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database query failed:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} practices for type: ${type}`);
    
    // 如果没有数据，检查数据库中是否有任何练习
    if (!data || data.length === 0) {
      const { data: allPractices, error: countError } = await supabase
        .from('practices')
        .select('id, is_public, created_by', { count: 'exact' });
      
      console.log('Total practices in database:', allPractices?.length || 0);
      if (allPractices) {
        console.log('Practice details:', allPractices.map(p => ({ 
          id: p.id, 
          is_public: p.is_public, 
          created_by: p.created_by 
        })));
      }
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('获取练习列表失败:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch practices', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    console.log('收到的请求数据:', body);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('获取用户信息失败:', userError);
      return NextResponse.json({ error: 'Unauthorized', details: userError.message }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }

    // 验证必填字段
    const requiredFields = ['title', 'childName', 'difficulty', 'testMode'];
    const missingFields = requiredFields.filter(field => !body[field]);

    // 根据测试模式验证额外的必填字段
    if (body.testMode === 'normal' && !body.questionCount) {
      missingFields.push('questionCount');
    } else if (body.testMode === 'timed' && !body.timeLimit) {
      missingFields.push('timeLimit');
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', fields: missingFields },
        { status: 400 }
      );
    }

    // 验证字段值的合法性
    if (body.testMode === 'normal' && (body.questionCount < 5 || body.questionCount > 50)) {
      return NextResponse.json(
        { error: 'Invalid question count. Must be between 5 and 50.' },
        { status: 400 }
      );
    }

    if (body.testMode === 'timed' && (body.timeLimit < 1 || body.timeLimit > 30)) {
      return NextResponse.json(
        { error: 'Invalid time limit. Must be between 1 and 30 minutes.' },
        { status: 400 }
      );
    }

    // 生成随机slug
    const { data: slugData, error: slugError } = await supabase
      .rpc('generate_practice_slug');
    
    if (slugError) {
      console.error('生成slug失败:', slugError);
      return NextResponse.json({ error: 'Failed to generate slug' }, { status: 500 });
    }

    const dbData = {
      created_by: user.id,
      slug: slugData,
      title: body.title,
      description: body.description || '',
      child_name: body.childName,
      gender: body.gender || 'boy',
      difficulty: body.difficulty,
      calculation_type: body.calculationType || 'add',
      test_mode: body.testMode,
      question_count: body.testMode === 'normal' ? body.questionCount : null,
      time_limit: body.testMode === 'timed' ? body.timeLimit : null,
      is_public: body.isPublic ?? false,
      selected_theme: body.selectedTheme || 'default',
      reward_distribution_mode: body.rewardDistributionMode || 'random',
      rewards: body.rewards || [],
      stats: {
        total_attempts: 0,
        completed_attempts: 0,
        average_score: 0,
        best_score: 0,
        best_time: null
      }
    };

    console.log('准备保存的数据:', dbData);

    const { data, error } = await supabase
      .from('practices')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('保存到数据库失败:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    console.log('保存成功:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('创建练习失败:', error);
    return NextResponse.json(
      { error: 'Failed to create practice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 