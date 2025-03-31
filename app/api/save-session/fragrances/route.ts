import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('Received POST request to /api/fragrances');

  // Cannot read cookies in a try/catch block that also reads request body
  const cookieStore = cookies(); // Required for createServerClient

  try {
    // 1. Initialize Supabase Client (server-side)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Supabase URL or Service Role Key is missing');
      throw new Error('Server configuration error.');
    }

    // Use Service Role Key for direct DB access in API routes
    const supabase = createServerClient(supabaseUrl, supabaseServiceRoleKey, {
      cookies: {
        async getAll() {
          // Ensure cookieStore is awaited before calling getAll()
          const store = await cookieStore;
          return store.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            // Ensure cookieStore is awaited before accessing its methods
            const store = await cookieStore;
            cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch (error) {
            // Ignore potential errors in Route Handlers during set
          }
        },
      },
    });

    // 2. Get data from request body
    const body = await request.json();
    console.log('Request body:', body);

    const {
      sessionId, // ID from the chat session
      name,
      concept,
      top_note,
      middle_note,
      base_note,
      // Optional fields, handle if they exist
      bottle_shape,
      label_image_url,
    } = body;

    // 3. Validate required data
    if (!sessionId || !name || !concept || !top_note || !middle_note || !base_note) {
      console.error('Missing required fields in request body', { sessionId, name, concept, top_note, middle_note, base_note });
      return NextResponse.json(
        { success: false, error: 'Missing required fragrance data (sessionId, name, concept, notes).' },
        { status: 400 }
      );
    }

    // 4. Prepare data for Supabase insert
    const fragranceData = {
      session_id: sessionId,
      name: name,
      concept: concept,
      top_note: top_note,
      middle_note: middle_note,
      base_note: base_note,
      bottle_shape: bottle_shape, // Will be null if not provided
      label_image_url: label_image_url, // Will be null if not provided
      // created_at will be set by default value in Supabase
    };
    console.log('Data to insert:', fragranceData);


    // 5. Insert data into Supabase 'fragrances' table
    const { data, error } = await supabase
      .from('fragrances')
      .insert(fragranceData)
      .select('id') // Only select the ID of the new row
      .single(); // Expecting only one row to be inserted and returned

    // 6. Handle Supabase errors
    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || !data.id) {
        console.error('Supabase insert error: No data returned after insert');
        throw new Error('Failed to retrieve ID after saving fragrance.');
    }

    const newFragranceId = data.id;
    console.log('Supabase insert successful. New fragrance ID:', newFragranceId);

    // 7. Return success response with the new fragrance ID
    return NextResponse.json({ success: true, fragranceId: newFragranceId });

  } catch (error) {
    console.error('API Error in /api/fragrances:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    // Return generic error to the client
    return NextResponse.json(
        { success: false, error: 'Failed to save fragrance.' },
        { status: 500 }
    );
  }
}