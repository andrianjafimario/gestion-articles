export function generateNotificationPreviewHtml(
  title: string,
  excerpt: string,
  author: string,
  articleUrl: string,
): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; background:#f8fbff; padding:20px;">
      <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #d7e5f8; overflow:hidden;">
        <div style="padding:20px; background:linear-gradient(120deg, #0f6abf, #2d8fdd); color:#fff;">
          <h2 style="margin:0;">Nouvel article publié</h2>
        </div>
        <div style="padding:20px;">
          <h3 style="margin-top:0; color:#123a5f;">${title}</h3>
          <p style="color:#415e78;">${excerpt}</p>
          <p style="color:#5d7288;">Auteur: <strong>${author}</strong></p>
          <a href="${articleUrl}" style="display:inline-block; margin-top:8px; padding:10px 16px; background:#0f6abf; color:#fff; text-decoration:none; border-radius:8px;">
            Lire l'article
          </a>
        </div>
      </div>
    </div>
  `;
}
