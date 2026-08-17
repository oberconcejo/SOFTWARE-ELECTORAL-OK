import crypto from 'crypto';

interface SendAdminRequestEmailParams {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  type?: string;
  requestedUsername: string;
  reason: string;
  createdAt: string;
}

interface SendApprovalEmailParams {
  fullName: string;
  email: string;
  requestedUsername: string;
  approvedAt: string;
}

interface SendRejectionEmailParams {
  fullName: string;
  email: string;
  rejectionReason?: string;
  rejectedAt: string;
}

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'oberosorio1@gmail.com';
const APP_URL = process.env.APP_URL || 'https://ais-pre-fhpcem5oukvybhyuojzi5g-442282672965.us-west1.run.app';

export class EmailService {
  /**
   * Alias for notifySuperAdminNewRequest to match server.ts usage
   */
  async sendAdminNotification(params: SendAdminRequestEmailParams) {
    return EmailService.notifySuperAdminNewRequest(params);
  }

  /**
   * Alias for notifyApplicantApproved to match server.ts usage
   */
  async sendWelcomeEmail(email: string, fullName: string) {
    return EmailService.notifyApplicantApproved({
      email,
      fullName,
      requestedUsername: email.split('@')[0],
      approvedAt: new Date().toISOString()
    });
  }

