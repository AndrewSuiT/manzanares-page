/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://manzanares.pe',
  generateRobotsTxt: true, // Esto te crea el robots.txt automáticamente
  // Opcional: excluye páginas que no quieres que salgan en Google (ej: admin)
  exclude: ['/admin', '/server-sitemap.xml'], 
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://manzanares.pe/server-sitemap.xml', // Si usas SSR para los productos
    ],
  },
}