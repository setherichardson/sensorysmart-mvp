import { NextRequest, NextResponse } from 'next/server'
import { chatService, createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const messageData = {
      user_id: user.id,
      message_type: body.messageType,
      content: body.content,
    }

    const message = await chatService.saveMessage(messageData)
    
    return NextResponse.json({ 
      success: true, 
      data: message,
      message: 'Chat message saved successfully' 
    })
  } catch (error) {
    console.error('Error saving chat message:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save chat message' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const messages = await chatService.getChatHistory(user.id)
    
    return NextResponse.json({ 
      success: true, 
      messages 
    })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch chat history' 
      },
      { status: 500 }
    )
  }
} 