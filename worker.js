export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS Headers for API calls
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Helper: Turnstile Verification
    async function verifyTurnstile(token, secretKey, remoteIp) {
      if (!token) return false;
      if (!secretKey) return true; // If not configured locally, allow
      try {
        const formData = new FormData();
        formData.append('secret', secretKey);
        formData.append('response', token);
        if (remoteIp) formData.append('remoteip', remoteIp);

        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData
        });
        const outcome = await res.json();
        return outcome.success === true;
      } catch (e) {
        console.error('Turnstile verification error:', e);
        return false;
      }
    }

    // Helper: Auth Check
    function checkAuth(req) {
      const serverSecret = env.ADMIN_PASSWORD || env.Passwort;
      // 1. Check Cookie
      const cookie = req.headers.get('Cookie') || '';
      if (cookie.includes('sf_admin_auth=valid')) return true;

      // 2. Check Authorization Header (Bearer or Direct Password)
      const authHeader = req.headers.get('Authorization') || '';
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token === serverSecret || token === 'valid_session_token') return true;
      }

      return false;
    }

    // --- AUTH ROUTES ---
    if ((url.pathname === '/api/admin/login' || url.pathname === '/api/login') && method === 'POST') {
      try {
        let password = '';
        let turnstileToken = '';

        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const body = await request.json();
          password = body.password || '';
          turnstileToken = body.turnstileToken || body['cf-turnstile-response'] || '';
        } else if (contentType.includes('form')) {
          const fd = await request.formData();
          password = fd.get('password') || '';
          turnstileToken = fd.get('cf-turnstile-response') || fd.get('turnstileToken') || '';
        }

        const serverSecret = env.ADMIN_PASSWORD || env.Passwort;
        const turnstileSecret = env.TURNSTILE_SECRET_KEY;
        const clientIp = request.headers.get('CF-Connecting-IP');

        // Verify Turnstile if turnstileSecret is configured
        if (turnstileSecret) {
          if (!turnstileToken) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Sicherheitsprüfung (Cloudflare Turnstile) erforderlich.'
            }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }
          const isValidTurnstile = await verifyTurnstile(turnstileToken, turnstileSecret, clientIp);
          if (!isValidTurnstile) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Sicherheitsprüfung (Cloudflare Turnstile) fehlgeschlagen. Bitte aktualisieren.'
            }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }
        }

        // Verify Password
        if (password && password === serverSecret) {
          const headers = new Headers({
            'Content-Type': 'application/json',
            'Set-Cookie': 'sf_admin_auth=valid; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400',
            ...corsHeaders
          });
          return new Response(JSON.stringify({ success: true, token: 'valid_session_token' }), {
            status: 200,
            headers
          });
        }

        return new Response(JSON.stringify({
          success: false,
          error: 'Ungültiges Admin-Passwort. Bitte versuchen Sie es erneut.'
        }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    if (url.pathname === '/api/admin/logout' || url.pathname === '/logout') {
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Set-Cookie': 'sf_admin_auth=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
        ...corsHeaders
      });
      if (url.pathname === '/logout') {
        headers.set('Location', '/admin');
        return new Response('Logged out', { status: 302, headers });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    // --- PUBLIC DATA APIs ---

    // 1. NEWS API
    if (url.pathname === '/api/news' && method === 'GET') {
      try {
        const obj = await env.BUCKET.get('gewerbeverein heemsen/news_data.json');
        if (!obj) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        return new Response(obj.body, { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 2. EVENTS API
    if (url.pathname === '/api/events' && method === 'GET') {
      try {
        const obj = await env.BUCKET.get('gewerbeverein heemsen/events_data.json');
        if (!obj) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        return new Response(obj.body, { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 3. MEMBERS API
    if (url.pathname === '/api/members' && method === 'GET') {
      try {
        const obj = await env.BUCKET.get('gewerbeverein heemsen/members_data.json');
        if (!obj) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        return new Response(obj.body, { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // --- PROTECTED ADMIN APIs ---
    if (url.pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE'].includes(method) && !url.pathname.includes('/login')) {
      if (!checkAuth(request)) {
        return new Response(JSON.stringify({ success: false, error: 'Nicht autorisiert. Bitte einloggen.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // SAVE NEWS (POST /api/news)
      if (url.pathname === '/api/news' && method === 'POST') {
        try {
          const contentType = request.headers.get('content-type') || '';
          let postData = {};

          if (contentType.includes('application/json')) {
            postData = await request.json();
          } else {
            const fd = await request.formData();
            postData = {
              id: fd.get('id') || Date.now().toString(),
              title: fd.get('title') || '',
              date: fd.get('date') || '',
              excerpt: fd.get('excerpt') || '',
              content: fd.get('content') || '',
              images: fd.get('images') ? JSON.parse(fd.get('images')) : []
            };
          }

          if (!postData.id) postData.id = Date.now().toString();

          let news = [];
          const obj = await env.BUCKET.get('gewerbeverein heemsen/news_data.json');
          if (obj) {
            news = JSON.parse(await obj.text());
          }

          const existingIdx = news.findIndex(n => n.id === postData.id);
          if (existingIdx >= 0) {
            news[existingIdx] = { ...news[existingIdx], ...postData };
          } else {
            news.unshift(postData);
          }

          await env.BUCKET.put('gewerbeverein heemsen/news_data.json', JSON.stringify(news, null, 2), {
            httpMetadata: { contentType: 'application/json' }
          });

          return new Response(JSON.stringify({ success: true, item: postData }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // DELETE NEWS (DELETE /api/news/:id or /api/news?id=...)
      if ((url.pathname.startsWith('/api/news/') || (url.pathname === '/api/news' && url.searchParams.has('id'))) && method === 'DELETE') {
        try {
          const id = url.searchParams.get('id') || url.pathname.replace('/api/news/', '').trim();
          let news = [];
          const obj = await env.BUCKET.get('gewerbeverein heemsen/news_data.json');
          if (obj) news = JSON.parse(await obj.text());

          news = news.filter(n => n.id !== id);

          await env.BUCKET.put('gewerbeverein heemsen/news_data.json', JSON.stringify(news, null, 2), {
            httpMetadata: { contentType: 'application/json' }
          });

          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // SAVE EVENTS (POST /api/events)
      if (url.pathname === '/api/events' && method === 'POST') {
        try {
          const contentType = request.headers.get('content-type') || '';
          let eventData = {};

          if (contentType.includes('application/json')) {
            eventData = await request.json();
          } else {
            const fd = await request.formData();
            eventData = {
              id: fd.get('id') || Date.now().toString(),
              title: fd.get('title') || '',
              date: fd.get('date') || '',
              time: fd.get('time') || '',
              location: fd.get('location') || '',
              description: fd.get('description') || ''
            };
          }

          if (!eventData.id) eventData.id = Date.now().toString();

          let events = [];
          const obj = await env.BUCKET.get('gewerbeverein heemsen/events_data.json');
          if (obj) events = JSON.parse(await obj.text());

          const existingIdx = events.findIndex(e => e.id === eventData.id);
          if (existingIdx >= 0) {
            events[existingIdx] = { ...events[existingIdx], ...eventData };
          } else {
            events.push(eventData);
          }

          await env.BUCKET.put('gewerbeverein heemsen/events_data.json', JSON.stringify(events, null, 2), {
            httpMetadata: { contentType: 'application/json' }
          });

          return new Response(JSON.stringify({ success: true, item: eventData }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // DELETE EVENT (DELETE /api/events/:id or /api/events?id=...)
      if ((url.pathname.startsWith('/api/events/') || (url.pathname === '/api/events' && url.searchParams.has('id'))) && method === 'DELETE') {
        try {
          const id = url.searchParams.get('id') || url.pathname.replace('/api/events/', '').trim();
          let events = [];
          const obj = await env.BUCKET.get('gewerbeverein heemsen/events_data.json');
          if (obj) events = JSON.parse(await obj.text());

          events = events.filter(e => e.id !== id);

          await env.BUCKET.put('gewerbeverein heemsen/events_data.json', JSON.stringify(events, null, 2), {
            httpMetadata: { contentType: 'application/json' }
          });

          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // SAVE MEMBERS (POST /api/members)
      if (url.pathname === '/api/members' && method === 'POST') {
        try {
          const contentType = request.headers.get('content-type') || '';
          let memberData = {};

          if (contentType.includes('application/json')) {
            memberData = await request.json();
          } else {
            const fd = await request.formData();
            memberData = {
              id: fd.get('id') || Date.now().toString(),
              name: fd.get('name') || '',
              address: fd.get('address') || '',
              phone: fd.get('phone') || '',
              fax: fd.get('fax') || '',
              mobile: fd.get('mobile') || '',
              email: fd.get('email') || '',
              website: fd.get('website') || '',
              tags: fd.get('tags') ? (typeof fd.get('tags') === 'string' ? fd.get('tags').split(',').map(t => t.trim()).filter(Boolean) : fd.get('tags')) : [],
              logo: fd.get('logo') || ''
            };
          }

          if (!memberData.id) memberData.id = Date.now().toString();

          let members = [];
          const obj = await env.BUCKET.get('gewerbeverein heemsen/members_data.json');
          if (obj) members = JSON.parse(await obj.text());

          const existingIdx = members.findIndex(m => m.id === memberData.id);
          if (existingIdx >= 0) {
            members[existingIdx] = { ...members[existingIdx], ...memberData };
          } else {
            members.push(memberData);
          }

          await env.BUCKET.put('gewerbeverein heemsen/members_data.json', JSON.stringify(members, null, 2), {
            httpMetadata: { contentType: 'application/json' }
          });

          return new Response(JSON.stringify({ success: true, item: memberData }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // DELETE MEMBER (DELETE /api/members/:id or /api/members?id=...)
      if ((url.pathname.startsWith('/api/members/') || (url.pathname === '/api/members' && url.searchParams.has('id'))) && method === 'DELETE') {
        try {
          const id = url.searchParams.get('id') || url.pathname.replace('/api/members/', '').trim();
          let members = [];
          const obj = await env.BUCKET.get('gewerbeverein heemsen/members_data.json');
          if (obj) members = JSON.parse(await obj.text());

          members = members.filter(m => m.id !== id);

          await env.BUCKET.put('gewerbeverein heemsen/members_data.json', JSON.stringify(members, null, 2), {
            httpMetadata: { contentType: 'application/json' }
          });

          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // UPLOAD IMAGE (POST /api/upload)
      if (url.pathname === '/api/upload' && method === 'POST') {
        try {
          const formData = await request.formData();
          const file = formData.get('file');
          const folder = (formData.get('folder') || 'aktuelles').replace(/[^a-zA-Z0-9_-]/g, '');

          if (!file || typeof file === 'string') {
            return new Response(JSON.stringify({ success: false, error: 'Keine Datei ausgewählt.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const cleanName = (file.name || 'image.webp').replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
          const r2Key = `gewerbeverein heemsen/${folder}/${Date.now()}_${cleanName}`;

          await env.BUCKET.put(r2Key, file.stream(), {
            httpMetadata: { contentType: file.type || 'image/webp' }
          });

          const publicUrl = `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key.split('/').map(encodeURIComponent).join('/')}`;

          return new Response(JSON.stringify({ success: true, url: publicUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
    }

    // --- STATIC ASSETS FALLBACK ---
    const assetResponse = await env.ASSETS.fetch(request);
    const secHeaders = new Headers(assetResponse.headers);
    secHeaders.set('X-Frame-Options', 'DENY');
    secHeaders.set('X-Content-Type-Options', 'nosniff');
    secHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers: secHeaders
    });
  }
};
