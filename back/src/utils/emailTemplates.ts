export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function generateArticleEmailTemplate(
  articleTitle: string,
  articleExcerpt: string,
  articleUrl: string,
  articleAuthor: string
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          .header {
            border-bottom: 3px solid #007bff;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #007bff;
            font-size: 24px;
          }
          .content {
            margin: 20px 0;
          }
          .content h2 {
            color: #007bff;
            margin-top: 0;
          }
          .excerpt {
            background-color: #f0f8ff;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin: 15px 0;
            font-style: italic;
          }
          .meta {
            font-size: 14px;
            color: #666;
            margin: 15px 0;
          }
          .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📰 Nouvel Article Publié</h1>
          </div>
          
          <div class="content">
            <h2>${articleTitle}</h2>
            
            <div class="excerpt">
              ${articleExcerpt}
            </div>
            
            <div class="meta">
              <strong>Auteur:</strong> ${articleAuthor}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString("fr-FR")}
            </div>
            
            <a href="${articleUrl}" class="cta-button">Lire l'article complet →</a>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé depuis votre plateforme de gestion de contenus.</p>
            <p>&copy; ${new Date().getFullYear()} Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    NOUVEL ARTICLE PUBLIÉ
    
    Titre: ${articleTitle}
    
    ${articleExcerpt}
    
    Auteur: ${articleAuthor}
    Date: ${new Date().toLocaleDateString("fr-FR")}
    
    Lire l'article: ${articleUrl}
    
    ---
    Cet email a été envoyé depuis votre plateforme de gestion de contenus.
  `;

  return {
    subject: `Nouvel article: ${articleTitle}`,
    html: html.trim(),
    text: text.trim(),
  };
}

export function generateBulkNotificationTemplate(
  articleTitle: string,
  recipientCount: number
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          .success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .stats {
            background-color: #e7f3ff;
            border: 1px solid #b3d9ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Notification Envoyée avec Succès</h1>
          
          <div class="success">
            <strong>L'article "</strong>${articleTitle}<strong>" a été notifié à</strong> ${recipientCount} <strong>destinataires</strong>
          </div>
          
          <div class="stats">
            <h3>Détails de l'envoi:</h3>
            <ul>
              <li>Article: ${articleTitle}</li>
              <li>Destinataires: ${recipientCount}</li>
              <li>Date d'envoi: ${new Date().toLocaleString("fr-FR")}</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject: `Notification envoyée: ${articleTitle}`,
    html: html.trim(),
    text: `Notification envoyée avec succès pour: ${articleTitle}\nDestinaires: ${recipientCount}`,
  };
}
