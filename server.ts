import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin with Service Role Key for management tasks
const normalizeSupabaseUrl = (url: string | undefined): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch (e) {
    return url.split('/rest/v1')[0].split('/auth/v1')[0].replace(/\/$/, '');
  }
};

const supabaseUrl = normalizeSupabaseUrl(process.env.VITE_SUPABASE_URL);
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Secure Voting Location Lookup (Official API Proxy)
  app.get("/api/voting-location/lookup", async (req, res) => {
    const cedula = typeof req.query.cedula === 'string' ? req.query.cedula.trim() : '';
    const requestId = req.headers['x-request-id'] as string;
    const authHeader = req.headers.authorization;

    if (!cedula) {
      return res.status(400).json({ error: "Número de cédula requerido" });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Servidor no configurado correctamente" });
    }

    try {
      // 1. AUTHENTICATION & CLIENT IDENTIFICATION
      if (!authHeader) return res.status(401).json({ error: "No autorizado" });
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !user) return res.status(401).json({ error: "Sesión inválida" });

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('client_id, role, display_name, email')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.client_id) {
        return res.status(403).json({ error: "No se pudo identificar el cliente asociado" });
      }

      const clientId = profile.client_id;

      // 2. IDEMPOTENCY CHECK
      if (requestId) {
        const { data: existingQuery } = await supabaseAdmin
          .from('polling_station_queries')
          .select('*')
          .eq('request_id', requestId)
          .eq('client_id', clientId)
          .single();

        if (existingQuery) {
          // If already processed, return previous result or status
          // Note: In a real scenario we might want to return the full cached response
          // For now, we allow the query if it exists but it won't consume again if we handle it below
          // Actually, if it exists, we just return it to avoid double consumption.
          if (existingQuery.results_summary) {
            return res.json(existingQuery.results_summary);
          }
        }
      }

      // 3. BALANCE CHECK
      const { data: usage, error: usageError } = await supabaseAdmin
        .from('client_api_usage')
        .select('*')
        .eq('client_id', clientId)
        .single();

      // If no usage record exists, assume 0 assigned
      const assigned = usage?.total_assigned || 0;
      const consumed = usage?.total_consumed || 0;
      const remaining = assigned - consumed;

      if (remaining <= 0) {
        return res.status(402).json({
          status: 'LIMIT_REACHED',
          message: "No tienes consultas disponibles. Comunícate con el administrador para ampliar tu límite."
        });
      }

      // 4. API CALL
      const apiBaseUrl = process.env.VOTING_API_BASE_URL;
      const apiEndpoint = process.env.VOTING_API_ENDPOINT || '/consultar';
      const apiKey = process.env.VOTING_API_KEY;
      const timeoutMs = parseInt(process.env.VOTING_API_TIMEOUT || '10000', 10);

      if (!apiBaseUrl) {
        return res.status(503).json({
          status: 'UNCONFIGURED',
          code: 'API_NOT_CONFIGURED',
          message: 'Servicio de consulta no configurado'
        });
      }

      const url = `${apiBaseUrl.replace(/\/$/, '')}${apiEndpoint}?cedula=${encodeURIComponent(cedula)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['X-API-Key'] = apiKey;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let resultStatus = 'ERROR';
      let responseData: any = null;

      if (response.status === 401 || response.status === 403) {
        return res.status(response.status).json({
          status: 'AUTH_ERROR',
          message: 'La autorización de la API no es válida.'
        });
      }

      if (response.status === 429) {
        return res.status(429).json({
          status: 'RATE_LIMIT',
          message: 'Se alcanzó el límite de la API externa.'
        });
      }

      if (response.status === 404) {
        resultStatus = 'NO_ENCONTRADO';
        responseData = {
          status: 'NOT_FOUND',
          message: 'No encontramos información asociada a esta cédula.'
        };
      } else if (!response.ok) {
        return res.status(response.status).json({
          status: 'PROVIDER_ERROR',
          message: 'El servicio de consulta no está disponible temporalmente.'
        });
      } else {
        responseData = await response.json();
        resultStatus = (responseData.status === 'NOT_FOUND' || responseData.encontrado === false) ? 'NO_ENCONTRADO' : 'ENCONTRADO';
      }

      // 5. CONSUMPTION RECORDING & TRACEABILITY
      // Only consume if the request was actually processed (ENCONTRADO or NO_ENCONTRADO)
      if (resultStatus === 'ENCONTRADO' || resultStatus === 'NO_ENCONTRADO') {
        const amount = 1;
        const previousBalance = remaining;
        const newBalance = remaining - amount;

        // Atomic-ish update: insert query, update usage, insert transaction
        try {
          const { data: queryRecord, error: queryError } = await supabaseAdmin
            .from('polling_station_queries')
            .insert([{
              client_id: clientId,
              user_id: user.id,
              user_name: profile.display_name,
              user_email: profile.email,
              user_role: profile.role,
              module_source: req.query.module || 'UNKNOWN',
              query_type: 'INDIVIDUAL',
              documento_consultado: cedula.length > 4 ? cedula.slice(0, 3) + '***' + cedula.slice(-3) : '***',
              puesto_encontrado: responseData.puestoVotacion || responseData.puesto || null,
              mesa_encontrada: responseData.mesa || null,
              municipio_encontrado: responseData.municipio || null,
              departamento_encontrado: responseData.departamento || null,
              found_count: resultStatus === 'ENCONTRADO' ? 1 : 0,
              not_found_count: resultStatus === 'NO_ENCONTRADO' ? 1 : 0,
              request_id: requestId,
              results_summary: responseData
            }])
            .select()
            .single();

          if (!queryError && queryRecord) {
            // Update client usage
            await supabaseAdmin
              .from('client_api_usage')
              .update({
                total_consumed: consumed + amount,
                last_query_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: newBalance <= 0 ? 'LIMIT_REACHED' : 'ACTIVE'
              })
              .eq('client_id', clientId);

            // Record transaction
            await supabaseAdmin
              .from('api_usage_transactions')
              .insert([{
                client_id: clientId,
                user_id: user.id,
                amount: -amount,
                transaction_type: 'CONSUMO',
                previous_balance: previousBalance,
                new_balance: newBalance,
                query_id: queryRecord.id,
                details: `Consulta de cédula: ${cedula.slice(0, 3)}***`
              }]);
          } else {
            console.warn('Could not record query (tables might be missing):', queryError?.message);
          }
        } catch (recordErr) {
          console.warn('Error recording API usage tracking:', recordErr);
          // We don't fail the request if tracking fails
        }
      }

      return res.json(responseData);

    } catch (err: any) {
      console.error('Lookup error:', err);
      return res.status(502).json({
        status: 'CONNECTION_ERROR',
        message: 'No fue posible conectar con el servicio de consulta.'
      });
    }
  });

  // API Route for secure user creation (Admin only)
  app.post("/api/admin/users/create", async (req, res) => {
    const { email, password, profile, permissions, actorId } = req.body;
    const authHeader = req.headers.authorization;

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase Admin not configured" });
    }

    try {
      // SECURITY LAYER 1: Verify the requester's JWT
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: requester }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
      
      if (verifyError || !requester) {
        return res.status(401).json({ error: "Invalid session" });
      }

      // SECURITY LAYER 2: Fetch requester's profile to verify role and client
      const { data: requesterProfile, error: profileFetchError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', requester.id)
        .single();

      if (profileFetchError || !requesterProfile) {
        return res.status(403).json({ error: "Could not verify permissions" });
      }

      // SECURITY LAYER 3: Privilege Checks
      const isSuperAdmin = requesterProfile.role === 'SUPERADMIN';
      const isClientAdmin = requesterProfile.role === 'ADMIN_CLIENTE';

      if (!isSuperAdmin && !isClientAdmin) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      // ClientAdmins can only create users for THEIR client
      if (isClientAdmin && requesterProfile.client_id !== profile.clientId) {
        return res.status(403).json({ error: "Cross-tenant creation prohibited" });
      }

      // Prevent Privilege Escalation
      if (isClientAdmin && (profile.role === 'SUPERADMIN' || profile.role === 'ADMIN_CLIENTE')) {
        // Client admins cannot create other admins (or superadmins)
        // Adjust logic based on business rules; here we allow ClientAdmin to create others if needed
        // but typically they shouldn't be able to create SuperAdmins.
        if (profile.role === 'SUPERADMIN') {
          return res.status(403).json({ error: "Cannot escalate to SuperAdmin" });
        }
      }

      // 1. Create User in Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: `${profile.firstName} ${profile.lastName}` }
      });

      if (authError) throw authError;

      // 2. Create Profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: authUser.user.id,
          email: email,
          display_name: `${profile.firstName} ${profile.lastName}`,
          client_id: profile.clientId,
          role: profile.role,
          status: 'ACTIVE',
          allowed_modules: profile.allowedModules,
          created_at: new Date().toISOString()
        }]);

      if (profileError) throw profileError;

      // 3. Create Detailed Permissions
      if (permissions && permissions.length > 0) {
        const { error: permError } = await supabaseAdmin
          .from('user_permissions')
          .insert(permissions.map((p: any) => ({
            user_id: authUser.user.id,
            module_code: p.moduleCode,
            function_code: p.functionCode,
            actions: p.actions
          })));
        
        if (permError) throw permError;
      }

      // 4. Audit Log
      await supabaseAdmin.from('audit_logs').insert([{
        user_id: actorId,
        client_id: profile.clientId,
        action: 'USER_CREATED',
        resource: authUser.user.id,
        details: { email, role: profile.role },
        timestamp: Date.now()
      }]);

      res.json({ success: true, userId: authUser.user.id });
    } catch (err: any) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route for atomic client creation (SuperAdmin only)
  app.post("/api/admin/clients/create", async (req, res) => {
    const { clientData, adminData } = req.body;
    const authHeader = req.headers.authorization;

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase Admin not configured" });
    }

    try {
      // 1. SECURITY: Verify SuperAdmin
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: requester }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
      
      if (verifyError || !requester) return res.status(401).json({ error: "Invalid session" });

      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', requester.id).single();
      if (!profile || profile.role !== 'SUPERADMIN') {
        return res.status(403).json({ error: "Only SuperAdmin can create clients" });
      }

      // 2. Create Client Record
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert([{
          name: clientData.name,
          nit: clientData.nit,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          city: clientData.city,
          department: clientData.department,
          plan: clientData.plan,
          max_users: clientData.maxUsers,
          allowed_modules: clientData.allowedModules,
          status: 'ACTIVE',
          start_date: new Date().toISOString(),
          expiry_date: clientData.expiryDate
        }])
        .select()
        .single();

      if (clientError) throw clientError;

      // 3. Create Admin User for this Client
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        email_confirm: true,
        user_metadata: { display_name: adminData.name }
      });

      if (authError) {
        // Rollback client creation if user fails (Supabase doesn't support cross-service transactions, so we manual cleanup)
        await supabaseAdmin.from('clients').delete().eq('id', client.id);
        throw authError;
      }

      // 4. Create Profile for the Admin
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: authUser.user.id,
          email: adminData.email,
          display_name: adminData.name,
          client_id: client.id,
          role: 'ADMIN_CLIENTE',
          status: 'ACTIVE',
          allowed_modules: clientData.allowedModules,
          created_at: new Date().toISOString()
        }]);

      if (profileError) throw profileError;

      res.json({ success: true, clientId: client.id, adminId: authUser.user.id });
    } catch (err: any) {
      console.error('Error creating client:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route for getting all clients' usage (SuperAdmin only)
  app.get("/api/admin/client-usage", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    try {
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
      if (verifyError || !user) return res.status(401).json({ error: "Invalid session" });

      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'SUPERADMIN') return res.status(403).json({ error: "Only SuperAdmin can view all usage" });

      // Fetch all clients and join with their usage
      const { data: clients, error: clientsError } = await supabaseAdmin
        .from('clients')
        .select(`
          id,
          name,
          email,
          status,
          client_api_usage (
            total_assigned,
            total_consumed,
            last_query_at,
            status
          )
        `);

      if (clientsError) throw clientsError;
      res.json(clients);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route for adjusting client credits (SuperAdmin only)
  app.post("/api/admin/client-usage/:clientId/adjust", async (req, res) => {
    const { clientId } = req.params;
    const { amount, type, details } = req.body; // type: ASIGNACION, AJUSTE, DEVOLUCION
    const authHeader = req.headers.authorization;

    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    try {
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
      if (verifyError || !user) return res.status(401).json({ error: "Invalid session" });

      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'SUPERADMIN') return res.status(403).json({ error: "Only SuperAdmin can adjust limits" });

      // Get current usage
      let { data: usage, error: usageError } = await supabaseAdmin
        .from('client_api_usage')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (!usage) {
        // Create initial record if it doesn't exist
        const { data: newUsage, error: createError } = await supabaseAdmin
          .from('client_api_usage')
          .insert([{ client_id: clientId, total_assigned: 0, total_consumed: 0 }])
          .select()
          .single();
        if (createError) throw createError;
        usage = newUsage;
      }

      const previousBalance = usage.total_assigned - usage.total_consumed;
      const newAssigned = usage.total_assigned + amount;
      const newBalance = newAssigned - usage.total_consumed;

      // Update assigned total
      const { error: updateError } = await supabaseAdmin
        .from('client_api_usage')
        .update({
          total_assigned: newAssigned,
          status: newBalance > 0 ? 'ACTIVE' : usage.status,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', clientId);

      if (updateError) throw updateError;

      // Record transaction
      await supabaseAdmin
        .from('api_usage_transactions')
        .insert([{
          client_id: clientId,
          user_id: user.id,
          amount: amount,
          transaction_type: type || 'AJUSTE',
          previous_balance: previousBalance,
          new_balance: newBalance,
          details: details || `Ajuste administrativo de saldo`
        }]);

      res.json({ success: true, newBalance });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route for getting client transaction history (SuperAdmin only)
  app.get("/api/admin/client-usage/:clientId/transactions", async (req, res) => {
    const { clientId } = req.params;
    const authHeader = req.headers.authorization;

    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    try {
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
      if (verifyError || !user) return res.status(401).json({ error: "Invalid session" });

      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'SUPERADMIN') return res.status(403).json({ error: "Only SuperAdmin can view transactions" });

      const { data: transactions, error: transError } = await supabaseAdmin
        .from('api_usage_transactions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transError) throw transError;
      res.json(transactions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