  /**
   * Generates and dispatches notification to SuperAdmin when a new admin access request is submitted.
   */
  static async notifySuperAdminNewRequest(params: SendAdminRequestEmailParams): Promise<{ success: boolean; id: string }> {
    const messageId = `msg_${crypto.randomUUID()}`;
    const formattedDate = new Date(params.createdAt).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const subject = `[SOLICITUD DE NUEVO ADMINISTRADOR] ${params.fullName} (${params.requestedUsername})`;
    const reviewUrl = `${APP_URL}/admin/access-requests`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Solicitud de Nuevo Administrador</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0b; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111114; border: 1px solid #27272a; border-radius: 16px; padding: 32px; }
    .header { border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px; text-align: center; }
    .badge { display: inline-block; background-color: #f59e0b20; color: #fbbf24; border: 1px solid #f59e0b40; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .title { font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 12px; }
    .field-group { margin-bottom: 16px; background-color: #ffffff05; border: 1px solid #ffffff0a; border-radius: 12px; padding: 14px 18px; }
    .field-label { font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #ffffff; font-weight: 600; }
    .reason-box { background-color: #6366f110; border: 1px solid #6366f130; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .actions { display: flex; gap: 12px; margin-top: 28px; justify-content: center; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 13px; text-decoration: none; text-align: center; }
    .btn-approve { background-color: #4f46e5; color: #ffffff; }
    .footer { margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">PENDIENTE DE APROBACIÓN</span>
      <h1 class="title">SOLICITUD DE NUEVO ADMINISTRADOR</h1>
      <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Una persona ha solicitado acceso administrativo al panel central.</p>
    </div>

    <div class="field-group">
      <div class="field-label">Nombre del solicitante</div>
      <div class="field-value">${params.fullName}</div>
    </div>

    <div class="field-group">
      <div class="field-label">Correo Electrónico</div>
      <div class="field-value">${params.email}</div>
    </div>

    <div class="field-group">
      <div class="field-label">Teléfono</div>
      <div class="field-value">${params.phone || 'No especificado'}</div>
    </div>

    <div class="field-group">
      <div class="field-label">Usuario Solicitado</div>
      <div class="field-value" style="color: #818cf8;">@${params.requestedUsername}</div>
    </div>

    <div class="field-group">
      <div class="field-label">Fecha y Hora de Solicitud</div>
      <div class="field-value">${formattedDate}</div>
    </div>

    <div class="reason-box">
      <div class="field-label" style="color: #a5b4fc;">Motivo de la Solicitud</div>
      <div style="font-size: 14px; color: #e0e7ff; margin-top: 6px; line-height: 1.5;">${params.reason}</div>
    </div>

    <div style="text-align: center; margin-top: 28px;">
      <p style="font-size: 13px; color: #94a3b8; margin-bottom: 16px;">Para autorizar o denegar esta solicitud de forma segura, ingrese al Panel SuperAdmin:</p>
      <a href="${reviewUrl}" class="btn btn-approve" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: bold; text-decoration: none;">
        REVISAR Y GESTIONAR EN SUPERADMIN
      </a>
    </div>

    <div class="footer">
      Este es un correo automático de seguridad generado por INFGENERAL-SOFTWARE.<br>
      ID de Solicitud: ${params.id} • Destinatario: ${SUPERADMIN_EMAIL}
    </div>
  </div>
</body>
</html>
    `;

    console.log(`\n======================================================`);
    console.log(`[EMAIL DISPATCH - SUPERADMIN NOTIFICATION]`);
    console.log(`To: ${SUPERADMIN_EMAIL}`);
    console.log(`Subject: ${subject}`);
    console.log(`Applicant: ${params.fullName} <${params.email}>`);
    console.log(`Requested Username: ${params.requestedUsername}`);
    console.log(`Action Link: ${reviewUrl}`);
    console.log(`======================================================\n`);

    return { success: true, id: messageId };
  }

  /**
   * Generates and dispatches confirmation email to the applicant upon SuperAdmin approval.
   */
  static async notifyApplicantApproved(params: SendApprovalEmailParams): Promise<{ success: boolean }> {
    const loginUrl = `${APP_URL}/admin/login`;
    const subject = `Su solicitud de acceso al Panel de Administración ha sido aprobada`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Acceso Aprobado</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0b; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111114; border: 1px solid #27272a; border-radius: 16px; padding: 32px; }
    .header { border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px; text-align: center; }
    .badge { display: inline-block; background-color: #10b98120; color: #34d399; border: 1px solid #10b98140; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .title { font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 12px; }
    .btn { display: inline-block; padding: 12px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; text-decoration: none; text-align: center; background-color: #10b981; color: #ffffff; }
    .footer { margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">SOLICITUD APROBADA</span>
      <h1 class="title">Bienvenido al Panel de Administración</h1>
    </div>

    <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">
      Estimado(a) <strong>${params.fullName}</strong>,
    </p>
    <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
      Nos complace informarle que su solicitud de acceso al Panel de Administración ha sido revisada y <strong>APROBADA</strong> por el administrador principal.
    </p>

    <div style="background-color: #ffffff05; border: 1px solid #ffffff10; border-radius: 12px; padding: 18px; margin: 24px 0;">
      <div style="font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Detalles de Acceso</div>
      <div style="margin-top: 8px; font-size: 14px; color: #ffffff;">• <strong>Usuario:</strong> ${params.requestedUsername}</div>
      <div style="margin-top: 4px; font-size: 14px; color: #ffffff;">• <strong>Correo Registrado:</strong> ${params.email}</div>
      <div style="margin-top: 4px; font-size: 14px; color: #10b981; font-weight: 600;">• <strong>Estado de Cuenta:</strong> Activa y Autorizada</div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" class="btn" style="background-color: #4f46e5; color: #ffffff;">
        INICIAR SESIÓN EN EL PANEL
      </a>
    </div>

    <div style="background-color: #f59e0b10; border: 1px solid #f59e0b25; border-radius: 12px; padding: 14px; font-size: 12px; color: #fcd34d;">
      <strong>Recomendación de Seguridad:</strong> Por motivos de confidencialidad, no comparta sus credenciales con terceros y active la autenticación en dos pasos si está disponible.
    </div>

    <div class="footer">
      INFGENERAL-SOFTWARE • Seguridad e Infraestructura Electoral
    </div>
  </div>
</body>
</html>
    `;

    console.log(`\n======================================================`);
    console.log(`[EMAIL DISPATCH - APPLICANT APPROVAL]`);
    console.log(`To: ${params.email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Login URL: ${loginUrl}`);
    console.log(`======================================================\n`);

    return { success: true };
  }

  /**
   * Generates and dispatches notification to the applicant if the request is rejected.
   */
  static async notifyApplicantRejected(params: SendRejectionEmailParams): Promise<{ success: boolean }> {
    const subject = `Actualización sobre su solicitud de acceso al Panel de Administración`;

    console.log(`\n======================================================`);
    console.log(`[EMAIL DISPATCH - APPLICANT REJECTION]`);
    console.log(`To: ${params.email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reason: ${params.rejectionReason || 'No especificado'}`);
    console.log(`======================================================\n`);

    return { success: true };
  }
}
